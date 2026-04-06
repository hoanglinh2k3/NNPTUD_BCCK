import { useState } from 'react';
import { notificationApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import NotificationList from '../../components/customer/NotificationList';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { usePageData } from '../../hooks/usePageData';

function NotificationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    audienceType: 'USER',
    userId: '',
    roleName: 'Customer',
    title: '',
    content: '',
    type: 'ORDER'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const { data, loading } = usePageData(async () => {
    const [notifications, recipients] = await Promise.all([
      notificationApi.getAll(),
      notificationApi.getRecipients()
    ]);
    return { notifications, recipients };
  }, [refreshKey]);

  if (loading) {
    return <LoadingSpinner label="Loading notifications..." />;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Notification management</span>
            <h2>Create targeted or broadcast notifications</h2>
          </div>
          <BackButton fallbackTo="/admin" />
        </div>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await notificationApi.create({
              audienceType: form.audienceType,
              userId: form.audienceType === 'USER' ? Number(form.userId) : undefined,
              roleName: form.audienceType === 'ROLE' ? form.roleName : undefined,
              title: form.title,
              content: form.content,
              type: form.type
            });
            setSuccessMessage(`Notification queued for ${result.count} recipient(s).`);
            setForm({
              audienceType: 'USER',
              userId: '',
              roleName: 'Customer',
              title: '',
              content: '',
              type: 'ORDER'
            });
            setRefreshKey((value) => value + 1);
          }}
        >
          <label>
            Audience
            <select
              value={form.audienceType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  audienceType: event.target.value,
                  userId: '',
                  roleName: current.roleName || 'Customer'
                }))
              }
            >
              <option value="USER">Single user</option>
              <option value="ROLE">By role</option>
              <option value="ALL">All active users</option>
            </select>
          </label>
          {form.audienceType === 'USER' ? (
            <label>
              Recipient
              <select
                required
                value={form.userId}
                onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
              >
                <option value="">Select user</option>
                {(data.recipients || []).map((recipient) => (
                  <option key={recipient.userId} value={recipient.userId}>
                    {recipient.fullName} ({recipient.role})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {form.audienceType === 'ROLE' ? (
            <label>
              Role
              <select
                value={form.roleName}
                onChange={(event) => setForm((current) => ({ ...current, roleName: event.target.value }))}
              >
                {['Customer', 'Staff', 'Admin'].map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Title
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label>
            Type
            <input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
          </label>
          <label className="form-grid-full">
            Content
            <textarea rows="4" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
          </label>
          <div className="form-grid-full form-actions">
            <button className="button button-primary" type="submit">
              Send notification
            </button>
          </div>
        </form>
        {successMessage ? <p className="success-note">{successMessage}</p> : null}
      </section>
      <section className="section-card">
        <h2>My recent notifications</h2>
        <p>This list shows notifications received by the currently signed-in admin or staff account.</p>
        <NotificationList notifications={data.notifications || []} />
      </section>
    </div>
  );
}

export default NotificationsPage;
