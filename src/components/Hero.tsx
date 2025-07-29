import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Fashion model in elegant clothing"
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          ELEGANCE
        </h1>
        <p className="mt-6 text-xl text-white max-w-3xl">
          Timeless style for the modern individual. Our new collection blends contemporary design with sustainable craftsmanship.
        </p>
        <div className="mt-10 flex space-x-4">
          <Link
            to="/products"
            className="inline-block bg-white py-3 px-8 border border-transparent rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            Shop Now
          </Link>
          <Link
            to="/about"
            className="inline-block py-3 px-8 border border-transparent rounded-md text-base font-medium text-white bg-transparent hover:bg-white hover:bg-opacity-10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;