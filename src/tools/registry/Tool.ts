export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  capabilities: string[];
}

export interface ToolParams {
  [key: string]: any;
}

export interface ToolResult {
  success: boolean;
  data: any;
  error?: Error;
}

export abstract class Tool {
  protected metadata: ToolMetadata;

  constructor(metadata: ToolMetadata) {
    this.validateMetadata(metadata);
    this.metadata = metadata;
  }

  public getMetadata(): ToolMetadata {
    return { ...this.metadata };
  }

  public abstract execute(params: ToolParams): Promise<ToolResult>;

  protected validateMetadata(metadata: ToolMetadata): void {
    if (!metadata.name || typeof metadata.name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }
    if (!metadata.description || typeof metadata.description !== 'string') {
      throw new Error('Tool description is required and must be a string');
    }
    if (!metadata.version || typeof metadata.version !== 'string') {
      throw new Error('Tool version is required and must be a string');
    }
    if (!metadata.author || typeof metadata.author !== 'string') {
      throw new Error('Tool author is required and must be a string');
    }
    if (!Array.isArray(metadata.capabilities)) {
      throw new Error('Tool capabilities must be an array');
    }
  }

  protected validateParams(params: ToolParams): void {
    if (!params || typeof params !== 'object') {
      throw new Error('Tool params must be an object');
    }
  }

  protected createSuccessResult(data: any): ToolResult {
    return {
      success: true,
      data
    };
  }

  protected createErrorResult(error: Error): ToolResult {
    return {
      success: false,
      data: null,
      error
    };
  }
}
