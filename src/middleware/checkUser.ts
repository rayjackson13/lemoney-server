import type { NextFunction, Request, Response } from 'express'
import { getUserData } from '../utils/user'

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
  const rawAuth = req.headers.authorization
  const token = rawAuth?.replace(/Bearer\s+/, '')

  try {
    const user = await getUserData(token)

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized access denied' })
    }

    req.user = user
    next()
  } catch (e) {
    next(e) // pass error to global error handler
  }
}
