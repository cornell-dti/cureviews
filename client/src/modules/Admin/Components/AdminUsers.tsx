import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/ManageAdmins.module.css';

import { Student } from 'common';
import AddAdminModal from './AddAdminModal';
import AdminUser from './AdminUser';

type Role = 'Designer' | 'TPM' | 'PM' | 'PMM' | 'Developer';

type Props = {
  token: string;
};

const ManageAdmins = ({ token }: Props) => {
  const [admins, setAdmins] = useState<Student[]>([]);
  const [netId, setNetId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      console.log("Successfully gave admin privilege to ${ _netId }");
    }
  };

  /**
   * Updates page with new admin
   */
  const refreshAdmins = async () => {
    const response = await axios.post('/api/admin/users/get', { token });
    if (response.status === 200) {
      setAdmins(response.data.result);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminHeader}>
        <h1>Manage Administrators</h1>
        <button className={styles.addAdminButtonTop} onClick={() => setIsModalOpen(true)}>
          <span>＋</span> Add Admin
        </button>
      </div>

      <AddAdminModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        token={token}
        mode="add"
        onSuccess={() => {
          axios.post('/api/admin/users/get', { token }).then((response) => {
            if (response.status === 200) {
              setAdmins(response.data.result);
            }
          });
        }}
      />

      <div className={styles.adminTable}>
        <div className={styles.searchFilterRow}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search Name or Net ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.buttonGroup}>
            <button className={styles.filterButton}>Filter</button>
            <button className={styles.sortButton}>Sort</button>
          </div>
        </div>
        <div className={styles.tableHeader}>
          <div className={styles.nameHeader}>Name</div>
          <div className={styles.roleHeader}>Role</div>
          <div className={styles.addedHeader}>Added</div>
          <div className={styles.actionHeader}></div>
        </div>

        <div className={styles.adminList}>
          {admins
            .filter(admin =>
              `${admin.firstName} ${admin.lastName} ${admin.netId}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .map((admin) => (
              <AdminUser
                key={admin.netId}
                user={{
                  firstName: admin.firstName,
                  lastName: admin.lastName,
                  netId: admin.netId,
                  role: admin.role as Role,
                  date: admin.date ? new Date(admin.date) : undefined,
                }}
                token={token}
                removeHandler={removeAdmin}
                refreshAdmins={refreshAdmins}
              />
            ))}
        </div>
      </div>

    </div>
  );
};

export default ManageAdmins;
