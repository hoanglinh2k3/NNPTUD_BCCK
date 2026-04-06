import { Link } from 'react-router-dom';

function BannerSlider({ banners = [] }) {
  return (
    <section className="hero-grid">
      {banners.map((banner, index) => (
        <article className={`hero-card hero-card-${index + 1}`} key={banner.title}>
          <span className="eyebrow">{banner.eyebrow || 'New collection'}</span>
          <h2>{banner.title}</h2>
          <p>{banner.subtitle}</p>
          <div className="hero-card-actions">
            <Link className="hero-link" to={banner.primaryTo || '/products'}>
              {banner.primaryLabel || 'Explore collection'}
            </Link>
            {banner.secondaryLabel ? (
              <Link className="hero-link hero-link-secondary" to={banner.secondaryTo || '/products'}>
                {banner.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}

export default BannerSlider;
