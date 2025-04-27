import React, { useState, useRef, useEffect } from 'react';
import DeleteAdminModal from './DeleteAdminModal';
import styles from '../Styles/AdminUser.module.css';

type Props = {
  user: {
    firstName: string;
    lastName: string;
    netId: string;
    role?: string;
    date?: Date;
  };
  token: string;
  removeHandler: (arg1: any) => any;
};

/**
 * AdminUser Component
 *
 * Displays an individual admin user entry, including their first name,
 * last name, NetID, and a button to remove the admin from the system.
 */

const AdminUser = ({ user, token, removeHandler }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
            <div className={styles.dropdownItem}>Edit</div>
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

    </div>
  );
};


export default AdminUser;
