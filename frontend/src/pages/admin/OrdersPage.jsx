import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { orderApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function OrdersPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = usePageData(() => orderApi.getOrders({ limit: 50 }), [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading orders..." />;
  }

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <span className="eyebrow">Orders</span>
          <h2>Review every checkout in one place</h2>
        </div>
        <BackButton fallbackTo="/admin" />
      </div>
      <DataTable
        columns={[
          { key: 'orderCode', label: 'Order code' },
          { key: 'customerName', label: 'Customer' },
          { key: 'receiverPhone', label: 'Phone' },
          { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          {
            key: 'paymentStatus',
            label: 'Payment',
            render: (row) => <StatusBadge value={row.paymentStatus} />
          },
          { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="inline-actions">
                <button className="button button-secondary" onClick={() => navigate(`/admin/orders/${row.id}`)} type="button">
                  View
                </button>
                <select
                  className="inline-select"
                  defaultValue={row.status}
                  onChange={async (event) => {
                    await orderApi.updateStatus(row.id, { status: event.target.value });
                    setRefreshKey((value) => value + 1);
                  }}
                >
                  {['PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            )
          }
        ]}
        rows={data.data || []}
      />
    </section>
  );
}

export default OrdersPage;
