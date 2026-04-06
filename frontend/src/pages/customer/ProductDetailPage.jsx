import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { cartApi, catalogApi, reviewApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import EmptyState from '../../components/shared/EmptyState';
import PriceBlock from '../../components/shared/PriceBlock';
import Rating from '../../components/shared/Rating';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { usePageData } from '../../hooks/usePageData';
import { resolveAssetUrl } from '../../utils/format';

function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCustomer = user?.role === 'Customer';
  const reviewSectionRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const { data, loading, error } = usePageData(async () => {
    const productPromise = catalogApi.getProduct(id);

    if (isCustomer) {
      const [product, reviewContext] = await Promise.all([productPromise, reviewApi.getContext(id)]);
      return {
        product,
        reviews: reviewContext.reviews || [],
        ownReview: reviewContext.ownReview || null,
        canReview: Boolean(reviewContext.canReview),
        hasPurchased: Boolean(reviewContext.hasPurchased)
      };
    }

    const [product, reviews] = await Promise.all([productPromise, catalogApi.getReviews(id)]);
    return {
      product,
      reviews,
      ownReview: null,
      canReview: false,
      hasPurchased: false
    };
  }, [id, isCustomer, reviewRefreshKey]);

  const product = data?.product;
  const reviews = data?.reviews || [];
  const images = (product?.images || []).map((image) => ({
    ...image,
    imageUrl: resolveAssetUrl(image.imageUrl)
  }));
  const ownReview = data?.ownReview || reviews.find((review) => review.userId === user?.id) || null;
  const canReview = isCustomer ? Boolean(data?.canReview || ownReview) : false;
  const hasPurchased = Boolean(data?.hasPurchased);
  const primaryImageUrl = resolveAssetUrl(product?.primaryImage || '');
  const firstImageUrl = images[0]?.imageUrl || '';
  const isOutOfStock = !product || product.status === 'INACTIVE' || Number(product.quantity || 0) <= 0;
  const maxQuantity = Math.max(1, Number(product?.quantity || 1));

  useEffect(() => {
    setSelectedImage(primaryImageUrl || firstImageUrl);
  }, [primaryImageUrl, firstImageUrl]);

  useEffect(() => {
    if (ownReview) {
      setReviewForm({
        rating: ownReview.rating,
        comment: ownReview.comment || ''
      });
    } else {
      setReviewForm({ rating: 5, comment: '' });
    }
  }, [ownReview]);

  useEffect(() => {
    setQuantity((current) => Math.min(current, maxQuantity));
  }, [maxQuantity]);

  useEffect(() => {
    if (location.hash !== '#reviews' || !reviewSectionRef.current || loading || !product) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, loading, product?.id]);

  const handleBuy = async () => {
    if (!user || user.role !== 'Customer') {
      navigate('/login');
      return;
    }

    await cartApi.addItem({ productId: Number(id), quantity });
    navigate('/checkout');
  };

  if (loading) {
    return <LoadingSpinner label="Loading product..." />;
  }

  if (error) {
    return (
      <section className="container page-stack">
        <div className="section-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Product</span>
              <h1>Unable to load this item</h1>
            </div>
            <BackButton fallbackTo="/products" />
          </div>
        </div>
        <EmptyState
          description="The product details could not be loaded right now. Please try again or return to the catalog."
          title="Product details are temporarily unavailable"
        />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container page-stack">
        <div className="section-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Product</span>
              <h1>Product not found</h1>
            </div>
            <BackButton fallbackTo="/products" />
          </div>
        </div>
        <EmptyState
          description="This decor item may have been removed or is no longer available in the catalog."
          title="We couldn't find that product"
        />
      </section>
    );
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user || user.role !== 'Customer') {
      navigate('/login');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewMessage('');

    try {
      if (ownReview) {
        await reviewApi.update(ownReview.id, reviewForm);
        setReviewMessage('Your review has been updated.');
      } else {
        await reviewApi.create(product.id, reviewForm);
        setReviewMessage('Your review has been submitted.');
      }
      setReviewRefreshKey((value) => value + 1);
    } catch (apiError) {
      setReviewError(apiError.response?.data?.message || 'Unable to save your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!ownReview) {
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewMessage('');

    try {
      await reviewApi.delete(ownReview.id);
      setReviewMessage('Your review has been removed.');
      setReviewRefreshKey((value) => value + 1);
    } catch (apiError) {
      setReviewError(apiError.response?.data?.message || 'Unable to delete your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <section className="container page-stack">
      <div className="section-card product-detail-grid">
        <div className="product-gallery">
          {selectedImage ? (
            <img alt={product.name} className="product-gallery-image" src={selectedImage} />
          ) : (
            <div className="product-gallery-main" />
          )}
          <div className="product-gallery-thumbs">
            {(images.length ? images : [{ id: 'cover', imageUrl: '' }]).map((image) => (
              <button
                className={`product-thumb-button ${selectedImage === image.imageUrl ? 'is-active' : ''}`}
                key={image.id}
                onClick={() => image.imageUrl && setSelectedImage(image.imageUrl)}
                type="button"
              >
                {image.imageUrl ? (
                  <img alt={product.name} className="product-thumb-image" src={image.imageUrl} />
                ) : (
                  <div className="product-thumb" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail-copy">
          <div className="section-head">
            <span className="eyebrow">{product.categoryName}</span>
            <BackButton fallbackTo="/products" />
          </div>
          <h1>{product.name}</h1>
          <Rating count={product.reviewCount} value={product.avgRating || 0} />
          <PriceBlock discountPrice={product.discountPrice} price={product.price} />
          <p>{product.description || 'A warm decor piece designed to fit modern, calm interiors.'}</p>
          <div className="detail-specs">
            <span>Material: {product.material || 'Updated in admin'}</span>
            <span>Color: {product.color || 'Natural tones'}</span>
            <span>Size: {product.size || 'See details'}</span>
            <span>Collection: {product.collectionName || 'Signature'}</span>
            <span>SKU: {product.sku}</span>
            <span>{isOutOfStock ? 'Out of stock' : `${product.quantity} items ready to ship`}</span>
          </div>
          <div className="quantity-row">
            <button className="button button-secondary" disabled={isOutOfStock} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">
              -
            </button>
            <strong>{quantity}</strong>
            <button
              className="button button-secondary"
              disabled={isOutOfStock || quantity >= maxQuantity}
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              type="button"
            >
              +
            </button>
          </div>
          <div className="cta-row">
            <button
              className="button button-secondary"
              disabled={isOutOfStock}
              onClick={async () => {
                if (!user || user.role !== 'Customer') {
                  navigate('/login');
                  return;
                }

                await cartApi.addItem({ productId: Number(id), quantity });
                navigate('/cart');
              }}
              type="button"
            >
              Add to cart
            </button>
            <button className="button button-primary" disabled={isOutOfStock} onClick={handleBuy} type="button">
              Buy now
            </button>
          </div>
        </div>
      </div>

      <section className="section-card review-section" id="reviews" ref={reviewSectionRef}>
        <h2>Customer reviews</h2>
        {isCustomer ? (
          canReview ? (
            <form className="form-grid review-form" onSubmit={handleReviewSubmit}>
              {ownReview?.status === 'HIDDEN' ? (
                <p className="form-grid-full review-helper">
                  Your review is currently hidden from public view. You can still update or remove
                  it here.
                </p>
              ) : null}
              <label>
                Rating
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-grid-full">
                Comment
                <textarea
                  rows="4"
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, comment: event.target.value }))
                  }
                />
              </label>
              {reviewError ? <p className="form-grid-full form-error">{reviewError}</p> : null}
              {reviewMessage ? <p className="form-grid-full success-note">{reviewMessage}</p> : null}
              <div className="form-grid-full form-actions">
                <button className="button button-primary" disabled={reviewSubmitting} type="submit">
                  {reviewSubmitting ? 'Saving...' : ownReview ? 'Update my review' : 'Write a review'}
                </button>
                {ownReview ? (
                  <button
                    className="button button-ghost"
                    disabled={reviewSubmitting}
                    onClick={handleDeleteReview}
                    type="button"
                  >
                    Delete my review
                  </button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="review-helper">
              {hasPurchased
                ? 'You already have a review for this product.'
                : 'You can review this product after at least one matching order is delivered.'}
            </p>
          )
        ) : null}
        {reviews.length ? (
          <div className="stack-list">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <strong>{review.fullName}</strong>
                <Rating value={review.rating} />
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            description="This item has not received a visible review yet. The first delivered customer review will appear here."
            title="No reviews yet"
          />
        )}
      </section>
    </section>
  );
}

export default ProductDetailPage;
