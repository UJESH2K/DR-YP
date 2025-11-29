// src/types/index.ts
export type Item = {
  id: string
  title: string
  subtitle?: string
  image: string
  tags: string[]
  category: string
  priceTier: 'low' | 'mid' | 'high'
  brand: string
  price: number
  description: string
  sizes: string[]
  colors: string[]
}

export interface ProductVariant {
  _id: string;
  options: { [key: string]: string };
  price: number;
  stock: number;
  images?: string[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  images: string[];
  basePrice: number;
  stock: number;
  options?: ProductOption[];
  variants?: ProductVariant[];
  tags?: string[];
  isActive: boolean;
  vendor: {
    _id: string;
    name: string;
  };
  rating: number;
  reviews: number;
  likes: number;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

// Conversion functions
export const productToItem = (product: Product): Item => {
  // Determine price tier based on basePrice
  const getPriceTier = (price: number): 'low' | 'mid' | 'high' => {
    if (price < 50) return 'low';
    if (price < 150) return 'mid';
    return 'high';
  };

  // Extract sizes and colors from options if available
  const sizes: string[] = [];
  const colors: string[] = [];
  
  if (product.options) {
    product.options.forEach(option => {
      if (option.name.toLowerCase() === 'size') {
        sizes.push(...option.values);
      }
      if (option.name.toLowerCase() === 'color') {
        colors.push(...option.values);
      }
    });
  }

  return {
    id: product._id,
    title: product.name,
    image: product.images[0] || '', // Use first image
    tags: product.tags || [],
    category: product.category,
    priceTier: getPriceTier(product.basePrice),
    brand: product.brand,
    price: product.basePrice,
    description: product.description,
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'], // Default sizes
    colors: colors.length > 0 ? colors : ['Black', 'White', 'Blue'] // Default colors
  };
};

export const isProduct = (item: any): item is Product => {
  return item && typeof item === 'object' && '_id' in item && 'basePrice' in item;
};

export const isItem = (item: any): item is Item => {
  return item && typeof item === 'object' && 'id' in item && 'price' in item;
};