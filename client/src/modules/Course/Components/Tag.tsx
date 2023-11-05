import React from 'react'
import styles from '../Styles/Tag.module.css'

type TagProps = {
  tagName: string
}
const Tag = ({ tagName }: TagProps) => {
  return (
    <div className={styles.container}>
      <p>{tagName}</p>
    </div>
  )
}

export default Tag
