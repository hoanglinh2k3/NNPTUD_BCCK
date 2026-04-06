import { useState } from 'react';
import { roleApi } from '../../api/services';
import DataTable from '../../components/admin/DataTable';
import BackButton from '../../components/shared/BackButton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';
import { usePageData } from '../../hooks/usePageData';

const initialForm = { name: '', description: '' };

function RolesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [editingRole, setEditingRole] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const { data, loading } = usePageData(() => roleApi.getRoles(), [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading roles..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <h2>Create role</h2>
          <BackButton fallbackTo="/admin" />
        </div>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await roleApi.createRole(form);
            setForm(initialForm);
            setRefreshKey((value) => value + 1);
          }}
        >
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            Description
            <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Save role
            </button>
          </div>
        </form>
      </section>
      <section className="section-card">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="inline-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingRole(row);
                      setEditForm({
                        name: row.name || '',
                        description: row.description || ''
                      });
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="button button-ghost"
                    disabled={['Admin', 'Staff', 'Customer'].includes(row.name)}
                    onClick={() => roleApi.deleteRole(row.id).then(() => setRefreshKey((value) => value + 1))}
                    type="button"
                  >
                    {['Admin', 'Staff', 'Customer'].includes(row.name) ? 'System role' : 'Delete'}
                  </button>
                </div>
              )
            }
          ]}
          rows={data.data || []}
        />
      </section>

      <Modal
        onClose={() => {
          setEditingRole(null);
          setEditForm(initialForm);
        }}
        open={Boolean(editingRole)}
        title={editingRole ? `Edit ${editingRole.name}` : 'Edit role'}
      >
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!editingRole) {
              return;
            }

            await roleApi.updateRole(editingRole.id, editForm);
            setEditingRole(null);
            setEditForm(initialForm);
            setRefreshKey((value) => value + 1);
          }}
        >
          <label>
            Name
            <input
              required
              value={editForm.name}
              onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Description
            <input
              value={editForm.description}
              onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Save role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RolesPage;
