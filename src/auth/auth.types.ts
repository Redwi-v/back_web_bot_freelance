import { Prisma } from "@prisma/client"

interface ICreateUserData extends Prisma.UserCreateInput{
  specializationIdentifiers: {id: number}[]
  categoriesIdentifiers: {id: number}[]
  activeRoleIndex: string
}

export type {
  ICreateUserData
}