import { Link } from 'react-router-dom';
import Rating from './Rating';
import PriceBlock from './PriceBlock';
import { resolveAssetUrl } from '../../utils/format';

function ProductCard({ product, onAddToCart }) {
  const imageUrl = resolveAssetUrl(product.primaryImage || product.imageUrl);

  return (
    <article className="product-card">
      <Link className="product-card-media" to={`/products/${product.id}`}>
        <span className="product-chip">{product.collectionName || 'Decor pick'}</span>
        <div className="product-media-frame">
          {imageUrl ? (
            <img alt={product.name} className="product-image" src={imageUrl} />
          ) : (
            <div className="product-image-fallback" />
          )}
        </div>
      </Link>
      <div className="product-card-body">
        <Link className="product-title" to={`/products/${product.id}`}>
          {product.name}
        </Link>
        <PriceBlock price={product.price} discountPrice={product.discountPrice} />
        <Rating value={product.avgRating || 0} count={product.reviewCount || 0} />
        <div className="product-card-footer">
          <span>{product.quantity > 0 ? `${product.soldQuantity || 0} sold` : 'Out of stock'}</span>
          <div className="product-card-actions">
            <Link className="button button-secondary" to={`/products/${product.id}`}>
              View details
            </Link>
            {onAddToCart ? (
              <button
                className="button button-ghost"
                disabled={product.quantity <= 0 || product.status === 'INACTIVE'}
                onClick={() => onAddToCart(product)}
                type="button"
              >
                Add to cart
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
