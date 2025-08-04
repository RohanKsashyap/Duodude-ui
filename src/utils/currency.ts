// Currency conversion utility
// You can update this rate or fetch from an API for real-time rates
export const USD_TO_INR_RATE = 83; // Approximate rate, update as needed

export const convertUSDToINR = (usdAmount: number): number => {
  return usdAmount * USD_TO_INR_RATE;
};

export const formatINR = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatPrice = (usdPrice: number): string => {
  return formatINR(convertUSDToINR(usdPrice));
};
