import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import CartSummary from '../../components/customer/CartSummary';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency, resolveAssetUrl } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function CartPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = usePageData(() => cartApi.getCart(), [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading cart..." />;
  }

  const cart = data || { items: [], summary: { totalItems: 0, subTotal: 0 } };

  return (
    <section className="container page-stack">
      <div className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Cart</span>
            <h1>Your selected decor pieces</h1>
          </div>
          <BackButton fallbackTo="/products" />
        </div>
      </div>

      <div className="cart-layout">
        <section className="section-card cart-list-panel">
          <div className="cart-panel-head">
            <div>
              <span className="eyebrow">Cart items</span>
              <h2>{cart.items.length ? `${cart.summary.totalItems} item${cart.summary.totalItems > 1 ? 's' : ''} ready for checkout` : 'Your cart is empty'}</h2>
            </div>
            <button className="button button-secondary" onClick={() => navigate('/products')} type="button">
              Continue shopping
            </button>
          </div>
          {cart.items.length ? (
            <div className="cart-items">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-main">
                    {item.imageUrl ? (
                      <img alt={item.productName} className="cart-item-image" src={resolveAssetUrl(item.imageUrl)} />
                    ) : (
                      <div className="cart-item-media" />
                    )}
                    <div className="cart-item-copy">
                      <strong>{item.productName}</strong>
                      <p>{formatCurrency(item.unitPrice)}</p>
                      <p>{item.inventoryQuantity > 0 ? `${item.inventoryQuantity} in stock` : 'Out of stock'}</p>
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <span className="cart-item-label">Quantity</span>
                    <div className="quantity-row">
                      <button
                        className="button button-secondary"
                        onClick={async () => {
                          await cartApi.updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) });
                          setRefreshKey((value) => value + 1);
                        }}
                        type="button"
                      >
                        -
                      </button>
                      <strong>{item.quantity}</strong>
                      <button
                        className="button button-secondary"
                        disabled={item.quantity >= item.inventoryQuantity}
                        onClick={async () => {
                          await cartApi.updateItem(item.id, { quantity: item.quantity + 1 });
                          setRefreshKey((value) => value + 1);
                        }}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    <span className="cart-item-label">Subtotal</span>
                    <strong>{formatCurrency(item.subTotal)}</strong>
                    <button
                      className="button button-ghost"
                      onClick={async () => {
                        await cartApi.removeItem(item.id);
                        setRefreshKey((value) => value + 1);
                      }}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <button className="button button-primary" onClick={() => navigate('/products')} type="button">
                  Browse products
                </button>
              }
              description="Add decor pieces to your cart to prepare a checkout."
              title="Your cart is empty"
            />
          )}
        </section>

        <CartSummary
          actionHint="The checkout total is synced with the backend order amount."
          actionLabel="Checkout"
          disabled={!cart.items.length}
          onAction={() => navigate('/checkout')}
          summary={cart.summary}
        />
      </div>
    </section>
  );
}

export default CartPage;
