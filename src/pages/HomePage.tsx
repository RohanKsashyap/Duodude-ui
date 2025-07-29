import React from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import NewArrivals from '../components/NewArrivals';
import CategoryBanner from '../components/CategoryBanner';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <CategoryBanner />
      <NewArrivals />
      
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sustainable Fashion</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our commitment to sustainability goes beyond just using eco-friendly materials. 
              We ensure ethical manufacturing practices and fair wages for all workers involved in creating our products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;