import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cartApi, catalogApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import EmptyState from '../../components/shared/EmptyState';
import ProductCard from '../../components/shared/ProductCard';
import Pagination from '../../components/shared/Pagination';
import SearchBar from '../../components/shared/SearchBar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { usePageData } from '../../hooks/usePageData';
import { formatSortLabel } from '../../utils/format';

function ProductListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const deferredKeyword = useDeferredValue(keyword);

  const query = useMemo(
    () => ({
      page: Number(searchParams.get('page') || 1),
      keyword: deferredKeyword || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      sortBy: searchParams.get('sortBy') || 'latest'
    }),
    [deferredKeyword, searchParams]
  );

  const { data, loading } = usePageData(async () => {
    const [categoriesResponse, productsResponse] = await Promise.all([
      catalogApi.getCategories({ limit: 20 }),
      catalogApi.getProducts(query)
    ]);

    return {
      categories: categoriesResponse.data || [],
      products: productsResponse.data || [],
      meta: productsResponse.meta || null
    };
  }, [query.page, query.keyword, query.categoryId, query.sortBy]);

  const updateQuery = (changes) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (changes.page === undefined) {
      next.set('page', '1');
    }

    setSearchParams(next);
  };

  const handleAddToCart = async (product) => {
    if (!user || user.role !== 'Customer') {
      navigate('/login');
      return;
    }

    await cartApi.addItem({ productId: product.id, quantity: 1 });
    navigate('/cart');
  };

  if (loading) {
    return <LoadingSpinner label="Loading products..." />;
  }

  const categories = data?.categories || [];
  const products = data?.products || [];
  const meta = data?.meta || null;
  const selectedCategory = categories.find((category) => String(category.id) === String(query.categoryId));
  const hasActiveFilters = Boolean(query.keyword || query.categoryId || query.sortBy !== 'latest');

  return (
    <section className="container page-stack">
      <div className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Catalog</span>
            <h1>Shop decor by mood, material, and category</h1>
          </div>
          <BackButton fallbackTo="/" />
        </div>
      </div>

      <section className="section-card catalog-filter-shell">
        <div className="catalog-filter-top">
          <div className="catalog-filter-copy">
            <span className="eyebrow">Filters</span>
            <h3>Narrow your picks</h3>
            <p>Search, switch category, and change sort order without losing space for the product grid.</p>
          </div>
          {hasActiveFilters ? (
            <button
              className="button button-ghost"
              onClick={() => {
                setKeyword('');
                setSearchParams(new URLSearchParams());
              }}
              type="button"
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        <SearchBar
          buttonLabel="Apply"
          className="catalog-search"
          defaultValue={keyword}
          onSearch={(value) => {
            setKeyword(value);
            updateQuery({ keyword: value, page: 1 });
          }}
          placeholder="Search products..."
        />

        <div className="catalog-filter-bar">
          <div className="catalog-filter-inline">
            <span className="catalog-inline-label">Categories</span>
            <div className="catalog-inline-scroll">
              <button
                className={`catalog-category-pill ${!query.categoryId ? 'is-active' : ''}`}
                onClick={() => updateQuery({ categoryId: '', page: 1 })}
                type="button"
              >
                All products
              </button>
              {categories.map((category) => (
                <button
                  className={`catalog-category-pill ${String(query.categoryId) === String(category.id) ? 'is-active' : ''}`}
                  key={category.id}
                  onClick={() => updateQuery({ categoryId: category.id, page: 1 })}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-inline">
            <span className="catalog-inline-label">Sort</span>
            <div className="catalog-inline-scroll">
              {['latest', 'bestSelling', 'priceAsc', 'priceDesc'].map((sortBy) => (
                <button
                  className={`chip ${query.sortBy === sortBy ? 'is-active' : ''}`}
                  key={sortBy}
                  onClick={() => updateQuery({ sortBy, page: 1 })}
                  type="button"
                >
                  {formatSortLabel(sortBy)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="catalog-active-filters">
            {query.keyword ? <span className="pill pill-muted">Keyword: {query.keyword}</span> : null}
            {selectedCategory ? <span className="pill pill-muted">Category: {selectedCategory.name}</span> : null}
            {query.sortBy !== 'latest' ? (
              <span className="pill pill-muted">Sort: {formatSortLabel(query.sortBy)}</span>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="section-card catalog-toolbar catalog-results-bar">
        <div className="catalog-toolbar-head">
          <div className="catalog-toolbar-copy">
            <span className="eyebrow">Results</span>
            <h3>{selectedCategory?.name || 'All decor products'}</h3>
            <p>
              {products.length} item{products.length === 1 ? '' : 's'} on this page
              {query.keyword ? ` for "${query.keyword}"` : ''}.
            </p>
          </div>
          {meta ? (
            <span className="pill pill-muted">
              Page {meta.page} / {meta.totalPages || 1}
            </span>
          ) : null}
        </div>
      </section>

      {products.length ? (
        <div className="product-grid catalog-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} onAddToCart={handleAddToCart} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Try another keyword, category, or sort option to explore more decor pieces."
          title="No products matched your filters"
        />
      )}

      <Pagination meta={meta} onPageChange={(page) => updateQuery({ page })} />
    </section>
  );
}

export default ProductListPage;
