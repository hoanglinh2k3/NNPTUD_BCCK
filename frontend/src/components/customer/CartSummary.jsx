import { formatCurrency } from '../../utils/format';

function CartSummary({ summary, actionLabel = 'Proceed', actionHint, disabled = false, onAction, sticky = false }) {
  return (
    <aside className={`summary-card cart-summary-card ${sticky ? 'is-sticky' : ''}`.trim()}>
      <h3>Order summary</h3>
      <div className="summary-row">
        <span>Items</span>
        <strong>{summary?.totalItems || 0}</strong>
      </div>
      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(summary?.subTotal || 0)}</strong>
      </div>
      <div className="summary-row summary-total">
        <span>Total payable</span>
        <strong>{formatCurrency(summary?.subTotal || 0)}</strong>
      </div>
      {actionHint ? <p>{actionHint}</p> : null}
      <button className="button button-primary button-block" disabled={disabled} onClick={onAction} type="button">
        {actionLabel}
      </button>
    </aside>
  );
}

export default CartSummary;
