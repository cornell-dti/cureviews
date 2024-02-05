import React, { useState } from 'react'

// CSS FILES
import styles from '../Styles/Select.module.css'
import closeIcon from '../../../assets/icons/X.svg'

const Select = ({ options, placeholder }: SelectProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0)
  const [open, setOpen] = useState<boolean>(false)

  // helpers

  const selected = (option: string) => {
    return selectedOptions.includes(option)
  }

  // logic controls:

  const handleDropdown = () => {
    setOpen(!open)
  }
  const handleSelect = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option))
    } else {
      setSelectedOptions([...selectedOptions, option])
    }
    setOpen(false)
  }

  const handleDelete = (option: string) => {
    setSelectedOptions((options) => options.filter((opt) => opt !== option))
  }

  return (
    <div
      className={styles.select}
      tabIndex={0}
      onBlur={() => setOpen(false)}
      onClick={handleDropdown}
    >
      <div className={styles.values}>
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <div className={styles.value}>
              {' '}
              {option}{' '}
              <img
                onClick={() => handleDelete(option)}
                src={closeIcon}
                alt="close"
              />
            </div>
          ))
        ) : (
          <div className={styles.placeholder}> {placeholder} </div>
        )}
      </div>
      {open && (
        <ul className={styles.options}>
          {options.map((option, index) => (
            <li
              className={`${styles.option} ${
                selected(option) && styles.selected
              } ${index === highlightedIndex && styles.highlighted}`}
              key={option}
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(option)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {' '}
              {option}{' '}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type SelectProps = {
  options: string[]
  placeholder: string
}
export default Select
