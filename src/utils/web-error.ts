export class WebError extends Error {
  public status: number

  constructor(message: string, options?: { cause?: Error; status?: number }) {
    super(message, options)
    this.name = 'WebError'
    this.status = options?.status ?? 500
  }
}
