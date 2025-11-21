// This file will serve as the single source of truth for shared type definitions.

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
