import { Link } from 'react-router-dom';

function CategoryGrid({ categories = [] }) {
  return (
    <section className="category-grid">
      {categories.map((category) => (
        <Link className="category-card" key={category.to || category.name} to={category.to || '/products'}>
          <div className="category-icon" />
          <div className="category-copy">
            <strong>{category.name}</strong>
            <p>{category.description || 'Browse this decor category in the catalog.'}</p>
            <span className="category-cta">Open category</span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export default CategoryGrid;
