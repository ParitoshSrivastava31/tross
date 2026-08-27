export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly retryable: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isAppError(err: unknown): err is AppError {
  return (
    err instanceof AppError ||
    (typeof err === 'object' && err !== null && 'statusCode' in err && 'code' in err)
  );
}

export class InvalidUrlError extends AppError {
  constructor(message: string = 'Invalid LinkedIn profile URL', details?: unknown) {
    super(message, 400, 'INVALID_LINKEDIN_URL', details, false);
    this.name = 'InvalidUrlError';
  }
}

export class ProfileNotFoundError extends AppError {
  constructor(slug: string, details?: unknown) {
    super(`LinkedIn profile "${slug}" was not found or is private`, 404, 'PROFILE_NOT_FOUND', details, false);
    this.name = 'ProfileNotFoundError';
  }
}

export class AuthRequiredError extends AppError {
  constructor(message: string = 'Valid LinkedIn session credentials (li_at cookie) required for this action', details?: unknown) {
    super(message, 401, 'AUTH_REQUIRED', details, false);
    this.name = 'AuthRequiredError';
  }
}

export class RateLimitExceededError extends AppError {
  constructor(message: string = 'LinkedIn rate limit reached. Please back off or rotate credentials.', details?: unknown) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details, true);
    this.name = 'RateLimitExceededError';
  }
}

export class ScrapeFailedError extends AppError {
  constructor(message: string = 'Failed to extract profile data from LinkedIn', details?: unknown, retryable: boolean = true) {
    super(message, 502, 'SCRAPE_FAILED', details, retryable);
    this.name = 'ScrapeFailedError';
  }
}
