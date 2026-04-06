function AddressCard({ address, actions }) {
  return (
    <article className={`address-card ${address?.isDefault ? 'is-default' : ''} ${actions ? 'has-actions' : ''}`.trim()}>
      <div className="address-card-main">
        <div className="address-card-head">
          <strong>{address.receiverName}</strong>
          {address?.isDefault ? <span className="pill pill-success">Default</span> : null}
        </div>
        <p>{address.phone}</p>
        <p>
          {[address.detailAddress, address.ward, address.district, address.province]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>
      {actions ? <div className="address-actions">{actions}</div> : null}
    </article>
  );
}

export default AddressCard;
