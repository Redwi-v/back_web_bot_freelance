interface IOrder {
  description: string;
  title: string;
  price: number;
  userTgId: string;
  categories: {id: number}[];
  specializations: {id: number}[]
}

export {
  IOrder
}