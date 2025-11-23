
export const formatPrice = (price: number) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  } catch (e) {
    return `$${(price || 0).toFixed(2)}`;
  }
};
