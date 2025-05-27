const { verifyToken } = require('../utils/jwt')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供 token' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: '無效 token' })
  }
}

module.exports = authMiddleware
