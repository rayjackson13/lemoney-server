export class HttpError extends Error {
  message: string
  status: number = 400

  constructor(message: string) {
    super(message)
    this.message = message
  }
}

export class ValidationError extends HttpError {
  status = 422
}
