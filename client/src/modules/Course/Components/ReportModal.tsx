import React, { useEffect, useState } from 'react'
import {Review} from 'common'

import closeIcon from '../../../assets/icons/X.svg'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    reportHandler: (reviewId: string) => void
  }

const ReportModal = ({open, setOpen, reportHandler}: Props) => {

    function closeModal() {
        setOpen(false)
    }

    if (!open) {
        return <></>
    }

    return (
        <div>
            Test test test
        </div>
    )
}

export default ReportModal