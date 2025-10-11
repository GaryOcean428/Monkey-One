import { LLMProvider } from '../../lib/llm/providers/base'
import { Tool, ToolParams, ToolResult } from '../registry/Tool'

interface CodeAnalysisParams extends ToolParams {
  code: string
  type: 'analysis' | 'refactor' | 'optimize' | 'security' | 'docs'
  options?: {
    maxSuggestions?: number
    minConfidence?: number
    includeExamples?: boolean
  }
}

interface CodeAnalysisResult extends ToolResult {
  data: {
    summary: string
    suggestions?: string[]
    examples?: string[]
    confidence: number
    metadata: {
      analysisType: string
      timestamp: number
      modelUsed: string
    }
  }
}

interface LLMAnalysisResponse {
  summary: string
  suggestions?: string[]
  examples?: string[]
  confidence: number
  metadata: {
    analysisType: string
    timestamp: string
    model: string
  }
}

export class CodeAnalysisTool extends Tool {
  private llmProvider: LLMProvider

  constructor(llmProvider: LLMProvider) {
    super({
      name: 'code_analysis_tool',
      description: 'AI-powered code analysis and improvement suggestions',
      version: '1.0.0',
      author: 'Monkey One Team',
      capabilities: [
        'code_analysis',
        'refactoring',
        'optimization',
        'security_review',
        'documentation',
      ],
    })

    this.llmProvider = llmProvider
  }

  public async execute(params: CodeAnalysisParams): Promise<CodeAnalysisResult> {
    try {
      this.validateParams(params)

      const prompt = this.buildPrompt(params)
      const analysis = await this.llmProvider.analyze(prompt)

      return this.processAnalysis(analysis as LLMAnalysisResponse, params)
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('Code analysis failed unexpectedly')
      return this.createErrorResult(normalizedError)
    }
  }

  private buildPrompt(params: CodeAnalysisParams): string {
    const { code, type, options } = params
    let prompt = ''

    switch (type) {
      case 'analysis':
        prompt = `Analyze the following code and provide insights:
                 Include: architecture, patterns, potential issues
                 ${options?.includeExamples ? 'Include example improvements' : ''}

                 Code:
                 ${code}`
        break

      case 'refactor':
        prompt = `Suggest refactoring improvements for the following code:
                 Focus on: readability, maintainability, best practices
                 Max suggestions: ${options?.maxSuggestions || 3}

                 Code:
                 ${code}`
        break

      case 'optimize':
        prompt = `Analyze performance optimization opportunities:
                 Focus on: efficiency, resource usage, algorithmic improvements
                 Include concrete examples and benchmarks

                 Code:
                 ${code}`
        break

      case 'security':
        prompt = `Perform a security review of the following code:
                 Check for: vulnerabilities, best practices, security patterns
                 Include specific recommendations

                 Code:
                 ${code}`
        break

      case 'docs':
        prompt = `Generate comprehensive documentation for the code:
                 Include: overview, parameters, return values, examples
                 Format in markdown

                 Code:
                 ${code}`
        break

      default:
        throw new Error(`Unsupported analysis type: ${type}`)
    }

    return prompt
  }

  private processAnalysis(
    analysis: LLMAnalysisResponse,
    params: CodeAnalysisParams
  ): CodeAnalysisResult {
    // TODO: Implement proper analysis processing
    return {
      success: true,
      data: {
        summary: analysis.summary || 'Analysis completed',
        suggestions: analysis.suggestions || [],
        examples: params.options?.includeExamples ? analysis.examples || [] : undefined,
        confidence: analysis.confidence || 0.8,
        metadata: {
          analysisType: params.type,
          timestamp: Date.now(),
          modelUsed: this.llmProvider.getModelInfo().name,
        },
      },
    }
  }

  protected validateParams(params: CodeAnalysisParams): void {
    super.validateParams(params)

    if (!params.code || typeof params.code !== 'string') {
      throw new Error('Code parameter is required and must be a string')
    }

    if (
      !params.type ||
      !['analysis', 'refactor', 'optimize', 'security', 'docs'].includes(params.type)
    ) {
      throw new Error('Invalid analysis type')
    }

    if (
      params.options?.minConfidence &&
      (typeof params.options.minConfidence !== 'number' ||
        params.options.minConfidence < 0 ||
        params.options.minConfidence > 1)
    ) {
      throw new Error('minConfidence must be a number between 0 and 1')
    }
  }

  protected createErrorResult(error: Error): CodeAnalysisResult {
    return {
      success: false,
      data: {
        summary: 'Analysis failed',
        confidence: 0,
        metadata: {
          analysisType: 'error',
          timestamp: Date.now(),
          modelUsed: this.llmProvider.getModelInfo().name,
        },
      },
      error,
    }
  }
}
