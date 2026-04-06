import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi, reviewApi } from '../../api/services';
import OrderCard from '../../components/customer/OrderCard';
import BackButton from '../../components/shared/BackButton';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';
import Pagination from '../../components/shared/Pagination';
import { usePageData } from '../../hooks/usePageData';
import { formatCurrency } from '../../utils/format';

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const { data, loading } = usePageData(
    () => orderApi.getOrders({ status: status || undefined, page }),
    [status, page, refreshKey]
  );

  const openReviewModal = async (order) => {
    setReviewLoading(true);

    try {
      const detail = await orderApi.getOrder(order.id);
      const itemsWithReview = await Promise.all(
        (detail.items || []).map(async (item) => {
          try {
            const context = await reviewApi.getContext(item.productId);
            return {
              ...item,
              ownReview: context.ownReview || null
            };
          } catch (_error) {
            return {
              ...item,
              ownReview: null
            };
          }
        })
      );

      setReviewOrder({
        ...detail,
        items: itemsWithReview
      });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading order history..." />;
  }

  return (
    <section className="container page-stack">
      <div className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Orders</span>
            <h1>Track each purchase from confirmation to delivery</h1>
          </div>
          <BackButton fallbackTo="/" />
        </div>
      </div>

      <div className="chip-row">
        {['', 'PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map((item) => (
          <button
            className={`chip ${status === item ? 'is-active' : ''}`}
            key={item || 'ALL'}
            onClick={() => {
              setStatus(item);
              setPage(1);
            }}
            type="button"
          >
            {item || 'ALL'}
          </button>
        ))}
      </div>

      <div className="section-card order-review-banner">
        <div className="order-review-banner-copy">
          <strong>Product reviews unlock after delivery</strong>
          <p>
            Review buttons appear on delivered orders. When you open one, we will take you
            straight to each product&apos;s review section so you can write or update feedback.
          </p>
        </div>
        {status !== 'DELIVERED' ? (
          <button
            className="button button-secondary"
            onClick={() => {
              setStatus('DELIVERED');
              setPage(1);
            }}
            type="button"
          >
            Show delivered orders
          </button>
        ) : (
          <span className="pill pill-success">Delivered orders only</span>
        )}
      </div>

      <div className="stack-list">
        {(data?.data || []).length ? (
          (data?.data || []).map((order) => (
            <OrderCard
              actions={
                <>
                  <span
                    className={`pill ${
                      order.status === 'DELIVERED'
                        ? 'pill-success'
                        : order.status === 'CANCELLED'
                          ? 'pill-danger'
                          : 'pill-muted'
                    }`}
                  >
                    {order.status === 'DELIVERED'
                      ? 'Review ready'
                      : order.status === 'CANCELLED'
                        ? 'Review unavailable'
                        : 'Review opens after delivery'}
                  </span>
                  {order.status === 'DELIVERED' ? (
                    <button
                      className="button button-primary"
                      onClick={() => openReviewModal(order)}
                      type="button"
                    >
                      Review products
                    </button>
                  ) : null}
                  {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                    <button
                      className="button button-secondary"
                      onClick={async () => {
                        await orderApi.cancel(order.id);
                        setRefreshKey((value) => value + 1);
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                  ) : null}
                </>
              }
              key={order.id}
              order={order}
            />
          ))
        ) : (
          <EmptyState
            description="Completed and in-progress orders will appear here after your first checkout."
            title="No orders found"
          />
        )}
      </div>

      <Pagination meta={data?.meta} onPageChange={setPage} />

      <Modal
        onClose={() => {
          setReviewOrder(null);
          setReviewLoading(false);
        }}
        open={Boolean(reviewOrder) || reviewLoading}
        title={reviewOrder ? `Review products in ${reviewOrder.orderCode}` : 'Review purchased products'}
      >
        {reviewLoading ? (
          <LoadingSpinner label="Loading purchased products..." />
        ) : reviewOrder?.items?.length ? (
          <div className="order-review-list">
            {reviewOrder.items.map((item) => (
              <article className="order-review-item" key={item.id}>
                <div className="order-review-item-copy">
                  <strong>{item.productName}</strong>
                  <p className="order-review-item-meta">
                    Qty {item.quantity} - {formatCurrency(item.subTotal)}
                  </p>
                </div>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setReviewOrder(null);
                    navigate(`/products/${item.productId}#reviews`);
                  }}
                  type="button"
                >
                  {item.ownReview ? 'Update review' : 'Write review'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            description="This delivered order did not return any reviewable items."
            title="No purchased products found"
          />
        )}
      </Modal>
    </section>
  );
}

export default OrderHistoryPage;
