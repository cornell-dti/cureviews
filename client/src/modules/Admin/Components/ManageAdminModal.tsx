import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../Styles/ManageAdminModal.module.css'

import { Student } from 'common'
import AdminUser from './AdminUser'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    token: string
  }

const ManageAdminModal = ({token, open, setOpen}: Props) => {
    const [admins, setAdmins] = useState<Student[]>([])

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

    function closeModal() {
        setOpen(false)
    }

    if (!open) {
        return <></>
    }

    return (
        <div className={styles.modalbg}>
            <div className={styles.modal}>
                <h2>Administrators</h2>

                {admins.map((admin) => {
                    return (
                        <AdminUser
                          user={admin}
                          token={token}
                          removeHandler={removeAdmin}
                        />
                    )
                })}
                <button 
                  onClick={closeModal}
                >
                  Close
                </button>
            </div>
        </div>
    )
}

export default ManageAdminModal