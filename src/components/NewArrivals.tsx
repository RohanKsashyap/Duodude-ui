import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import axios from 'axios';

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await axios.get('/api/products?sort=createdAt&limit=8');

        // Check if response is an array or object
        const fetchedProducts = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('❌ Failed to load new arrivals:', error);
        setProducts([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">New Arrivals</h2>
          <Link
            to="/products?sort=createdAt"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading new products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No new arrivals found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
