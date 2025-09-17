import { Router } from 'express'

import { adminAuth } from '../utils/firebase'
import { getUserData } from '../utils/user'

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

    const sessionCookie = await adminAuth.createSessionCookie(accessToken, {
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie('__session', sessionCookie, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })

    return res.status(200).json({
      message: 'Authorization successful',
    })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

/* GET /auth/userInfo */
authRoutes.get('/userInfo', async (req, res) => {
  const sessionCookie = req.cookies['__session']

  try {
    const user = await getUserData(sessionCookie)

    if (user) {
      return res.status(200).json({ data: user })
    }

    return res.status(401).json({ message: 'Unauthorized' })
  } catch (error) {
    console.error('Could not verify session', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

/* POST /auth/logout */
authRoutes.post('/logout', async (req, res) => {
  res.clearCookie('__session', {
    path: '/',
    httpOnly: false,
  })

  return res.status(200).json({
    message: 'Logged out successfully',
  })
})

export { authRoutes }
