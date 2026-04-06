function ProductForm({ form, categories = [], onChange, onSubmit, submitLabel = 'Save product' }) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Product name
        <input name="name" value={form.name || ''} onChange={onChange} />
      </label>
      <label>
        SKU
        <input name="sku" value={form.sku || ''} onChange={onChange} />
      </label>
      <label>
        Category
        <select name="categoryId" value={form.categoryId || ''} onChange={onChange}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Price
        <input name="price" type="number" value={form.price || ''} onChange={onChange} />
      </label>
      <label>
        Discount price
        <input name="discountPrice" type="number" value={form.discountPrice || ''} onChange={onChange} />
      </label>
      <label>
        Material
        <input name="material" value={form.material || ''} onChange={onChange} />
      </label>
      <label>
        Color
        <input name="color" value={form.color || ''} onChange={onChange} />
      </label>
      <label>
        Size
        <input name="size" value={form.size || ''} onChange={onChange} />
      </label>
      <label>
        Collection
        <input name="collectionName" value={form.collectionName || ''} onChange={onChange} />
      </label>
      <label className="form-grid-full">
        Description
        <textarea name="description" rows="5" value={form.description || ''} onChange={onChange} />
      </label>
      <div className="form-grid-full form-actions">
        <button className="button button-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
