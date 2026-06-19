import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db } from '../config/dynamodb'
import { generateCode } from '../utils/codeGenerator'

export interface UrlRecord {
  code: string
  originalUrl: string
  userId: string
  createdAt: string
  clicks: number
}

const urlsTable = () => process.env.DYNAMODB_TABLE_URLS!

const isCodeTaken = async (code: string): Promise<boolean> => {
  const result = await db.send(new GetCommand({ TableName: urlsTable(), Key: { code } }))
  return !!result.Item
}

export const createUrl = async (originalUrl: string, userId: string): Promise<UrlRecord> => {
  let code: string
  do {
    code = generateCode()
  } while (await isCodeTaken(code))

  const record: UrlRecord = {
    code,
    originalUrl,
    userId,
    createdAt: new Date().toISOString(),
    clicks: 0
  }

  await db.send(new PutCommand({ TableName: urlsTable(), Item: record }))
  return record
}

export const getUrl = async (code: string): Promise<UrlRecord | null> => {
  const result = await db.send(new GetCommand({ TableName: urlsTable(), Key: { code } }))
  return (result.Item as UrlRecord) ?? null
}

export const incrementClicks = async (code: string): Promise<void> => {
  await db.send(new UpdateCommand({
    TableName: urlsTable(),
    Key: { code },
    UpdateExpression: 'SET clicks = clicks + :inc',
    ExpressionAttributeValues: { ':inc': 1 }
  }))
}

export const listUrlsByUser = async (userId: string): Promise<UrlRecord[]> => {
  const result = await db.send(new QueryCommand({
    TableName: urlsTable(),
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId }
  }))
  return (result.Items ?? []) as UrlRecord[]
}
