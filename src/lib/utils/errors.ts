import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR', 422);
  }
}

export function toApiError(err: unknown): Response {
  if (err instanceof AppError) {
    return Response.json({ error: err.message, code: err.code }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return Response.json({ error: message, code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  if (err instanceof Response) return err;
  console.error('Unhandled error:', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  return Response.json({ error: message }, { status: 500 });
}
