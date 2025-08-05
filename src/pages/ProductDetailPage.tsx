import React, { useState,useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { baseurl } from './ProductsPage';
import { Product, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import ProductCard from '../components/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, directToCheckout } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const { user, isAuthenticated } = useAuth();
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState('');

  const fallbackSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${baseurl}/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data: Product = await response.json();

        // Normalize sizes for selection
        const normalizedSizes = Array.isArray(data.sizes)
          ? data.sizes
          : typeof data.sizes === 'string'
          ? [data.sizes]
          : fallbackSizes;

        setProduct(data);
        setSelectedSize(normalizedSizes[0] || 'M');
        
        // Set default color if colors are available
        const normalizedColors = Array.isArray(data.colors) && data.colors.length > 0
          ? data.colors
          : typeof data.colors === 'string' && data.colors.trim()
          ? data.colors.split(',').map(c => c.trim())
          : [];
        
        if (normalizedColors.length > 0) {
          setSelectedColor(normalizedColors[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    fetch(`${baseurl}/api/reviews/product/${id}`)
      .then(res => res.json())
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [id]);

  // Fetch related products based on category
  useEffect(() => {
    if (!product?.category) return;
    
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`${baseurl}/api/products?category=${encodeURIComponent(product.category)}`);
        if (response.ok) {
          const allProducts: Product[] = await response.json();
          // Filter out the current product and limit to 4 items
          const filtered = allProducts
            .filter(p => p._id !== product._id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };
    
    fetchRelatedProducts();
  }, [product]);

  // Handle image zoom on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Handle image selection from thumbnails
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    if (product) {
      // Include selected color in the cart item if colors are available
      const cartProduct = {
        ...product,
        selectedColor: availableColors.length > 0 ? selectedColor : undefined
      };
      addToCart(cartProduct, quantity, selectedSize);
      toast.success('Product added to cart!');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      // Show a toast message and redirect to login
      toast.info('Please log in to proceed with checkout');
      navigate('/login');
      return;
    }
    
    if (product) {
      // Include selected color in the product for checkout if colors are available
      const checkoutProduct = {
        ...product,
        selectedColor: availableColors.length > 0 ? selectedColor : undefined
      };
      directToCheckout(checkoutProduct, quantity, selectedSize);
    }
  };

  // Review submit handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await fetch(`${baseurl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId: id, rating: reviewRating, comment: reviewComment })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }
      setReviewComment('');
      setReviewRating(5);
      // Refresh reviews
      fetch(`${baseurl}/api/reviews/product/${id}`)
        .then(res => res.json())
        .then(setReviews);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product as any).image
    ? [(product as any).image]
    : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'];

  const availableSizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === 'string'
    ? product.sizes.split(',').map(s => s.trim())
    : fallbackSizes;

  const availableColors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : typeof product.colors === 'string' && product.colors.trim()
    ? product.colors.split(',').map(c => c.trim())
    : [];

  // Color name to display mapping
  const getColorDisplay = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'brown': '#8B4513',
      'green': '#22C55E',
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#EF4444',
      'blue': '#3B82F6',
      'yellow': '#EAB308',
      'gray': '#6B7280',
      'grey': '#6B7280',
      'pink': '#EC4899',
      'purple': '#8B5CF6',
      'orange': '#F97316'
    };
    return colorMap[color.toLowerCase()] || color;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="w-full h-full cursor-zoom-in relative"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={{
                    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                  }}
                />
              </div>
              {/* Zoom indicator */}
              {isZoomed && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Zoom enabled
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {images.slice(0, 4).map((img, index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? 'border-black shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleImageSelect(index)}
                  onMouseEnter={() => handleImageSelect(index)}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.rating || 0}) • 127 reviews
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">{formatINR(product.price)}</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-gray-600 leading-relaxed">
                {product.description ||
                  'Experience premium quality and style with this carefully crafted piece. Made from the finest materials and designed with attention to detail, this product combines comfort, durability, and timeless appeal.'}
              </p>
            </div>

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Color: <span className="capitalize font-bold">{selectedColor}</span>
                </h3>
                <div className="flex items-center space-x-3">
                  {availableColors.map((color) => {
                    const colorValue = getColorDisplay(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-gray-800 scale-110 shadow-lg'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{
                          backgroundColor: colorValue.startsWith('#') ? colorValue : color,
                          border: color.toLowerCase() === 'white' ? '2px solid #e5e7eb' : undefined
                        }}
                        title={color}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${
                              color.toLowerCase() === 'white' || color.toLowerCase() === 'yellow'
                                ? 'bg-gray-800'
                                : 'bg-white'
                            }`} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm font-medium transition-all duration-200 rounded-md ${
                      selectedSize === size
                        ? 'border-gray-800 bg-gray-800 text-white shadow-md'
                        : 'border-gray-300 text-gray-700 hover:border-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={decrementQuantity}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full py-3 px-6 rounded-md border transition-colors flex items-center justify-center space-x-2 ${
                  isWishlisted
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Free shipping on orders over ₹2000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">30-day return policy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">2-year warranty included</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Reviews</h2>
              {reviews.length === 0 && <p>No reviews yet.</p>}
              <ul className="mb-4">
                {reviews.map(r => (
                  <li key={r._id} className="mb-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{typeof r.user === 'object' ? r.user.name : 'User'}</span>
                      <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <div className="text-gray-700">{r.comment}</div>}
                    <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
              {isAuthenticated && (
                <form onSubmit={handleReviewSubmit} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <label>Rating:</label>
                    <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="border rounded px-2 py-1">
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full border rounded px-2 py-1 mb-2"
                    rows={2}
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  {reviewError && <div className="text-red-500 mt-1">{reviewError}</div>}
                </form>
              )}
              {!isAuthenticated && <p className="text-gray-500">Log in to write a review.</p>}
            </div>
          </div>
        </div>
      </div>
      
      {/* You may also like section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="group">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
