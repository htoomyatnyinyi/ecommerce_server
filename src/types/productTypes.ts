export interface GetProductsQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: "price" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateNewProductRequest {
  title: string;
  description: string;
  brandName?: string | undefined;
  categoryName?: string | undefined;
  variants: VariantRequest[];
  images?: ImageRequest[];
  categoryId?: string;
  brandId?: string;
}

export interface CategoryRequest {
  categoryName: string;
}

export interface BrandRequest {
  brandName: string;
}

export interface VariantRequest {
  sku: string;
  price: number | string;
  stock: number | string;
  variantOptions?: VariantOptionRequest[];
}

export interface VariantOptionRequest {
  attributeName: string;
  attributeValue: string;
}

export interface ImageRequest {
  url: string;
  altText: string;
  isPrimary?: boolean;
}

export interface CartRequest {
  userId: string; // check later
  items?: CartItemRequest[];
}

export interface CartItemRequest {
  productId: string; //
  variantId: string; //
  quantity: number;
}

export interface OrderRequest {
  userId: string; //
  totalPrice: number;
  status?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: string; //
  variantId: string; //
  quantity: number;
  price: string;
}
