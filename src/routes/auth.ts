import { Router } from 'express'

import { adminAuth } from '../utils/firebase'
import { checkUser } from '../middleware/checkUser'

type LoginRequestParams = {
  accessToken: string
}

const authRoutes = Router()

const checkTokenValidity = async (token: string): Promise<boolean> => {
  if (!token) return false

  const decodedToken = await adminAuth.verifyIdToken(token)
  return !!decodedToken
}

/* POST /auth/login */
authRoutes.post('/login', async (req, res) => {
  try {
    const { accessToken }: LoginRequestParams = req.body

    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({
        message: 'Missing or invalid access token',
      })
    }

    const isValid = await checkTokenValidity(accessToken)

    if (!isValid) {
      res.status(401).json({
        message: 'There was a problem with Firebase authentication',
      })
      return
    }

    const token = await adminAuth.createSessionCookie(accessToken, {
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      message: 'Authorization successful',
      token,
    })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

/* GET /auth/userInfo */
authRoutes.get('/userInfo', checkUser, async (req, res) => {
  return res.status(200).json({ data: req.user })
})

/* POST /auth/logout */
authRoutes.post('/logout', async (req, res) => {
  // TODO: de-activate token

  return res.status(200).json({
    message: 'Logged out successfully',
  })
})

export { authRoutes }
