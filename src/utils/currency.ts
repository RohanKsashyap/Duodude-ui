// Currency utility - all prices are stored and displayed in Indian Rupees
export const formatINR = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Alias for formatINR for backward compatibility
export const formatPrice = (price: number): string => {
  return formatINR(price);
};
