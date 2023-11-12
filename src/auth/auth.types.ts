import { Prisma } from "@prisma/client"

interface ICreateUserData extends Prisma.UserCreateInput{
  specializationIdentifiers: {id: number}[]
  categoriesIdentifiers: {id: number}[]
  activeRoleIndex: string
}

 enum SortingValues {
  PRICE = 'price',
  RATING = 'rating',
}
interface IFreelanceQueryParams  {
  minPrice?: string,
  maxPrice?: string,
  categories?:  string
  specializations?:  string

  sorting?: SortingValues
  term?: string
  sortType?: string

}
interface IFreelanceFindParams  {
  minPrice: number | null;
  maxPrice: number | null;
  categories: number[] | null;
  specializations: number[] | null;
  sorting: SortingValues | undefined;
  term: string | undefined;
  sortType: string | null
}

export  {
  ICreateUserData,
  IFreelanceQueryParams,
  IFreelanceFindParams,
  SortingValues,
}


