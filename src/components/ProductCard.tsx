import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="relative aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
        <img
          src={product.image} // <-- updated from product.images[0]
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
        />
        {product.new && (
          <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1">
            NEW
          </div>
        )}
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
      <p className="mt-1 text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
    </Link>
  );
};

export default ProductCard;
