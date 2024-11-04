import bcrypt from "bcrypt"

export const hashPassword = (password: string) => bcrypt.hash(password, 10)
export const checkPassword = (password: string, hash: string) => bcrypt.compare(password, hash)