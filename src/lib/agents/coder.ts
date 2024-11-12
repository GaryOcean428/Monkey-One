import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';
import { tools } from '../tools';

interface CodeAction {
  type: 'write' | 'analyze' | 'execute';
  data: {
    language?: string;
    code?: string;
    file?: string;
    args?: Record<string, unknown>;
  };
}

export class CoderAgent extends BaseAgent {
  private supportedLanguages = ['javascript', 'typescript', 'python', 'shell'];

  constructor(id: string, name: string) {
    super(id, name, 'Coder', [
      'code_writing',
      'code_analysis',
      'code_execution',
      'dependency_management'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Parse the requested code action
      const action = await this.parseCodeAction(message.content);

      // Store action in memory
      await memoryManager.add({
        type: 'code-action',
        content: JSON.stringify(action),
        tags: ['code-action', action.type]
      });

      // Execute the code action
      const result = await this.executeCodeAction(action);

      // Store result in memory
      await memoryManager.add({
        type: 'code-result',
        content: result,
        tags: ['code-result', action.type]
      });

      return this.createResponse(result);
    } catch (error) {
      const errorMessage = `Error executing code action: ${(error as Error).message}`;
      
      await memoryManager.add({
        type: 'error',
        content: errorMessage,
        tags: ['error', 'code-error']
      });

      return this.createResponse(errorMessage);
    }
  }

  private async parseCodeAction(content: string): Promise<CodeAction> {
    const systemPrompt = `You are a code action parser. Analyze the following request and extract:
1. The type of code action needed (write, analyze, execute)
2. The relevant data for that action:
   - language: Programming language to use
   - code: The actual code to write or execute
   - file: File path for writing code
   - args: Arguments for code execution

Valid action types:
- write: Requires language, code, and optionally file path
- analyze: Requires code or file path
- execute: Requires code or file path, and optionally args

Supported languages: ${this.supportedLanguages.join(', ')}`;

    const analysis = await this.xai.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content }
    ]);

    try {
      // Extract action from the analysis
      const parsed = JSON.parse(analysis);
      if (!parsed.type || !parsed.data) {
        throw new Error('Invalid action format');
      }

      // Validate language if specified
      if (parsed.data.language && !this.supportedLanguages.includes(parsed.data.language)) {
        throw new Error(`Unsupported language: ${parsed.data.language}`);
      }

      return parsed as CodeAction;
    } catch (error) {
      throw new Error(`Failed to parse code action: ${(error as Error).message}`);
    }
  }

  private async executeCodeAction(action: CodeAction): Promise<string> {
    switch (action.type) {
      case 'write': {
        if (!action.data.language || !action.data.code) {
          throw new Error('Language and code required for write action');
        }

        // If no file specified, generate one
        const file = action.data.file || this.generateFilename(action.data.language);
        
        // Write code to file
        await tools.execute('writeFile', {
          path: file,
          content: action.data.code
        });

        return `Wrote ${action.data.language} code to ${file}`;
      }

      case 'analyze': {
        if (!action.data.code && !action.data.file) {
          throw new Error('Code or file path required for analysis');
        }

        let codeToAnalyze: string;
        if (action.data.file) {
          // Read code from file
          const result = await tools.execute('readFile', {
            path: action.data.file
          });
          codeToAnalyze = String(result);
        } else if (action.data.code) {
          codeToAnalyze = action.data.code;
        } else {
          throw new Error('No code provided for analysis');
        }

        const analysis = await this.analyzeCode(codeToAnalyze);
        return analysis;
      }

      case 'execute': {
        if (!action.data.code && !action.data.file) {
          throw new Error('Code or file path required for execution');
        }

        let codeToExecute: string;
        if (action.data.file) {
          // Read code from file
          const result = await tools.execute('readFile', {
            path: action.data.file
          });
          codeToExecute = String(result);
        } else if (action.data.code) {
          codeToExecute = action.data.code;
        } else {
          throw new Error('No code provided for execution');
        }

        // Execute the code
        const result = await tools.execute('executeCode', {
          code: codeToExecute,
          args: action.data.args || {}
        });

        return JSON.stringify(result);
      }

      default:
        throw new Error(`Unsupported code action type: ${action.type}`);
    }
  }

  private async analyzeCode(code: string): Promise<string> {
    const systemPrompt = `You are a code analysis assistant. Analyze the following code and provide insights about:
1. Code structure and organization
2. Potential issues or improvements
3. Security considerations
4. Performance implications
5. Best practices adherence`;

    const analysis = await this.xai.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: code }
    ]);

    return analysis;
  }

  private generateFilename(language: string): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(language);
    return `generated_${timestamp}${extension}`;
  }

  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      shell: '.sh'
    };
    return extensions[language] || '';
  }
}
