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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [addedAfter, setAddedAfter] = useState('');
  const [addedBefore, setAddedBefore] = useState('');
  const [tempSelectedRole, setTempSelectedRole] = useState('');
  const [tempAddedAfter, setTempAddedAfter] = useState('');
  const [tempAddedBefore, setTempAddedBefore] = useState('');
  const [sortOption, setSortOption] = useState('date-latest');
  const [sortOpen, setSortOpen] = useState(false);
  const isFilterActive =
    selectedRole !== '' ||
    addedAfter !== '' ||
    addedBefore !== '' ||
    sortOption !== 'date-latest';



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
            {isFilterActive && (
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSelectedRole('');
                  setAddedAfter('');
                  setAddedBefore('');
                  setSortOption('date-latest');
                  setFilterOpen(false);
                  setSortOpen(false);
                }}
              >
                Reset Filters
              </button>
            )}
            <div className={styles.filterWrapper}>
              <button
                className={styles.filterButton}
                onClick={() => {
                  setTempSelectedRole(selectedRole);
                  setTempAddedAfter(addedAfter);
                  setTempAddedBefore(addedBefore);
                  setFilterOpen(true);
                }}
              >
                Filter
              </button>
              <div className={styles.dropdownContainer}>
                {filterOpen && (
                  <div className={styles.filterDropdown}>
                    <div className={styles.filterItem}>
                      <label>Role</label>
                      <select
                        value={tempSelectedRole}
                        onChange={(e) => setTempSelectedRole(e.target.value)}
                        className={styles.input}
                      >
                        <option value="">Select Role</option>
                        <option value="Designer">Designer</option>
                        <option value="TPM">TPM</option>
                        <option value="PM">PM</option>
                        <option value="PMM">PMM</option>
                        <option value="Developer">Developer</option>
                      </select>
                    </div>

                    <div className={styles.filterItem}>
                      <label>Added After</label>
                      <input
                        type="date"
                        value={tempAddedAfter}
                        onChange={(e) => setTempAddedAfter(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.filterItem}>
                      <label>Added Before</label>
                      <input
                        type="date"
                        value={tempAddedBefore}
                        onChange={(e) => setTempAddedBefore(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.filterButtons}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => {
                          setSelectedRole('');
                          setAddedAfter('');
                          setAddedBefore('');
                          setFilterOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.applyButton}
                        onClick={() => {
                          setSelectedRole(tempSelectedRole);
                          setAddedAfter(tempAddedAfter);
                          setAddedBefore(tempAddedBefore);
                          setFilterOpen(false);
                        }}
                      >
                        Apply
                      </button>

                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sortWrapper}>
              <button className={styles.sortButton} onClick={() => setSortOpen(!sortOpen)}>
                Sort
              </button>

              {sortOpen && (
                <div className={styles.sortDropdown}>
                  <div
                    className={`${styles.sortItem} ${sortOption === 'name' ? styles.selectedSort : ''}`}
                    onClick={() => { setSortOption('name'); setSortOpen(false); }}
                  >
                    Name (Alphabetical)
                  </div>
                  <div
                    className={`${styles.sortItem} ${sortOption === 'role' ? styles.selectedSort : ''}`}
                    onClick={() => { setSortOption('role'); setSortOpen(false); }}
                  >
                    Role (Alphabetical)
                  </div>
                  <div
                    className={`${styles.sortItem} ${sortOption === 'date-latest' ? styles.selectedSort : ''}`}
                    onClick={() => { setSortOption('date-latest'); setSortOpen(false); }}
                  >
                    Date Added: Latest
                  </div>
                  <div
                    className={`${styles.sortItem} ${sortOption === 'date-earliest' ? styles.selectedSort : ''}`}
                    onClick={() => { setSortOption('date-earliest'); setSortOpen(false); }}
                  >
                    Date Added: Earliest
                  </div>
                </div>
              )}

            </div>


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
            .filter(admin => {
              if (selectedRole && admin.role !== selectedRole) return false;
              if (admin.date) {
                const adminDate = new Date(admin.date);

                if (addedAfter && adminDate < new Date(addedAfter)) return false;
                if (addedBefore && adminDate > new Date(addedBefore)) return false;
              }
              return true;
            })
            .filter(admin =>
              `${admin.firstName} ${admin.lastName} ${admin.netId}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
              if (sortOption === 'name') {
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
              } else if (sortOption === 'role') {
                return (a.role || '').localeCompare(b.role || '');
              } else if (sortOption === 'date-latest') {
                return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
              } else if (sortOption === 'date-earliest') {
                return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
              }
              return 0;
            })
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
