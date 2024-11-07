import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/ManageAdminModal.module.css';

import { Student } from 'common';
import AdminUser from './AdminUser';
import closeIcon from '../../../assets/icons/X.svg';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  token: string;
};

const ManageAdminModal = ({ token, open, setOpen }: Props) => {
  const [admins, setAdmins] = useState<Student[]>([]);
  const [netId, setNetId] = useState<string>('');

  function closeModal() {
    setOpen(false);
  }

  /**
   * Endpoint to get all admins
   */
  useEffect(() => {
    async function getAdmins() {
      const response = await axios.post('/api/admin/users/get', {
        token: token
      });
      const adminUsers = response.data.result;
      if (response.status === 200) {
        setAdmins(adminUsers);
      }
    }
    getAdmins();
  }, [token]);

  /**
   * Removes an admin from the list, giving that user 'regular' privilege
   * @param user assumes that this user already has admin privilege
   */
  async function removeAdmin(user: Student) {
    const response = await axios.post('/api/admin/users/remove', {
      userId: user.netId,
      token: token
    });

    if (response.status === 200) {
      const updatedAdmins = admins.filter((admin: Student) => {
        return admin && admin.netId !== user.netId;
      });
      setAdmins(updatedAdmins);
    }
  }

  /**
   * Calls endpoint to add or update a user with admin privilege
   * @param _netId the user's net id
   */
  async function addAdminByNetId(_netId: string) {
    const response = await axios.post('/api/admin/users/add', {
      userId: _netId,
      token: token
    });

    if (response.status === 200) {
      console.log(`Successfully gave admin privilege to ${_netId}`);
    }
  }

  function onTextChange(newText: string) {
    setNetId(newText);
  }

  if (!open) {
    return <></>;
  }

  return (
    <div className={styles.modalbg}>
      <div className={styles.modal}>
        <h2>Administrators</h2>
        <img
          className={styles.closeButton}
          onClick={closeModal}
          src={closeIcon}
          alt="close-modal"
        />
        <div className={styles.addAdmin}>
          <input
            className={styles.textInputBox}
            value={netId}
            onChange={(e) => onTextChange(e.target.value)}
            name="new-admin"
            id="new-admin"
            placeholder="User net-id"
          ></input>
          <button
            className={styles.addAdminButton}
            onClick={() => addAdminByNetId(netId)}
          >
            Add administrator
          </button>
        </div>
        <br></br>
        {admins.map((admin) => {
          return (
            <AdminUser user={admin} token={token} removeHandler={removeAdmin} />
          );
        })}
      </div>
    </div>
  );
};

export default ManageAdminModal;
