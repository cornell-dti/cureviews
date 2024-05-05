import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../Styles/AdminUser.module.css'

type Props = {
    user: any
    token: string
    removeHandler: (arg1: any) => any
}

const AdminUser = ({user, token, removeHandler}: Props) => {

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
    )
}

export default AdminUser