import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, userApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import { useAuth } from '../../hooks/useAuth';
import { resolveAssetUrl } from '../../utils/format';

function ProfilePage({ backTo }) {
  const { user, setUser } = useAuth();
  const isAdminConsole = user?.role === 'Admin' || user?.role === 'Staff';
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : ''),
    [avatarFile]
  );
  const toolbarLinks = isAdminConsole
    ? [{ label: 'Admin console', to: '/admin' }]
    : [{ label: 'Addresses', to: '/addresses' }];
  const sectionTitle =
    activeSection === 'profile' ? 'Manage your account details' : 'Update your password';
  const sectionDescription =
    activeSection === 'profile'
      ? 'Keep your personal details and avatar current for orders and support.'
      : 'Use a strong password to keep your decor account secure.';

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const nextUser = await userApi.updateProfile(profile);
      setUser(nextUser);
      setMessage('Profile updated successfully');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await authApi.changePassword(passwordForm);
      setPasswordForm({ oldPassword: '', newPassword: '' });
      setMessage('Password updated successfully');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();
    if (!avatarFile) {
      setError('Choose an image file before uploading a new avatar.');
      return;
    }

    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const nextUser = await userApi.uploadAvatar(formData);
      setUser(nextUser);
      setAvatarFile(null);
      setMessage('Avatar updated successfully');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to upload avatar.');
    }
  };

  return (
    <section className="container page-stack">
      {error ? <div className="section-card feedback-banner feedback-banner-error">{error}</div> : null}
      {message ? <div className="section-card feedback-banner feedback-banner-success">{message}</div> : null}

      <section className="section-card profile-shell">
        <div className="profile-shell-head">
          <div className="profile-shell-copy">
            <span className="eyebrow">{isAdminConsole ? 'Console profile' : 'Profile'}</span>
            <h2>{sectionTitle}</h2>
            <p>{sectionDescription}</p>
          </div>
          <div className="profile-shell-actions">
            <div className="profile-inline-identity glass-ribbon">
              {avatarPreview || user?.avatarUrl ? (
                <img
                  alt={user?.fullName || 'User avatar'}
                  className="profile-inline-avatar"
                  src={avatarPreview || resolveAssetUrl(user.avatarUrl)}
                />
              ) : (
                <div className="profile-inline-avatar profile-avatar-fallback">{user?.fullName?.slice(0, 1) || 'U'}</div>
              )}
              <div className="account-copy">
                <strong>{user?.fullName}</strong>
                <small>{user?.role}</small>
                <span className="profile-email">{user?.email}</span>
              </div>
            </div>
            <BackButton fallbackTo={backTo || (user?.role === 'Customer' ? '/' : '/admin')} />
          </div>
        </div>

        <div className="profile-tab-strip" role="tablist" aria-label="Profile sections">
          <div className="profile-tab-scroll">
            <button
              className={`profile-tab-button ${activeSection === 'profile' ? 'is-active' : ''}`}
              onClick={() => setActiveSection('profile')}
              role="tab"
              aria-selected={activeSection === 'profile'}
              type="button"
            >
              Profile details
            </button>
            <button
              className={`profile-tab-button ${activeSection === 'password' ? 'is-active' : ''}`}
              onClick={() => setActiveSection('password')}
              role="tab"
              aria-selected={activeSection === 'password'}
              type="button"
            >
              Change password
            </button>
            {toolbarLinks.map((item) => (
              <Link className="profile-tab-link" key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {activeSection === 'profile' ? (
          <div className="profile-content-flow">
            <form className="profile-subsection" onSubmit={handleAvatarSubmit}>
              <div className="profile-subsection-head">
                <div>
                  <h3>Avatar</h3>
                  <p>Upload a square image to personalize your account and support conversations.</p>
                </div>
              </div>
              <div className="profile-avatar-editor">
                {avatarPreview || user?.avatarUrl ? (
                  <img
                    alt={user?.fullName || 'User avatar'}
                    className="profile-avatar profile-avatar-large"
                    src={avatarPreview || resolveAssetUrl(user.avatarUrl)}
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-fallback profile-avatar-large">
                    {user?.fullName?.slice(0, 1) || 'U'}
                  </div>
                )}
                <div className="profile-avatar-controls">
                  <input
                    accept="image/*"
                    className="visually-hidden"
                    id="profile-avatar-input"
                    type="file"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  />
                  <div className="profile-file-row">
                    <label className="button button-secondary" htmlFor="profile-avatar-input">
                      Choose image
                    </label>
                    <span className="profile-file-name">{avatarFile ? avatarFile.name : 'No file selected'}</span>
                  </div>
                  <div className="form-actions">
                    <button className="button button-primary" type="submit">
                      Upload avatar
                    </button>
                    {avatarFile ? (
                      <button className="button button-ghost" onClick={() => setAvatarFile(null)} type="button">
                        Clear
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </form>

            <form className="profile-subsection profile-fields-form" onSubmit={handleProfileSubmit}>
              <div className="profile-subsection-head">
                <div>
                  <h3>Profile information</h3>
                  <p>These details are used for delivery, account support, and order updates.</p>
                </div>
              </div>
              <div className="form-grid profile-form-grid">
                <label>
                  Full name
                  <input
                    value={profile.fullName}
                    onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={profile.phone}
                    onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button button-primary" type="submit">
                  Save profile
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form className="profile-content-flow" onSubmit={handlePasswordSubmit}>
            <section className="profile-subsection profile-security-panel">
              <div className="profile-subsection-head">
                <div>
                  <h3>Change password</h3>
                  <p>Use at least 8 characters and avoid reusing an old password.</p>
                </div>
              </div>
              <div className="form-grid profile-form-grid">
                <label>
                  Current password
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }))
                    }
                  />
                </label>
                <label>
                  New password
                  <input
                    minLength={8}
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button button-primary" type="submit">
                  Update password
                </button>
              </div>
            </section>
          </form>
        )}
      </section>
    </section>
  );
}

export default ProfilePage;
