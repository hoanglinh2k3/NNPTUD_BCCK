import { formatCurrency, formatDate, getStatusTone } from '../../utils/format';

function OrderCard({ order, actions }) {
  return (
    <article className="order-card">
      <div className="order-card-head">
        <div>
          <strong>{order.orderCode}</strong>
          <p>{formatDate(order.createdAt)}</p>
        </div>
        <span className={`pill pill-${getStatusTone(order.status)}`}>{order.status}</span>
      </div>
      <div className="order-card-body">
        <p>{order.receiverName}</p>
        <p>Total: {formatCurrency(order.totalAmount)}</p>
        <p>Payment: {order.paymentStatus}</p>
      </div>
      <div className="order-card-actions">{actions}</div>
    </article>
  );
}

export default OrderCard;
