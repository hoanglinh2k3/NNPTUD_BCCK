import { useState } from 'react';
import { orderApi, paymentApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import DataTable from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function PaymentsPage() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = usePageData(async () => {
    const orders = await orderApi.getOrders({ limit: 50 });
    let payment = null;

    if (selectedOrderId) {
      try {
        payment = await paymentApi.getByOrderId(selectedOrderId);
      } catch (error) {
        payment = null;
      }
    }

    return {
      orders: orders.data || [],
      payment
    };
  }, [selectedOrderId, refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading payments..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Payments</span>
            <h2>Inspect payment records per order</h2>
          </div>
          <BackButton fallbackTo="/admin" />
        </div>
        <DataTable
          columns={[
            { key: 'orderCode', label: 'Order code' },
            { key: 'customerName', label: 'Customer' },
            { key: 'paymentStatus', label: 'Payment status' },
            { key: 'totalAmount', label: 'Amount', render: (row) => formatCurrency(row.totalAmount) },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <button className="button button-secondary" onClick={() => setSelectedOrderId(row.id)} type="button">
                  Inspect payment
                </button>
              )
            }
          ]}
          rows={data.orders}
        />
      </section>

      {data.payment ? (
        <section className="section-card">
          <h2>Selected payment</h2>
          <div className="detail-specs">
            <span>Method: {data.payment.method}</span>
            <span>Status: {data.payment.status}</span>
            <span>Amount: {formatCurrency(data.payment.amount)}</span>
            <span>Transaction: {data.payment.transactionCode || '--'}</span>
          </div>
          <button
            className="button button-primary"
            onClick={async () => {
              await paymentApi.updateStatus(data.payment.id, {
                status: 'PAID',
                transactionCode: data.payment.transactionCode || `TXN-${data.payment.id}`
              });
              setRefreshKey((value) => value + 1);
            }}
            type="button"
          >
            Mark as paid
          </button>
        </section>
      ) : null}
    </div>
  );
}

export default PaymentsPage;
