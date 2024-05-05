import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../Styles/ManageAdminModal.module.css'

import { Student } from 'common'
import AdminUser from './AdminUser'
import closeIcon from '../../../assets/icons/X.svg'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    token: string
  }

const ManageAdminModal = ({token, open, setOpen}: Props) => {
    const [admins, setAdmins] = useState<Student[]>([])
    const [netId, setNetId] = useState<string>("")

    function closeModal() {
        setOpen(false)
    }

    /**
     * Endpoint to get all admins
     */
    useEffect(() => {
        axios
        .post('/api/getAdmins', {token: token})
        .then((response) => {
          const result = response.data.result
          if (response.status === 200) {
            setAdmins(result)
          } else {
            console.log('Error at getAdmins')
          }
        })
      }, [token])

    /**
     * Removes an admin from the list, giving that user 'regular' privilege
     * @param user assumes that this user already has admin privilege
     */

    function removeAdmin(user: Student) {
        axios
        .post('/api/removeAdmin', {
            userId: user._id,
            token: token
        })
        .then((response) => {
            if (response.status === 200) {
                const updatedAdmins = admins.filter((admin: Student) => {
                    return admin && admin._id !== user._id
                })
                setAdmins(updatedAdmins)
            }
        }).catch((e) => console.log(`Unable to remove admin ${e}`))
    }

    /**
     * Calls endpoint to add or update a user with admin privilege
     * @param _netId the user's net id
     */

    function addAdminByNetId(_netId: string) {
        axios
        .post('/api/grantAdmin', {
            userId: _netId,
            token: token
        })
        .then((response) => {
            if (response.status === 200) {
                console.log(`Successfully gave admin privilege to ${_netId}`)
            }
        }).catch((e) => console.log(`Unable to remove admin ${e}`))
    }

    function onTextChange(newText: string) {
        setNetId(newText)
    }

    if (!open) {
        return <></>
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
                        className = {styles.addAdminButton}
                        onClick={() => addAdminByNetId(netId)}
                    >Add administrator</button>
                </div>
                <br>
                </br>
                {admins.map((admin) => {
                    return (
                        <AdminUser
                          user={admin}
                          token={token}
                          removeHandler={removeAdmin}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default ManageAdminModal