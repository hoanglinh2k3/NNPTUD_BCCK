import { useState } from 'react';
import { adminApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import DataTable from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';
import { usePageData } from '../../hooks/usePageData';

const initialAdjustment = {
  action: 'add',
  quantity: '1'
};

function InventoryPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustment, setAdjustment] = useState(initialAdjustment);
  const { data, loading } = usePageData(() => adminApi.getInventory({ limit: 50 }), [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading inventory..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Inventory</span>
            <h2>Track stock, reserved units, and sold units</h2>
          </div>
          <BackButton fallbackTo="/admin" />
        </div>
        <DataTable
          columns={[
            { key: 'productName', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'reservedQuantity', label: 'Reserved' },
            { key: 'soldQuantity', label: 'Sold' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="inline-actions">
                  {[
                    ['add', 'Add stock', 'button-secondary'],
                    ['remove', 'Remove stock', 'button-ghost'],
                    ['reserve', 'Reserve', 'button-ghost'],
                    ['sold', 'Mark sold', 'button-ghost']
                  ].map(([action, label, className]) => (
                    <button
                      className={`button ${className}`}
                      key={action}
                      onClick={() => {
                        setSelectedItem(row);
                        setAdjustment({ action, quantity: '1' });
                      }}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )
            }
          ]}
          rows={data.data || []}
        />
      </section>

      <Modal
        onClose={() => {
          setSelectedItem(null);
          setAdjustment(initialAdjustment);
        }}
        open={Boolean(selectedItem)}
        title={selectedItem ? `${selectedItem.productName} inventory action` : 'Inventory action'}
      >
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!selectedItem) {
              return;
            }

            await adminApi.adjustInventory(selectedItem.productId, adjustment.action, {
              quantity: Number(adjustment.quantity)
            });
            setSelectedItem(null);
            setAdjustment(initialAdjustment);
            setRefreshKey((value) => value + 1);
          }}
        >
          <div className="form-grid-full detail-specs">
            <span>Current stock: {selectedItem?.quantity ?? '--'}</span>
            <span>Reserved: {selectedItem?.reservedQuantity ?? '--'}</span>
            <span>Sold: {selectedItem?.soldQuantity ?? '--'}</span>
          </div>
          <label>
            Action
            <select
              value={adjustment.action}
              onChange={(event) => setAdjustment((current) => ({ ...current, action: event.target.value }))}
            >
              <option value="add">Add stock</option>
              <option value="remove">Remove stock</option>
              <option value="reserve">Reserve</option>
              <option value="sold">Mark sold</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              min="1"
              required
              type="number"
              value={adjustment.quantity}
              onChange={(event) => setAdjustment((current) => ({ ...current, quantity: event.target.value }))}
            />
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Apply action
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default InventoryPage;
