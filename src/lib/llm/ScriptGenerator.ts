import { llmManager } from './providers';
import type { Message } from '@/types';

interface GeneratedScript {
  language: 'python' | 'javascript';
  code: string;
  purpose: string;
  usage: string;
}

export class ScriptGenerator {
  async generateHelperScript(
    task: string,
    language: 'python' | 'javascript' = 'python'
  ): Promise<GeneratedScript> {
    const prompt = `Generate a helper script in ${language} for the following task:
    ${task}
    
    The script should:
    1. Be well-documented
    2. Include error handling
    3. Be reusable
    4. Include usage examples
    
    Provide the code and explain its purpose and usage.`;

    const response = await llmManager.sendMessage(prompt);
    
    return {
      language,
      code: this.extractCode(response),
      purpose: this.extractSection(response, 'Purpose'),
      usage: this.extractSection(response, 'Usage')
    };
  }

  private extractCode(response: string): string {
    const codeRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeRegex)];
    return matches.map(m => m[1].trim()).join('\n\n');
  }

  private extractSection(response: string, section: string): string {
    const sectionRegex = new RegExp(
      `${section}:?\\s*([\\s\\S]*?)(?=\\n\\s*(?:[A-Z][a-z]+:)|$)`,
      'i'
    );
    const match = response.match(sectionRegex);
    return match ? match[1].trim() : '';
  }
}