import { Request, Response, NextFunction } from 'express'

interface HttpError extends Error {
  status?: number
}

// 錯誤處理 middleware
export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }

  res.status(status).json({
    status,
    message,
  })
}
