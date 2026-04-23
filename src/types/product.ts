export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductSize {
  ml: number;
  price: number; // in pence
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // default 50ml price in pence
  scentNotes: ScentNotes;
  sizes: ProductSize[];
  stock: number;
  imageUrl: string;
  imageAlt: string;
  category: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
