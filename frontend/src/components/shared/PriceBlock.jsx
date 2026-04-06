import { formatCurrency } from '../../utils/format';

function PriceBlock({ price, discountPrice }) {
  const hasDiscount = Number(discountPrice) > 0 && Number(discountPrice) < Number(price);

  return (
    <div className="price-block">
      <strong>{formatCurrency(hasDiscount ? discountPrice : price)}</strong>
      {hasDiscount ? <span>{formatCurrency(price)}</span> : null}
    </div>
  );
}

export default PriceBlock;
