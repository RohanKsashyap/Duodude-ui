import React from 'react';
import ContactPage from './ContactPage';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Fashion workshop"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Our Story
          </h1>
          <p className="mt-6 text-xl text-white max-w-3xl">
            Founded in 2025, DuoDude was born from a passion for sustainable fashion and timeless design.
          </p>
        </div>
      </div>
      
      {/* Mission section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            We believe that fashion should be both beautiful and responsible. Our mission is to create clothing that stands the test of time, both in style and durability, while minimizing our environmental impact.
          </p>
        </div>
      </div>
      
      {/* Values section */}
      <div className="bg-gray-50" id="sustainability">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Sustainability</h2>
              <p className="mt-4 text-lg text-gray-500">
                Sustainability isn't just a buzzword for us—it's at the core of everything we do. From sourcing eco-friendly materials to ensuring ethical manufacturing practices, we're committed to reducing our environmental footprint.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Organic Materials</h3>
                    <p className="mt-2 text-base text-gray-500">
                      We use organic cotton, linen, and other natural fibers that are grown without harmful pesticides or fertilizers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Ethical Production</h3>
                    <p className="mt-2 text-base text-gray-500">
                      All our garments are made in facilities that ensure fair wages and safe working conditions for all employees.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Reduced Waste</h3>
                    <p className="mt-2 text-base text-gray-500">
                      We've implemented a zero-waste policy in our production process, ensuring that fabric scraps are repurposed or recycled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Sustainable fabric production"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Team</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            We're a small team of passionate designers and craftspeople dedicated to creating beautiful, sustainable clothing.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <img
              className="mx-auto h-40 w-40 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
              alt="Team member"
            />
            <h3 className="mt-6 text-base font-semibold text-gray-900">Shiv Rai</h3>
            <p className="text-sm text-gray-500">CO-Founder & Creative Director</p>
          </div>
          <div className="text-center">
            <img
              className="mx-auto h-40 w-40 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
              alt="Team member"
            />
            <h3 className="mt-6 text-base font-semibold text-gray-900">Rohan Kashyap</h3>
            <p className="text-sm text-gray-500">CO-Founder & Creative Director</p>
          </div>
          <div className="text-center">
            <img
              className="mx-auto h-40 w-40 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
              alt="Team member"
            />
            <h3 className="mt-6 text-base font-semibold text-gray-900">Sanjana Rai</h3>
            <p className="text-sm text-gray-500">Head  Designer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;