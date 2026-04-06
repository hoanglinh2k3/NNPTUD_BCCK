import { useNavigate } from 'react-router-dom';
import { cartApi, catalogApi } from '../../api/services';
import { heroBanners } from '../../assets/mock-data';
import BannerSlider from '../../components/customer/BannerSlider';
import ProductCard from '../../components/shared/ProductCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { usePageData } from '../../hooks/usePageData';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading } = usePageData(async () => {
    const [categoriesResponse, productsResponse] = await Promise.all([
      catalogApi.getCategories({ limit: 8 }),
      catalogApi.getProducts({ limit: 12, sortBy: 'latest' })
    ]);

    return {
      categories: categoriesResponse.data || [],
      products: productsResponse.data || []
    };
  }, []);

  const handleAddToCart = async (product) => {
    if (!user || user.role !== 'Customer') {
      navigate('/login');
      return;
    }

    await cartApi.addItem({ productId: product.id, quantity: 1 });
    navigate('/cart');
  };

  if (loading) {
    return <LoadingSpinner label="Loading storefront..." />;
  }

  const products = data?.products || [];
  const heroCards = data?.categories?.length
    ? data.categories.slice(0, 3).map((category, index) => ({
        eyebrow: index === 0 ? 'Top category' : index === 1 ? 'Room refresh' : 'Quick route',
        title: category.name,
        subtitle:
          category.description ||
          `Explore ${category.name.toLowerCase()} for calmer rooms and more intentional styling.`,
        primaryLabel: 'Open category',
        primaryTo: `/products?categoryId=${category.id}`,
        secondaryLabel: index === 0 ? 'View all products' : 'Latest in catalog',
        secondaryTo: index === 0 ? '/products' : `/products?categoryId=${category.id}&sortBy=latest`
      }))
    : heroBanners;

  return (
    <div className="page-stack">
      <section className="container home-hero">
        <BannerSlider banners={heroCards} />
      </section>

      <section className="container section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Featured products</span>
            <h2>Warm details for everyday rooms</h2>
          </div>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} onAddToCart={handleAddToCart} product={product} />
          ))}
        </div>
      </section>

      <section className="container section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Today&apos;s picks</span>
            <h2>Fresh arrivals with a marketplace-friendly layout</h2>
          </div>
        </div>
        <div className="chip-row">
          <span className="chip">Latest</span>
          <span className="chip">Best selling</span>
          <span className="chip">Price up</span>
          <span className="chip">Price down</span>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} onAddToCart={handleAddToCart} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
