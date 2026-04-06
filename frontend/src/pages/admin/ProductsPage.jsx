import { Link } from 'react-router-dom';
import { useState } from 'react';
import { productApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { usePageData } from '../../hooks/usePageData';

function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = usePageData(() => productApi.getProducts({ limit: 50 }), [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading products..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card section-head">
        <div>
          <span className="eyebrow">Products</span>
          <h2>Manage catalog entries and product states</h2>
        </div>
        <div className="inline-actions">
          <BackButton fallbackTo="/admin" />
          <Link className="button button-primary" to="/admin/products/new">
            Add product
          </Link>
        </div>
      </section>
      <section className="section-card">
        <DataTable
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'categoryName', label: 'Category' },
            { key: 'sku', label: 'SKU' },
            { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="inline-actions">
                  <Link className="button button-secondary" to={`/admin/products/${row.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    className="button button-ghost"
                    onClick={() => productApi.deleteProduct(row.id).then(() => setRefreshKey((value) => value + 1))}
                    type="button"
                  >
                    Inactivate
                  </button>
                </div>
              )
            }
          ]}
          rows={data.data || []}
        />
      </section>
    </div>
  );
}

export default ProductsPage;
