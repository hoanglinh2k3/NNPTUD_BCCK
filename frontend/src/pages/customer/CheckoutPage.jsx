import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi, cartApi, orderApi } from '../../api/services';
import AddressCard from '../../components/customer/AddressCard';
import CartSummary from '../../components/customer/CartSummary';
import BackButton from '../../components/shared/BackButton';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { data, loading } = usePageData(async () => {
    const [cart, addresses] = await Promise.all([cartApi.getCart(), addressApi.getAddresses()]);
    return { cart, addresses };
  }, []);

  useEffect(() => {
    if (data?.addresses?.length && !selectedAddressId) {
      const defaultAddress = data.addresses.find((item) => item.isDefault) || data.addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [data, selectedAddressId]);

  if (loading) {
    return <LoadingSpinner label="Preparing checkout..." />;
  }

  const cartItems = data?.cart?.items || [];
  const addresses = data?.addresses || [];

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      return;
    }

    setSubmitting(true);

    try {
      await orderApi.checkout({
        addressId: selectedAddressId,
        paymentMethod,
        note
      });
      navigate('/orders');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container page-stack">
      <div className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Review your shipping and payment details</h1>
          </div>
          <BackButton fallbackTo="/cart" />
        </div>
      </div>

      <div className="checkout-layout">
        <div className="stack-list">
          <section className="section-card">
            <h2>Shipping address</h2>
            {addresses.length ? (
              addresses.map((address) => (
                <label className="radio-card" key={address.id}>
                  <input
                    checked={selectedAddressId === address.id}
                    name="address"
                    onChange={() => setSelectedAddressId(address.id)}
                    type="radio"
                  />
                  <AddressCard address={address} />
                </label>
              ))
            ) : (
              <EmptyState
                action={
                  <button className="button button-primary" onClick={() => navigate('/addresses')} type="button">
                    Add address
                  </button>
                }
                description="You need at least one delivery address before placing an order."
                title="No address selected"
              />
            )}
          </section>

          <section className="section-card">
            <h2>Products</h2>
            {cartItems.length ? (
              cartItems.map((item) => (
                <article className="checkout-line" key={item.id}>
                  <span>{item.productName}</span>
                  <span>x{item.quantity}</span>
                  <strong>{formatCurrency(item.subTotal)}</strong>
                </article>
              ))
            ) : (
              <EmptyState
                action={
                  <button className="button button-primary" onClick={() => navigate('/products')} type="button">
                    Return to catalog
                  </button>
                }
                description="Your cart is empty, so there is nothing to place into a new order."
                title="No items to checkout"
              />
            )}
          </section>

          <section className="section-card">
            <h2>Payment method</h2>
            <div className="chip-row">
              {['COD', 'BANK_TRANSFER'].map((method) => (
                <button
                  className={`chip ${paymentMethod === method ? 'is-active' : ''}`}
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                >
                  {method}
                </button>
              ))}
            </div>
            <label>
              Note
              <textarea rows="4" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
          </section>
        </div>

        <CartSummary
          actionLabel={submitting ? 'Submitting...' : 'Place order'}
          actionHint="Orders are created with the same subtotal shown here."
          disabled={submitting || !cartItems.length || !selectedAddressId}
          onAction={handleCheckout}
          summary={data?.cart?.summary}
          sticky
        />
      </div>
    </section>
  );
}

export default CheckoutPage;
