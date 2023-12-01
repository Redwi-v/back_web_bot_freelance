export interface IUpdateProfile {
  file?:Express.Multer.File
  telegramId: string
  name?: string,
  lastName?: string,
  email?: string,
  about?: string,
}
