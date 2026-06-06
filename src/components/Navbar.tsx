import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, LogOut, Settings, Package, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  images: string[];
  category?: string;
}

interface SubCategory {
  label: string;
  value: string;
}

interface NavCategory {
  label: string;
  href: string;
  subCategories: SubCategory[];
}

const NO_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2QxZDVkYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Nav categories with sub-categories
const NAV_CATEGORIES: NavCategory[] = [
  {
    label: 'Men',
    href: '/products?category=men',
    subCategories: [
      { label: 'New Arrivals', value: 'men-new' },
      { label: 'T-Shirts', value: 'men-tshirts' },
      { label: 'Shirts', value: 'men-shirts' },
      { label: 'Jeans', value: 'men-jeans' },
      { label: 'Trousers', value: 'men-trousers' },
      { label: 'Jackets & Coats', value: 'men-jackets' },
      { label: 'Activewear', value: 'men-activewear' },
      { label: 'Footwear', value: 'men-footwear' },
      { label: 'Accessories', value: 'men-accessories' },
      { label: 'Sale', value: 'men-sale' },
    ],
  },
  {
    label: 'Women',
    href: '/products?category=women',
    subCategories: [
      { label: 'New Arrivals', value: 'women-new' },
      { label: 'Dresses', value: 'women-dresses' },
      { label: 'Tops & Blouses', value: 'women-tops' },
      { label: 'Jeans', value: 'women-jeans' },
      { label: 'Trousers', value: 'women-trousers' },
      { label: 'Skirts', value: 'women-skirts' },
      { label: 'Jackets & Coats', value: 'women-jackets' },
      { label: 'Activewear', value: 'women-activewear' },
      { label: 'Footwear', value: 'women-footwear' },
      { label: 'Sale', value: 'women-sale' },
    ],
  },
  {
    label: 'Accessories',
    href: '/products?category=accessories',
    subCategories: [
      { label: 'Bags & Wallets', value: 'acc-bags' },
      { label: 'Belts', value: 'acc-belts' },
      { label: 'Caps & Hats', value: 'acc-caps' },
      { label: 'Sunglasses', value: 'acc-sunglasses' },
      { label: 'Watches', value: 'acc-watches' },
      { label: 'Jewellery', value: 'acc-jewellery' },
      { label: 'Scarves', value: 'acc-scarves' },
      { label: 'Socks', value: 'acc-socks' },
    ],
  },
  {
    label: 'New Arrivals',
    href: '/products?category=new',
    subCategories: [
      { label: 'New This Week', value: 'new-week' },
      { label: 'Trending Now', value: 'new-trending' },
      { label: 'Best Sellers', value: 'new-bestsellers' },
      { label: 'Limited Edition', value: 'new-limited' },
    ],
  },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/api/products?search=${encodeURIComponent(query)}`);
      const products: Product[] = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];
      setSuggestions(products.slice(0, 6));
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeSearch();
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (product: Product) => {
    closeSearch();
    navigate(`/products/${product._id}`);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        closeSearch();
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Dropdown hover handlers with delay to prevent flicker
  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  const showDropdown = isSearchOpen && searchQuery.trim().length > 0;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Left: hamburger + logo */}
          <div className="flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://ik.imagekit.io/rohanKashyap/Duodude_images/logo/duodudelogo.png?updatedAt=1753712339931"
                alt="DuoDude logo"
                className="h-16 w-20"
              />
            </Link>
          </div>

          {/* Center: nav links with mega dropdown */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>

            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.label)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Category trigger */}
                <Link
                  to={cat.href}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeDropdown === cat.label
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {cat.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === cat.label ? 'rotate-180' : ''
                    }`}
                  />
                </Link>

                {/* Mega dropdown panel */}
                {activeDropdown === cat.label && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-56 bg-white shadow-xl border-t-2 border-black z-50"
                    onMouseEnter={() => handleMouseEnter(cat.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <ul className="py-3">
                      {/* Link to browse all in this category */}
                      <li>
                        <Link
                          to={cat.href}
                          className="block px-5 py-2 text-xs font-bold uppercase tracking-widest text-gray-900 hover:bg-gray-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          View All {cat.label}
                        </Link>
                      </li>
                      <li className="border-t border-gray-100 my-1" />
                      {cat.subCategories.map((sub) => (
                        <li key={sub.value}>
                          <Link
                            to={`/products?category=${encodeURIComponent(sub.value)}`}
                            className="block px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/about"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right: search, user, cart */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div ref={searchContainerRef} className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products..."
                    className="w-48 sm:w-64 border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="ml-1 text-gray-500 hover:text-gray-800"
                    aria-label="Close search"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={openSearch}
                  className="text-gray-700 hover:text-gray-900"
                  aria-label="Open search"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Suggestions dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {isSearching ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                  ) : suggestions.length > 0 ? (
                    <>
                      <ul>
                        {suggestions.map((product, index) => (
                          <li key={product._id}>
                            <button
                              onClick={() => handleSuggestionClick(product)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                index === activeIndex ? 'bg-gray-100' : ''
                              }`}
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                                <img
                                  src={product.image || product.images?.[0] || NO_IMAGE}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = NO_IMAGE;
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                                {product.category && (
                                  <p className="text-xs text-gray-400 truncate capitalize">
                                    {product.category}
                                  </p>
                                )}
                              </div>
                              <span className="flex-shrink-0 text-sm font-semibold text-gray-800">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={handleSearchSubmit as unknown as React.MouseEventHandler}
                        className="w-full px-4 py-2.5 text-sm text-center text-gray-600 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 transition-colors"
                      >
                        View all results for &ldquo;{searchQuery}&rdquo;
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No products found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900"
                >
                  <User size={20} />
                  <span className="ml-2 hidden md:block">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package size={16} className="mr-2" />
                      My Orders
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <MapPin size={16} className="mr-2" />
                      Settings
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Sign in
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="text-gray-700 hover:text-gray-900 relative">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white">
            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="px-3 py-2">
              <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 bg-gray-50">
                <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="ml-1 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchQuery.trim() && (
                <div className="mt-2 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                  {isSearching ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                  ) : suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((product) => (
                        <li key={product._id}>
                          <button
                            onClick={() => { setIsMenuOpen(false); handleSuggestionClick(product); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                          >
                            <div className="flex-shrink-0 w-9 h-9 rounded-md overflow-hidden bg-gray-100">
                              <img
                                src={product.image || product.images?.[0] || NO_IMAGE}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No products found.</div>
                  )}
                </div>
              )}
            </form>

            {/* Home */}
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {/* Category links with accordion sub-categories */}
            {NAV_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                  onClick={() =>
                    setExpandedMobileCategory(
                      expandedMobileCategory === cat.label ? null : cat.label
                    )
                  }
                >
                  <span>{cat.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      expandedMobileCategory === cat.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedMobileCategory === cat.label && (
                  <div className="bg-gray-50 border-l-2 border-black ml-3 pl-3 pb-1">
                    <Link
                      to={cat.href}
                      className="block py-2 text-sm font-semibold text-gray-900"
                      onClick={() => { setIsMenuOpen(false); setExpandedMobileCategory(null); }}
                    >
                      View All {cat.label}
                    </Link>
                    {cat.subCategories.map((sub) => (
                      <Link
                        key={sub.value}
                        to={`/products?category=${encodeURIComponent(sub.value)}`}
                        className="block py-1.5 text-sm text-gray-600 hover:text-black"
                        onClick={() => { setIsMenuOpen(false); setExpandedMobileCategory(null); }}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/about"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            {user && (
              <div className="border-t border-gray-200 mt-3 pt-3">
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-gray-900 flex items-center px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package size={18} className="mr-2" />
                  My Orders
                </Link>
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-gray-900 flex items-center px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MapPin size={18} className="mr-2" />
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
