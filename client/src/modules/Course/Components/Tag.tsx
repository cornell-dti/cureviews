import React from 'react'
import styles from '../Styles/Tag.module.css'

type TagProps = {
  tagName: string
}

/**
 * This component contains the UI for tags.
 * @props
 * tagName: text that will be displayed on the tag
 */
const Tag = ({ tagName }: TagProps) => {
  return (
    <div className={styles.container}>
      <p>{tagName}</p>
    </div>
  )
}

export default Tag
