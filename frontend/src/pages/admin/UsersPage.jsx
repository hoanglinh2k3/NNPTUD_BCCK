import { useState } from 'react';
import { roleApi, userApi } from '../../api/services';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import BackButton from '../../components/shared/BackButton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';
import { usePageData } from '../../hooks/usePageData';

const initialCreateForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  roleId: ''
};

const initialEditForm = {
  fullName: '',
  email: '',
  phone: '',
  roleId: '',
  status: 'ACTIVE'
};

function UsersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(initialCreateForm);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const { data, loading } = usePageData(async () => {
    const [usersResponse, rolesResponse] = await Promise.all([userApi.getUsers({ limit: 20 }), roleApi.getRoles()]);
    return {
      users: usersResponse.data || [],
      roles: rolesResponse.data || []
    };
  }, [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading users..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">User management</span>
            <h2>Create staff or customer accounts</h2>
          </div>
          <BackButton fallbackTo="/admin" />
        </div>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await userApi.createUser({ ...form, roleId: Number(form.roleId) });
            setForm(initialCreateForm);
            setRefreshKey((value) => value + 1);
          }}
        >
          <label>
            Full name
            <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label>
            Role
            <select value={form.roleId} onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}>
              <option value="">Select role</option>
              {data.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Create user
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <FilterBar>
          <strong>Latest users</strong>
        </FilterBar>
        <DataTable
          columns={[
            { key: 'fullName', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="inline-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingUser(row);
                      setEditForm({
                        fullName: row.fullName || '',
                        email: row.email || '',
                        phone: row.phone || '',
                        roleId: String(row.roleId || ''),
                        status: row.status || 'ACTIVE'
                      });
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="button button-ghost"
                    onClick={() =>
                      userApi
                        .updateUserStatus(row.id, {
                          status: row.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
                        })
                        .then(() => setRefreshKey((value) => value + 1))
                    }
                    type="button"
                  >
                    {row.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                  </button>
                </div>
              )
            }
          ]}
          rows={data.users}
        />
      </section>

      <Modal
        onClose={() => {
          setEditingUser(null);
          setEditForm(initialEditForm);
        }}
        open={Boolean(editingUser)}
        title={editingUser ? `Edit ${editingUser.fullName}` : 'Edit user'}
      >
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!editingUser) {
              return;
            }

            await userApi.updateUser(editingUser.id, {
              fullName: editForm.fullName,
              email: editForm.email,
              phone: editForm.phone,
              roleId: Number(editForm.roleId),
              status: editForm.status
            });
            setEditingUser(null);
            setEditForm(initialEditForm);
            setRefreshKey((value) => value + 1);
          }}
        >
          <label>
            Full name
            <input
              required
              value={editForm.fullName}
              onChange={(event) => setEditForm((current) => ({ ...current, fullName: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            Phone
            <input
              value={editForm.phone}
              onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
          <label>
            Role
            <select
              required
              value={editForm.roleId}
              onChange={(event) => setEditForm((current) => ({ ...current, roleId: event.target.value }))}
            >
              <option value="">Select role</option>
              {data.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-grid-full">
            Status
            <select
              value={editForm.status}
              onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}
            >
              {['ACTIVE', 'INACTIVE', 'BLOCKED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Save changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsersPage;
