import React from 'react';
import styles from './ManageAdmins.module.css';

type Props = {
  user: any;
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
    <div className={styles.userEntry}>
      {user.firstName} {user.lastName}, {user.netId}
      <button
        className={styles.removeButton}
        onClick={() => removeHandler(user)}
      >
        Remove
      </button>
    </div>
  );
};

export default AdminUser;