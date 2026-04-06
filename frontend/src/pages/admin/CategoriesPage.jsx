import { useState } from 'react';
import { categoryApi } from '../../api/services';
import DataTable from '../../components/admin/DataTable';
import BackButton from '../../components/shared/BackButton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';
import { usePageData } from '../../hooks/usePageData';

const initialForm = { name: '', description: '', parentId: '' };

function CategoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const { data, loading } = usePageData(() => categoryApi.getCategories({ limit: 50 }), [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading categories..." />;
  }

  const categories = data.data || [];

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <h2>Create category</h2>
          <BackButton fallbackTo="/admin" />
        </div>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await categoryApi.createCategory({
              ...form,
              parentId: form.parentId ? Number(form.parentId) : null
            });
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
            <input
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label>
            Parent category
            <select value={form.parentId} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value }))}>
              <option value="">No parent</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Save category
            </button>
          </div>
        </form>
      </section>
      <section className="section-card">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'parentName', label: 'Parent' },
            { key: 'description', label: 'Description' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="inline-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingCategory(row);
                      setEditForm({
                        name: row.name || '',
                        description: row.description || '',
                        parentId: row.parentId ? String(row.parentId) : ''
                      });
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="button button-ghost"
                    onClick={() => categoryApi.deleteCategory(row.id).then(() => setRefreshKey((value) => value + 1))}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
          rows={categories}
        />
      </section>

      <Modal
        onClose={() => {
          setEditingCategory(null);
          setEditForm(initialForm);
        }}
        open={Boolean(editingCategory)}
        title={editingCategory ? `Edit ${editingCategory.name}` : 'Edit category'}
      >
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!editingCategory) {
              return;
            }

            await categoryApi.updateCategory(editingCategory.id, {
              name: editForm.name,
              description: editForm.description,
              parentId: editForm.parentId ? Number(editForm.parentId) : null
            });
            setEditingCategory(null);
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
          <label className="form-grid-full">
            Parent category
            <select
              value={editForm.parentId}
              onChange={(event) => setEditForm((current) => ({ ...current, parentId: event.target.value }))}
            >
              <option value="">No parent</option>
              {categories
                .filter((category) => category.id !== editingCategory?.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Save category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CategoriesPage;
