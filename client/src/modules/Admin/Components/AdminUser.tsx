import React, { useState, useRef, useEffect } from 'react';
import DeleteAdminModal from './DeleteAdminModal';
import AddAdminModal from './AddAdminModal';
import styles from '../Styles/AdminUser.module.css';

type Role = 'Designer' | 'TPM' | 'PM' | 'PMM' | 'Developer';

type Props = {
  user: {
    firstName: string;
    lastName: string;
    netId: string;
    role?: Role;
    date?: Date;
  };
  token: string;
  removeHandler: (arg1: any) => any;
  refreshAdmins: () => Promise<void>;
};

/**
 * AdminUser Component
 *
 * Displays an individual admin user entry, including their first name,
 * last name, NetID, role, and date added/edited and a button to edit or
 * remove the admin from the system.
 */

const AdminUser = ({ user, token, removeHandler, refreshAdmins }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className={styles.adminRow}>
      <div className={styles.nameCol}>
        <div className={styles.fullName}>{user.firstName} {user.lastName}</div>
        <div className={styles.netId}>{user.netId}</div>
      </div>

      <div className={styles.roleCol}>
        <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase() ?? 'default']}`}>
          {user.role?.trim() ? user.role : 'No Role'}
        </span>
      </div>

      <div className={styles.dateCol}>
        {user.date ? new Date(user.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
      </div>

      <div className={styles.actionCol} ref={menuRef}>
        <button className={styles.menuButton} onClick={() => setMenuOpen((prev) => !prev)}>⋮</button>

        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <div
              className={styles.dropdownItem}
              onClick={() => {
                setEditModalOpen(true);
                setMenuOpen(false);
              }}
            >
              Edit
            </div>
            <div
              className={styles.dropdownItem}
              onClick={() => {
                setDeleteModalOpen(true);
                setMenuOpen(false);
              }}
            >
              Delete
            </div>
          </div>
        )}

      </div>
      <DeleteAdminModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          removeHandler(user);
          setDeleteModalOpen(false);
        }}
      />
      <AddAdminModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        onSuccess={async () => {
          await refreshAdmins();
          setEditModalOpen(false);
        }}
        token={token}
        mode="edit"
        initialValues={{
          name: `${user.firstName} ${user.lastName}`,
          netId: user.netId,
          role: (user.role as Role) ?? 'No Role'
        }}
      />
    </div>
  );
};


export default AdminUser;
