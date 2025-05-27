const bcrypt = require('bcrypt')
const { db } = require('../connection/dbConnection')
const { users } = require('../connection/schema/users')
const { signToken } = require('../utils/jwt')
const { eq } = require('drizzle-orm');


const registerUser = async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ message: '請輸入 email 和密碼' })

  const existing = await db.select().from(users).where(eq(users.email,email))
  if (existing.length > 0) return res.status(409).json({ message: '此 email 已註冊' })

  const passwordHash = await bcrypt.hash(password, 10)

  const newUser = await db.insert(users).values({
    email,
    passwordHash,
    name
  }).returning()

  const token = signToken({ id: newUser[0].id })

  res.status(201).json({ message: '註冊成功', token, user: { id: newUser[0].id, email } })
}

const loginUser = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: '請輸入 email 和密碼' })

  const existing = await db.select().from(users).where(eq(users.email, email))
  const user = existing[0]

  if (!user) return res.status(404).json({ message: '使用者不存在' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: '密碼錯誤' })

  const token = signToken({ id: user.id })

  res.json({ message: '登入成功', token, user: { id: user.id, email: user.email } })
}

const getMe = async (req, res) => {
  res.json({ message: '你是誰', user: req.user })
}

module.exports = { registerUser, loginUser, getMe }
