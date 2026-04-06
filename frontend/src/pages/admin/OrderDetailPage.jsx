import { useParams } from 'react-router-dom';
import { orderApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function OrderDetailPage() {
  const { id } = useParams();
  const { data, loading } = usePageData(() => orderApi.getOrder(id), [id]);

  if (loading) {
    return <LoadingSpinner label="Loading order detail..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Order detail</span>
            <h2>{data.orderCode}</h2>
          </div>
          <BackButton fallbackTo="/admin/orders" />
        </div>
        <div className="detail-specs">
          <span>Customer: {data.customerName}</span>
          <span>Receiver: {data.receiverName}</span>
          <span>Status: <StatusBadge value={data.status} /></span>
          <span>Payment: <StatusBadge value={data.paymentStatus} /></span>
          <span>Created: {formatDate(data.createdAt)}</span>
        </div>
      </section>

      <section className="section-card">
        <h2>Items</h2>
        <div className="stack-list">
          {(data.items || []).map((item) => (
            <article className="checkout-line" key={item.id}>
              <span>{item.productName}</span>
              <span>x{item.quantity}</span>
              <strong>{formatCurrency(item.subTotal)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h2>Payment</h2>
        {data.payment ? (
          <div className="detail-specs">
            <span>Method: {data.payment.method}</span>
            <span>Status: {data.payment.status}</span>
            <span>Transaction: {data.payment.transactionCode || '--'}</span>
            <span>Amount: {formatCurrency(data.payment.amount)}</span>
          </div>
        ) : (
          <p>No payment record yet.</p>
        )}
      </section>
    </div>
  );
}

export default OrderDetailPage;
