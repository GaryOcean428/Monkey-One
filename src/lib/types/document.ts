export type DocumentType = 'text' | 'markdown' | 'pdf' | 'doc' | 'docx' | 'code' | 'json' | 'yaml'

export type DocumentStatus = 'pending' | 'processing' | 'processed' | 'failed'

export interface DocumentMetadata {
  type: DocumentType
  size: number
  lastModified: number
  mimeType: string
  encoding?: string
  language?: string
  author?: string
  createdAt?: number
  modifiedAt?: number
  version?: string
  tags?: string[]
  categories?: string[]
  permissions?: {
    read: string[]
    write: string[]
  }
}

export interface ProcessedDocument {
  id: string
  filename: string
  content: string
  metadata: DocumentMetadata
  vector?: number[]
  chunks?: {
    id: string
    content: string
    vector: number[]
    metadata: Record<string, unknown>
  }[]
  status: DocumentStatus
  error?: string
  processingStats?: {
    startTime: number
    endTime: number
    chunkCount: number
    tokenCount: number
    vectorDimensions: number
  }
}

export interface DocumentProcessingOptions {
  chunkSize?: number
  chunkOverlap?: number
  includeMetadata?: boolean
  extractImages?: boolean
  ocrEnabled?: boolean
  languageDetection?: boolean
  maxTokens?: number
  preserveFormatting?: boolean
  outputFormat?: DocumentType
}

export interface DocumentSearchQuery {
  query: string
  type?: DocumentType[]
  dateRange?: {
    start: number
    end: number
  }
  tags?: string[]
  categories?: string[]
  author?: string
  limit?: number
  offset?: number
  minScore?: number
  includeContent?: boolean
  sortBy?: 'relevance' | 'date' | 'size'
  sortOrder?: 'asc' | 'desc'
}

export interface DocumentStats {
  totalDocuments: number
  totalSize: number
  byType: Record<DocumentType, number>
  byStatus: Record<DocumentStatus, number>
  averageProcessingTime: number
  vectorDimensions: number
  lastUpdated: number
}

export interface DocumentConversionResult {
  success: boolean
  outputPath?: string
  outputType?: DocumentType
  error?: string
  warnings?: string[]
  metadata?: DocumentMetadata
}
