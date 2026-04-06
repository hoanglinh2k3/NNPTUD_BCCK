function StatsCard({ label, value, hint }) {
  return (
    <article className="stats-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}

export default StatsCard;
