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
  mode: 'add' | 'edit';
  initialValues?: {
    name: string;
    netId: string;
    role: Role;
  };
};

/**
 * Add Admin Component
 *
 * Modal that will pop up with a form to take in admin details (name, netid,
 * and role). Submitting the form will give admin privilege to the user with
 * the given netid.
 */

const AddAdminModal = ({
  open,
  setOpen,
  onSuccess,
  token,
  mode,
  initialValues
}: ModalProps) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [netId, setNetId] = useState(initialValues?.netId || '');
  const [role, setRole] = useState<string | ''>(initialValues?.role || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (initialValues && mode === 'edit') {
      setName(initialValues.name);
      setNetId(initialValues.netId);
      setRole(initialValues.role);
    }
  }, [initialValues, mode]);

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

  const addAdminByNetId = async (
    _netId: string,
    _role: string,
    _name: string
  ) => {
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

        <div className={styles.title}>
          {mode === 'add' ? 'Add New Admin' : 'Edit Admin'}
        </div>

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
                  <option value="" disabled>
                    Select Role
                  </option>
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
              {loading
                ? mode === 'add'
                  ? 'Adding...'
                  : 'Saving...'
                : mode === 'add'
                  ? 'Add Admin'
                  : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;
