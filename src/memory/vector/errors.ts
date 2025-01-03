export class VectorStoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VectorStoreError'
  }
}

export class VectorStoreConnectionError extends VectorStoreError {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`Connection error: ${message}`)
    this.name = 'VectorStoreConnectionError'
  }
}

export class VectorStoreValidationError extends VectorStoreError {
  constructor(message: string) {
    super(`Validation error: ${message}`)
    this.name = 'VectorStoreValidationError'
  }
}

export class VectorStoreOperationError extends VectorStoreError {
  constructor(
    operation: string,
    message: string,
    public readonly cause?: Error
  ) {
    super(`Operation '${operation}' failed: ${message}`)
    this.name = 'VectorStoreOperationError'
  }
}
