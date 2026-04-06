import { useState } from 'react';
import { addressApi } from '../../api/services';
import AddressCard from '../../components/customer/AddressCard';
import BackButton from '../../components/shared/BackButton';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { usePageData } from '../../hooks/usePageData';

const initialForm = {
  receiverName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  detailAddress: '',
  isDefault: false
};

function AddressPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const { data, loading } = usePageData(() => addressApi.getAddresses(), [refreshKey]);

  const addresses = data || [];
  const defaultCount = addresses.filter((item) => item.isDefault).length;

  if (loading) {
    return <LoadingSpinner label="Loading addresses..." />;
  }

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.receiverName || !form.phone || !form.province || !form.district || !form.ward || !form.detailAddress) {
      setError('Please complete all delivery fields before saving the address.');
      return;
    }

    try {
      if (editing) {
        await addressApi.updateAddress(editing.id, form);
      } else {
        await addressApi.createAddress(form);
      }

      resetForm();
      setRefreshKey((value) => value + 1);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to save this address.');
    }
  };

  const handleDelete = async (address) => {
    try {
      await addressApi.deleteAddress(address.id);
      if (editing?.id === address.id) {
        resetForm();
      }
      setRefreshKey((value) => value + 1);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to delete this address.');
    }
  };

  const handleSetDefault = async (address) => {
    try {
      await addressApi.setDefaultAddress(address.id, { isDefault: true });
      setRefreshKey((value) => value + 1);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to update the default address.');
    }
  };

  return (
    <section className="container page-stack">
      {error ? <div className="section-card feedback-banner feedback-banner-error">{error}</div> : null}

      <section className="section-card profile-shell">
        <div className="profile-shell-head">
          <div className="profile-shell-copy">
            <span className="eyebrow">Addresses</span>
            <h1>Manage delivery addresses</h1>
            <p>Keep a clean list of saved delivery locations so checkout stays fast and accurate.</p>
          </div>
          <div className="profile-shell-actions">
            <div className="address-summary-row">
              <span className="pill pill-muted">{addresses.length} saved</span>
              <span className={`pill ${defaultCount ? 'pill-success' : 'pill-warning'}`}>
                {defaultCount ? `${defaultCount} default` : 'No default yet'}
              </span>
            </div>
            <BackButton fallbackTo="/profile" />
          </div>
        </div>
      </section>

      <div className="address-page-layout">
        <section className="section-card address-list-panel">
          <div className="section-head address-panel-head">
            <div>
              <span className="eyebrow">Saved list</span>
              <h2>Saved addresses</h2>
              <p>Select one to edit, remove, or mark as the default delivery destination.</p>
            </div>
            <button className="button button-secondary" onClick={resetForm} type="button">
              Add new
            </button>
          </div>

          {addresses.length ? (
            <div className="address-list-stack">
              {addresses.map((address) => (
                <AddressCard
                  actions={
                    <>
                      <button
                        className="button button-secondary"
                        onClick={() => {
                          setEditing(address);
                          setForm(address);
                          setError('');
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      {!address.isDefault ? (
                        <button className="button button-ghost" onClick={() => handleSetDefault(address)} type="button">
                          Set default
                        </button>
                      ) : null}
                      <button className="button button-ghost" onClick={() => handleDelete(address)} type="button">
                        Delete
                      </button>
                    </>
                  }
                  address={address}
                  key={address.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="Add a saved delivery address so checkout can start with one click."
              title="No addresses yet"
            />
          )}
        </section>

        <form className="section-card address-form-panel" onSubmit={handleSubmit}>
          <div className="section-head address-panel-head">
            <div>
              <span className="eyebrow">{editing ? 'Editing' : 'New address'}</span>
              <h2>{editing ? 'Update address' : 'Add a delivery address'}</h2>
              <p>Use a complete address so orders, support, and shipping updates arrive correctly.</p>
            </div>
            {editing ? (
              <button className="button button-ghost" onClick={resetForm} type="button">
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="form-grid address-form-grid">
            <label>
              Receiver name
              <input
                value={form.receiverName}
                onChange={(event) => setForm((current) => ({ ...current, receiverName: event.target.value }))}
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              Province
              <input
                value={form.province}
                onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))}
              />
            </label>
            <label>
              District
              <input
                value={form.district}
                onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
              />
            </label>
            <label>
              Ward
              <input
                value={form.ward}
                onChange={(event) => setForm((current) => ({ ...current, ward: event.target.value }))}
              />
            </label>
            <label className="form-grid-full">
              Detail address
              <input
                value={form.detailAddress}
                onChange={(event) => setForm((current) => ({ ...current, detailAddress: event.target.value }))}
              />
            </label>
          </div>

          <label className="address-default-toggle">
            <input
              checked={Boolean(form.isDefault)}
              onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
              type="checkbox"
            />
            <div>
              <strong>Set as default address</strong>
              <p>This address will be preselected during checkout.</p>
            </div>
          </label>

          <div className="form-actions">
            <button className="button button-primary" type="submit">
              {editing ? 'Update address' : 'Save address'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddressPage;
