import { adminApi } from '../../api/services';
import DataTable from '../../components/admin/DataTable';
import RevenueChart from '../../components/admin/RevenueChart';
import StatsCard from '../../components/admin/StatsCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function DashboardPage() {
  const { data, loading } = usePageData(async () => {
    const [summary, revenue, topProducts, lowStock] = await Promise.all([
      adminApi.getDashboardSummary(),
      adminApi.getRevenue({ groupBy: 'month' }),
      adminApi.getTopProducts(),
      adminApi.getLowStock()
    ]);

    return { summary, revenue, topProducts, lowStock };
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatsCard hint="All registered accounts" label="Users" value={data.summary.totalUsers} />
        <StatsCard hint="Products in catalog" label="Products" value={data.summary.totalProducts} />
        <StatsCard hint="Orders created" label="Orders" value={data.summary.totalOrders} />
        <StatsCard
          hint="Paid or delivered value"
          label="Revenue"
          value={formatCurrency(data.summary.totalRevenue)}
        />
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Revenue trend</span>
            <h2>Monthly order value</h2>
          </div>
        </div>
        <RevenueChart items={data.revenue} />
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <h2>Top products</h2>
          <DataTable
            columns={[
              { key: 'productName', label: 'Product' },
              { key: 'totalSold', label: 'Sold' },
              { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) }
            ]}
            rows={data.topProducts}
          />
        </div>
        <div className="section-card">
          <h2>Low stock</h2>
          <DataTable
            columns={[
              { key: 'productName', label: 'Product' },
              { key: 'sku', label: 'SKU' },
              { key: 'quantity', label: 'Quantity' }
            ]}
            rows={data.lowStock}
          />
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
