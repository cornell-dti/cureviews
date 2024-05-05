import React, { useEffect, useState } from 'react'
import axios from 'axios'

type Props = {
    user: any
    token: string
    removeHandler: (arg1: any) => any
}

const AdminUser = ({user, token, removeHandler}: Props) => {


    return (
        <div>
            {user.firstName} {user.lastName}, {user.netId}
            <button
                onClick={() => removeHandler(user)}
            >
                Remove
            </button>
        </div>
    )
}

export default AdminUser