import type { NextFunction, Request, Response } from 'express'
import { getUserData } from '../utils/user'

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies['__session']

  try {
    const user = await getUserData(sessionCookie)

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized access denied' })
    }

    req.user = user
    next()
  } catch (e) {
    next(e) // pass error to global error handler
  }
}
