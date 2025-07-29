import React from 'react';
import { Link } from 'react-router-dom';

const CategoryBanner: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6 lg:gap-x-8">
          <div className="relative group">
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-90 transition-opacity duration-300">
              <img
                src="https://images.unsplash.com/photo-1516914589923-f105f1535f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Men's collection"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">Men's Collection</h3>
                <Link
                  to="/products?category=men"
                  className="mt-4 inline-block bg-white py-2 px-6 text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-90 transition-opacity duration-300">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Women's collection"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">Women's Collection</h3>
                <Link
                  to="/products?category=women"
                  className="mt-4 inline-block bg-white py-2 px-6 text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;