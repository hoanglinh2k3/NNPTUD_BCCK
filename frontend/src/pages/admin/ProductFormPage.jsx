import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, productApi, productImageApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import ProductForm from '../../components/admin/ProductForm';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { usePageData } from '../../hooks/usePageData';
import { resolveAssetUrl } from '../../utils/format';

const initialForm = {
  name: '',
  sku: '',
  categoryId: '',
  price: '',
  discountPrice: '',
  description: '',
  material: '',
  color: '',
  size: '',
  collectionName: '',
  status: 'ACTIVE'
};

function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { data, loading } = usePageData(async () => {
    const categoriesResponse = await categoryApi.getCategories({ limit: 50 });
    const product = id ? await productApi.getProduct(id) : null;
    return {
      categories: categoriesResponse.data || [],
      product
    };
  }, [id, refreshKey]);

  useEffect(() => {
    if (data?.product) {
      setForm({
        ...initialForm,
        ...data.product
      });
    }
  }, [data]);

  const selectedFilePreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file)
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      selectedFilePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedFilePreviews]);

  if (loading) {
    return <LoadingSpinner label="Loading product form..." />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null
    };

    try {
      const product = id ? await productApi.updateProduct(id, payload) : await productApi.createProduct(payload);

      if (selectedFiles.length) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('images', file));
        await productImageApi.uploadImages(product.id, formData);
      }

      navigate('/admin/products');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to save product or upload images.');
    }
  };

  const currentImages = (data?.product?.images || []).map((image) => ({
    ...image,
    imageUrl: resolveAssetUrl(image.imageUrl)
  }));

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Product form</span>
            <h2>{id ? 'Edit product' : 'Create product'}</h2>
          </div>
          <BackButton fallbackTo="/admin/products" />
        </div>
        <ProductForm
          categories={data.categories}
          form={form}
          onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))}
          onSubmit={handleSubmit}
          submitLabel={id ? 'Update product' : 'Create product'}
        />
        <label className="upload-box">
          Product images
          <input
            accept="image/*"
            multiple
            type="file"
            onChange={(event) => {
              setSelectedFiles(Array.from(event.target.files || []));
              setError('');
              setMessage('');
            }}
          />
        </label>
        {selectedFilePreviews.length ? (
          <div className="upload-preview-grid">
            {selectedFilePreviews.map((file) => (
              <article className="upload-preview-card" key={file.previewUrl}>
                <img alt={file.name} className="upload-preview-thumb" src={file.previewUrl} />
                <strong>{file.name}</strong>
              </article>
            ))}
          </div>
        ) : null}
        {id && currentImages.length ? (
          <div className="product-image-manager">
            <div className="section-head">
              <div>
                <h3>Current product images</h3>
                <p>Set a primary image or remove outdated photos.</p>
              </div>
            </div>
            <div className="upload-preview-grid">
              {currentImages.map((image) => (
                <article className="upload-preview-card" key={image.id}>
                  <img alt={form.name || 'Product image'} className="upload-preview-thumb" src={image.imageUrl} />
                  <div className="upload-preview-meta">
                    <span className={`pill ${image.isPrimary ? 'pill-success' : 'pill-muted'}`}>
                      {image.isPrimary ? 'Primary' : 'Gallery'}
                    </span>
                    <div className="inline-actions">
                      {!image.isPrimary ? (
                        <button
                          className="button button-secondary"
                          onClick={async () => {
                            try {
                              setError('');
                              await productImageApi.setPrimary(image.id, { isPrimary: true });
                              setMessage('Primary product image updated.');
                              setRefreshKey((value) => value + 1);
                            } catch (apiError) {
                              setError(apiError.response?.data?.message || 'Unable to update primary image.');
                            }
                          }}
                          type="button"
                        >
                          Set primary
                        </button>
                      ) : null}
                      <button
                        className="button button-ghost"
                        onClick={async () => {
                          try {
                            setError('');
                            await productImageApi.deleteImage(image.id);
                            setMessage('Product image deleted.');
                            setRefreshKey((value) => value + 1);
                          } catch (apiError) {
                            setError(apiError.response?.data?.message || 'Unable to delete product image.');
                          }
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="success-note">{message}</p> : null}
      </section>
    </div>
  );
}

export default ProductFormPage;
