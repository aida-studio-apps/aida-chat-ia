import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  const fullError = [
    error?.status,
    error?.code,
    error?.error?.message || error?.message,
  ]
    .filter(Boolean)
    .join(' | ');

  res.status(error?.status || 500).json({
    error: fullError || String(error),
  });
}

