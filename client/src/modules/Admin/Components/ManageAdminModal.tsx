import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../Styles/ManageAdminModal.module.css'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    token: string
  }

const ManageAdminModal = ({token, open, setOpen}: Props) => {
    
    function closeModal() {
        setOpen(false)
    }

    if (!open) {
        return <></>
    }

    return (
        <div className={styles.modalbg}>
            <div className={styles.modal}>
                Test
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