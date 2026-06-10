import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Filter, X, Check, ChevronLeft } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

export const baseurl = import.meta.env.VITE_backend_url;

// ── Sort option type ───────────────────────────────────────────────────────────
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Best Sellers' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLORS: { label: string; hex: string }[] = [
  { label: 'Black', hex: '#111111' },
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Slate Gray', hex: '#708090' },
  { label: 'Navy', hex: '#1B2A4A' },
  { label: 'Red', hex: '#E53E3E' },
  { label: 'Green', hex: '#276749' },
];

// ── Draft state for the modal (uncommitted until Apply) ───────────────────────
interface FilterDraft {
  sort: SortOption;
  categories: string[]; // slugs
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
}

const DEFAULT_MAX = 10000;

const EMPTY_DRAFT: FilterDraft = {
  sort: 'newest',
  categories: [],
  minPrice: 0,
  maxPrice: DEFAULT_MAX,
  sizes: [],
  colors: [],
};

// ── Filter Modal ───────────────────────────────────────────────────────────────
const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (draft: FilterDraft) => void;
  initial: FilterDraft;
  categoryGroups: ReturnType<typeof useCategories>['grouped'];
  categoriesLoading: boolean;
}> = ({ isOpen, onClose, onApply, initial, categoryGroups, categoriesLoading }) => {
  const [draft, setDraft] = useState<FilterDraft>(initial);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset draft to current applied filters whenever modal opens
  useEffect(() => {
    if (isOpen) setDraft(initial);
  }, [isOpen, initial]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const toggleCategory = (slug: string) => {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(slug)
        ? d.categories.filter((s) => s !== slug)
        : [...d.categories, slug],
    }));
  };

  const toggleSize = (size: string) => {
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(size)
        ? d.sizes.filter((s) => s !== size)
        : [...d.sizes, size],
    }));
  };

  const toggleColor = (label: string) => {
    setDraft((d) => ({
      ...d,
      colors: d.colors.includes(label)
        ? d.colors.filter((c) => c !== label)
        : [...d.colors, label],
    }));
  };

  const handleClearAll = () => setDraft({ ...EMPTY_DRAFT });

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Panel — slides up on mobile, centered on desktop */}
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-slide-up">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold tracking-wide text-gray-900">Filters</span>
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-7">

          {/* Sort By */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Sort By</h4>
            <div className="divide-y divide-gray-100">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraft((d) => ({ ...d, sort: opt.value }))}
                  className="w-full flex items-center justify-between py-3 text-sm text-gray-700 hover:text-black transition-colors"
                >
                  <span>{opt.label}</span>
                  {/* Diamond icon — filled when selected */}
                  <svg
                    width="16" height="16" viewBox="0 0 16 16"
                    className={`flex-shrink-0 transition-colors ${draft.sort === opt.value ? 'fill-black stroke-black' : 'fill-none stroke-gray-400'}`}
                    strokeWidth="1.5"
                  >
                    <path d="M8 1L15 8L8 15L1 8L8 1Z" />
                  </svg>
                </button>
              ))}
            </div>
          </section>

          {/* Category */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Category</h4>
            {categoriesLoading ? (
              <p className="text-xs text-gray-400">Loading…</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {categoryGroups.map(({ parent, children }) => (
                  <React.Fragment key={parent._id}>
                    {/* Parent */}
                    <button
                      onClick={() => toggleCategory(parent.slug)}
                      className="w-full flex items-center justify-between py-3 text-sm text-gray-700 hover:text-black transition-colors"
                    >
                      <span>{parent.name}</span>
                      <div
                        className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 rounded-sm transition-colors ${
                          draft.categories.includes(parent.slug)
                            ? 'bg-black border-black'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {draft.categories.includes(parent.slug) && (
                          <Check size={10} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                    </button>

                    {/* Subcategories */}
                    {children.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => toggleCategory(child.slug)}
                        className="w-full flex items-center justify-between py-2.5 pl-4 text-sm text-gray-500 hover:text-black transition-colors"
                      >
                        <span>{child.name}</span>
                        <div
                          className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 rounded-sm transition-colors ${
                            draft.categories.includes(child.slug)
                              ? 'bg-black border-black'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {draft.categories.includes(child.slug) && (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          )}
                        </div>
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </section>

          {/* Price Range */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Price Range</h4>
            {/* Dual thumb range — we fake it with two overlapping inputs */}
            <div className="relative h-5 flex items-center mb-4">
              <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full" />
              {/* Active track */}
              <div
                className="absolute h-1 bg-black rounded-full"
                style={{
                  left: `${(draft.minPrice / DEFAULT_MAX) * 100}%`,
                  right: `${100 - (draft.maxPrice / DEFAULT_MAX) * 100}%`,
                }}
              />
              <input
                type="range"
                min={0}
                max={DEFAULT_MAX}
                step={100}
                value={draft.minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), draft.maxPrice - 100);
                  setDraft((d) => ({ ...d, minPrice: val }));
                }}
                className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer range-thumb"
              />
              <input
                type="range"
                min={0}
                max={DEFAULT_MAX}
                step={100}
                value={draft.maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), draft.minPrice + 100);
                  setDraft((d) => ({ ...d, maxPrice: val }));
                }}
                className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer range-thumb"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Min</p>
                <input
                  type="text"
                  readOnly
                  value={`₹${draft.minPrice.toLocaleString('en-IN')}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 cursor-default"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Max</p>
                <input
                  type="text"
                  readOnly
                  value={`₹${draft.maxPrice.toLocaleString('en-IN')}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 cursor-default"
                />
              </div>
            </div>
          </section>

          {/* Size */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Size</h4>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`min-w-[44px] px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                    draft.sizes.includes(size)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          {/* Color */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Color</h4>
            <div className="divide-y divide-gray-100">
              {COLORS.map((color) => {
                const selected = draft.colors.includes(color.label);
                return (
                  <button
                    key={color.label}
                    onClick={() => toggleColor(color.label)}
                    className="w-full flex items-center justify-between py-3 text-sm text-gray-700 hover:text-black transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-sm border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.label}</span>
                    </div>
                    {selected && <Check size={15} className="text-black" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Apply button ── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="w-full bg-black text-white text-sm font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Apply Filters
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const ProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  const { grouped: categoryGroups, topLevel, loading: categoriesLoading } = useCategories();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Applied filters (committed on "Apply Filters")
  const [appliedFilters, setAppliedFilters] = useState<FilterDraft>({
    ...EMPTY_DRAFT,
    categories: categoryParam && categoryParam !== 'all' ? [categoryParam] : [],
  });

  // Count active filters for badge
  const activeFilterCount =
    (appliedFilters.sort !== 'newest' ? 1 : 0) +
    appliedFilters.categories.length +
    appliedFilters.sizes.length +
    appliedFilters.colors.length +
    (appliedFilters.minPrice > 0 || appliedFilters.maxPrice < DEFAULT_MAX ? 1 : 0);

  // Resolve sort params for backend
  const getSortParams = (sort: SortOption) => {
    switch (sort) {
      case 'price-asc': return { sortBy: 'price', sortOrder: 'asc' };
      case 'price-desc': return { sortBy: 'price', sortOrder: 'desc' };
      case 'rating-desc': return { sortBy: 'rating', sortOrder: 'desc' };
      default: return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  };

  // Fetch from backend whenever applied filters or search change
  useEffect(() => {
    setLoading(true);
    setError(null);

    const { sortBy, sortOrder } = getSortParams(appliedFilters.sort);
    const params = new URLSearchParams();

    if (search) params.append('search', search);

    // Send categories — single or multi
    if (appliedFilters.categories.length === 1) {
      params.append('category', appliedFilters.categories[0]);
    } else if (appliedFilters.categories.length > 1) {
      params.append('categories', appliedFilters.categories.join(','));
    }

    // Price range — only send if non-default
    if (appliedFilters.minPrice > 0) params.append('minPrice', appliedFilters.minPrice.toString());
    if (appliedFilters.maxPrice < DEFAULT_MAX) params.append('maxPrice', appliedFilters.maxPrice.toString());

    // Sizes & colors — send to backend
    if (appliedFilters.sizes.length > 0) params.append('sizes', appliedFilters.sizes.join(','));
    if (appliedFilters.colors.length > 0) params.append('colors', appliedFilters.colors.join(','));

    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    fetch(`${baseurl}/api/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch products`);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json'))
          throw new Error('Server returned non-JSON response. Check if backend is running.');
        return res.json();
      })
      .then((data: Product[]) => {
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [search, appliedFilters]);

  // No client-side post-filtering needed — backend handles everything now

  // Sync URL category param changes
  useEffect(() => {
    if (categoryParam && categoryParam !== 'all') {
      setAppliedFilters((prev) => ({ ...prev, categories: [categoryParam] }));
    } else if (!categoryParam) {
      setAppliedFilters((prev) => ({ ...prev, categories: [] }));
    }
  }, [categoryParam]);

  // Resolve page title
  const allFlatCategories = [
    ...topLevel,
    ...topLevel.flatMap(
      (p) => categoryGroups.find((g) => g.parent._id === p._id)?.children ?? []
    ),
  ];
  const pageTitle =
    appliedFilters.categories.length === 1
      ? allFlatCategories.find((c) => c.slug === appliedFilters.categories[0])?.name ?? 'Products'
      : appliedFilters.categories.length > 1
      ? 'Multiple Categories'
      : 'All Products';

  return (
    <div className="bg-white min-h-screen">
      {/* Range thumb styles injected inline so no extra CSS file needed */}
      <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #111;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        }
        .range-thumb::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #111;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        }
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.22s ease-out both; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">{filteredProducts.length} products</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* Filter button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="relative flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-black transition-colors"
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {appliedFilters.sort !== 'newest' && (
              <Chip
                label={SORT_OPTIONS.find((s) => s.value === appliedFilters.sort)?.label ?? ''}
                onRemove={() => setAppliedFilters((f) => ({ ...f, sort: 'newest' }))}
              />
            )}
            {appliedFilters.categories.map((slug) => (
              <Chip
                key={slug}
                label={allFlatCategories.find((c) => c.slug === slug)?.name ?? slug}
                onRemove={() =>
                  setAppliedFilters((f) => ({
                    ...f,
                    categories: f.categories.filter((c) => c !== slug),
                  }))
                }
              />
            ))}
            {(appliedFilters.minPrice > 0 || appliedFilters.maxPrice < DEFAULT_MAX) && (
              <Chip
                label={`₹${appliedFilters.minPrice.toLocaleString('en-IN')} – ₹${appliedFilters.maxPrice.toLocaleString('en-IN')}`}
                onRemove={() => setAppliedFilters((f) => ({ ...f, minPrice: 0, maxPrice: DEFAULT_MAX }))}
              />
            )}
            {appliedFilters.sizes.map((s) => (
              <Chip
                key={s}
                label={`Size: ${s}`}
                onRemove={() =>
                  setAppliedFilters((f) => ({ ...f, sizes: f.sizes.filter((x) => x !== s) }))
                }
              />
            ))}
            {appliedFilters.colors.map((c) => (
              <Chip
                key={c}
                label={c}
                onRemove={() =>
                  setAppliedFilters((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }))
                }
              />
            ))}
            <button
              onClick={() => setAppliedFilters({ ...EMPTY_DRAFT })}
              className="text-xs text-gray-400 hover:text-black underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Product grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">Error: {error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">No products found matching your filters.</p>
            <button
              onClick={() => setAppliedFilters({ ...EMPTY_DRAFT })}
              className="mt-4 text-sm font-medium underline underline-offset-2 text-gray-600 hover:text-black"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ── Filter Modal ── */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(draft) => setAppliedFilters(draft)}
        initial={appliedFilters}
        categoryGroups={categoryGroups}
        categoriesLoading={categoriesLoading}
      />
    </div>
  );
};

// ── Small chip component ───────────────────────────────────────────────────────
const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
    {label}
    <button onClick={onRemove} className="ml-0.5 hover:text-black">
      <X size={12} />
    </button>
  </span>
);

export default ProductsPage;
