function Rating({ value = 0, count }) {
  const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(value));

  return (
    <div className="rating">
      <span className="rating-stars">
        {stars.map((filled, index) => (
          <span key={index}>{filled ? '★' : '☆'}</span>
        ))}
      </span>
      <span className="rating-meta">
        {Number(value).toFixed(1)}
        {count ? ` (${count})` : ''}
      </span>
    </div>
  );
}

export default Rating;
