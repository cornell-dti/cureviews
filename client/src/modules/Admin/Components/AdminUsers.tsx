import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/ManageAdmins.module.css';

import { Student } from 'common';
import AdminUser from './AdminUser';

type Props = {
  token: string;
};

const ManageAdmins = ({ token }: Props) => {
  const [admins, setAdmins] = useState<Student[]>([]);
  const [netId, setNetId] = useState<string>('');

  /**
   * Fetch all admins when the page loads
   */
  useEffect(() => {
    if (!token) return;
    const getAdmins = async () => {
      const response = await axios.post('/api/admin/users/get', { token });
      if (response.status === 200) {
        setAdmins(response.data.result);
      }
    };
    getAdmins();
  }, [token]);

  /**
   * Remove an admin from the list
   */
  const removeAdmin = async (user: Student) => {
    const response = await axios.post('/api/admin/users/remove', {
      userId: user.netId,
      token: token
    });

    if (response.status === 200) {
      setAdmins(admins.filter((admin) => admin.netId !== user.netId));
    }
  };

  /**
   * Add a new admin by NetID
   */
  const addAdminByNetId = async (_netId: string) => {
    const response = await axios.post('/api/admin/users/add', {
      userId: _netId,
      token: token
    });

    if (response.status === 200) {
      console.log(`Successfully gave admin privilege to ${_netId}`);
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1>Manage Administrators</h1>

      <div className={styles.addAdmin}>
        <input
          className={styles.textInputBox}
          value={netId}
          onChange={(e) => setNetId(e.target.value)}
          placeholder="Enter user NetID"
        />
        <button className={styles.addAdminButton} onClick={() => addAdminByNetId(netId)}>
          Add Administrator
        </button>
      </div>

      <div className={styles.adminList}>
        {admins.map((admin) => (
          <AdminUser key={admin.netId} user={admin} token={token} removeHandler={removeAdmin} />
        ))}
      </div>
    </div>
  );
};

export default ManageAdmins;
