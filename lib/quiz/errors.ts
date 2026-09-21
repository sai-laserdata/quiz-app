/**
 * Errors that should surface to the client with a meaningful status code
 * rather than a generic 500.
 */
export class QuizRequestError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'QuizRequestError';
    this.status = status;
  }
}
