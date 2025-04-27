import React from 'react';
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

      <div className={styles.actionCol}>
        <button className={styles.menuButton}>⋮</button>
      </div>
    </div>
  );
};


export default AdminUser;
