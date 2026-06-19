import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'
import { db } from '../config/dynamodb'

interface UserRecord {
  email: string
  passwordHash: string
  createdAt: string
}

const usersTable = () => process.env.DYNAMODB_TABLE_USERS!

export const createUser = async (email: string, password: string): Promise<void> => {
  const existing = await db.send(new GetCommand({ TableName: usersTable(), Key: { email } }))
  if (existing.Item) throw new Error('EMAIL_TAKEN')

  const passwordHash = await bcrypt.hash(password, 10)
  await db.send(new PutCommand({
    TableName: usersTable(),
    Item: { email, passwordHash, createdAt: new Date().toISOString() } satisfies UserRecord
  }))
}

export const verifyUser = async (email: string, password: string): Promise<string> => {
  const result = await db.send(new GetCommand({ TableName: usersTable(), Key: { email } }))
  if (!result.Item) throw new Error('INVALID_CREDENTIALS')

  const user = result.Item as UserRecord
  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) throw new Error('INVALID_CREDENTIALS')

  return email
}
