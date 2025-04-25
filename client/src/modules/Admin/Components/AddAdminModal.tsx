import React, { useEffect, useState } from 'react';
import styles from '../Styles/AddAdminModal.module.css';
import axios from 'axios';
import closeIcon from '../../../assets/icons/X.svg';

type Role = 'Designer' | 'TPM' | 'PM' | 'PMM' | 'Developer';

type ModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  token: string;
};

/**
 * Add Admin Component
 *
 * Modal that will pop up with a form to take in admin details (name, netid, 
 * and role). Submitting the form will give admin privilege to the user with
 * the given netid. 
 */

const AddAdminModal = ({ open, setOpen, onSuccess, token }: ModalProps) => {
  const [name, setName] = useState('');
  const [netId, setNetId] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setValid(name.trim() !== '' && netId.trim() !== '' && role !== '');
  }, [name, netId, role]);

  const closeModal = () => {
    setOpen(false);
    setName('');
    setNetId('');
    setRole('');
    setError('');
  };

  const addAdminByNetId = async (_netId: string, _role: string, _name: string) => {
    const [_firstName, ...rest] = _name.trim().split(' ');
    const _lastName = rest.join(' ');

    const response = await axios.post('/api/admin/users/add', {
      userId: _netId,
      role: _role,
      firstName: _firstName,
      lastName: _lastName,
      token: token
    });

    if (response.status !== 200) {
      throw new Error(response.data.error || 'Failed to add admin');
    }
  };

  const handleSubmit = async () => {
    if (!valid) return;

    setLoading(true);
    setError('');

    try {
      await addAdminByNetId(netId, role, name);
      onSuccess();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Error adding admin');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalbg}>
      <div className={styles.modal}>
        <img
          className={styles.closeicon}
          onClick={closeModal}
          src={closeIcon}
          alt="close-modal"
        />

        <div className={styles.title}>Add New Admin</div>

        <div className={styles.content}>
          <div className={styles.formcol}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last name"
            />

            <div className={styles.secondRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Net ID</label>
                <input
                  className={styles.input}
                  value={netId}
                  onChange={(e) => setNetId(e.target.value)}
                  placeholder="abc123"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Role</label>
                <select
                  className={styles.input}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="Designer">Designer</option>
                  <option value="TPM">TPM</option>
                  <option value="PM">PM</option>
                  <option value="PMM">PMM</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.submitbutton}
              onClick={handleSubmit}
              disabled={!valid || loading}
            >
              {loading ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;
