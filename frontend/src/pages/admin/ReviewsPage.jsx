import { useState } from 'react';
import { productApi, reviewApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import DataTable from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { usePageData } from '../../hooks/usePageData';

function ReviewsPage() {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = usePageData(async () => {
    const productsResponse = await productApi.getProducts({ limit: 30 });
    const reviewContext = selectedProductId ? await reviewApi.getContext(selectedProductId) : { reviews: [] };
    return {
      products: productsResponse.data || [],
      reviews: reviewContext.reviews || []
    };
  }, [selectedProductId, refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading reviews..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Reviews</span>
            <h2>Inspect product feedback</h2>
          </div>
          <BackButton fallbackTo="/admin" />
        </div>
        <select value={selectedProductId || ''} onChange={(event) => setSelectedProductId(event.target.value || null)}>
          <option value="">Select product</option>
          {data.products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </section>
      <section className="section-card">
        <DataTable
          columns={[
            { key: 'fullName', label: 'Customer' },
            { key: 'rating', label: 'Rating' },
            { key: 'status', label: 'Status' },
            { key: 'comment', label: 'Comment' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="inline-actions">
                  <button
                    className="button button-secondary"
                    onClick={() =>
                      reviewApi
                        .update(row.id, { status: row.status === 'HIDDEN' ? 'VISIBLE' : 'HIDDEN' })
                        .then(() => setRefreshKey((value) => value + 1))
                    }
                    type="button"
                  >
                    {row.status === 'HIDDEN' ? 'Show' : 'Hide'}
                  </button>
                  <button
                    className="button button-ghost"
                    onClick={() => reviewApi.delete(row.id).then(() => setRefreshKey((value) => value + 1))}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
          rows={data.reviews || []}
        />
      </section>
    </div>
  );
}

export default ReviewsPage;
