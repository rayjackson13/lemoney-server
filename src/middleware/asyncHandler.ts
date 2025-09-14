import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../types/HttpError'

type RouteFunction = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export const asyncHandler =
  (callback: RouteFunction) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await callback(req, res, next)
    } catch (e) {
      if (e instanceof HttpError) {
        res.status(e.status).json({ message: e.message })
        return
      }

      res.status(500).json({ message: 'Internal server error' })
    }
  }
