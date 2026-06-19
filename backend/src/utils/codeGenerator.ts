import { randomInt } from 'crypto'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const generateCode = (): string =>
  Array.from({ length: 6 }, () => CHARS[randomInt(CHARS.length)]).join('')
