function RevenueChart({ items = [] }) {
  const maxValue = Math.max(...items.map((item) => Number(item.totalRevenue || 0)), 1);

  return (
    <div className="revenue-chart">
      {items.map((item) => (
        <div className="revenue-bar" key={item.period}>
          <div
            className="revenue-bar-fill"
            style={{ height: `${(Number(item.totalRevenue || 0) / maxValue) * 100}%` }}
          />
          <strong>{item.period}</strong>
        </div>
      ))}
    </div>
  );
}

export default RevenueChart;
