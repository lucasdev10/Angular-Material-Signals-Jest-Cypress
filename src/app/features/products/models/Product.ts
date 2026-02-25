export interface IProductService {
  getProducts(): IProduct[];
  getProductById(id: string): IProduct;
  addProduct(product: IProduct): void;
  updateProduct(id: string, product: IProduct): void;
  deleteProduct(id: string): void;
}

export interface IProduct {
  id?: string;
  name: string;
  price: number;
  description: string;
}
