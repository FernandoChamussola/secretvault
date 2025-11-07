import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, secrets as secretsApi } from '../lib/api';
import styles from '../styles/Secrets.module.css';

export default function Secrets() {
  const router = useRouter();
  const [secrets, setSecrets] = useState([]);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    setUser(auth.getCurrentUser());
    loadSecrets();
  }, [router]);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      const response = await secretsApi.list();
      setSecrets(response.data.secrets);
      setError('');
    } catch (err) {
      setError('Failed to load secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await secretsApi.create(name, value, notes);
      setName('');
      setValue('');
      setNotes('');
      setShowCreate(false);
      loadSecrets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create secret');
    }
  };

  const handleView = async (id) => {
    try {
      const response = await secretsApi.get(id);
      setSelectedSecret(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load secret');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this secret?')) return;

    try {
      await secretsApi.delete(id);
      setSelectedSecret(null);
      loadSecrets();
    } catch (err) {
      setError('Failed to delete secret');
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Secrets Vault</h1>
        <div className={styles.headerRight}>
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Your Secrets</h2>
            <button
              onClick={() => setShowCreate(true)}
              className={styles.createButton}
            >
              + New Secret
            </button>
          </div>

          <div className={styles.secretsList}>
            {secrets.length === 0 ? (
              <p className={styles.emptyMessage}>No secrets yet</p>
            ) : (
              secrets.map((secret) => (
                <div
                  key={secret.id}
                  className={`${styles.secretItem} ${
                    selectedSecret?.id === secret.id ? styles.active : ''
                  }`}
                  onClick={() => handleView(secret.id)}
                >
                  <h3>{secret.name}</h3>
                  <small>
                    {new Date(secret.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.main}>
          {showCreate ? (
            <div className={styles.card}>
              <h2>Create New Secret</h2>
              <form onSubmit={handleCreate} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={255}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="value">Secret Value</label>
                  <textarea
                    id="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    rows={5}
                    maxLength={10000}
                    placeholder="Enter your secret (password, API key, etc.)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="notes">Notes (optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Add any notes about this secret"
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.button}>
                    Create Secret
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedSecret ? (
            <div className={styles.card}>
              <h2>{selectedSecret.name}</h2>

              <div className={styles.secretDetail}>
                <label>Secret Value:</label>
                <div className={styles.secretValue}>
                  <pre>{selectedSecret.value}</pre>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(selectedSecret.value)
                    }
                    className={styles.copyButton}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {selectedSecret.notes && (
                <div className={styles.secretDetail}>
                  <label>Notes:</label>
                  <p>{selectedSecret.notes}</p>
                </div>
              )}

              <div className={styles.secretDetail}>
                <label>Created:</label>
                <p>{new Date(selectedSecret.createdAt).toLocaleString()}</p>
              </div>

              <div className={styles.secretDetail}>
                <label>Last Updated:</label>
                <p>{new Date(selectedSecret.updatedAt).toLocaleString()}</p>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => handleDelete(selectedSecret.id)}
                  className={styles.deleteButton}
                >
                  Delete Secret
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <p>Select a secret to view or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
