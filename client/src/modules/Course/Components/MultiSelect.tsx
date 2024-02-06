import React, { useState } from 'react'

// CSS FILES
import styles from '../Styles/Select.module.css'
import closeIcon from '../../../assets/icons/X.svg'
import dropdownIcon from '../../../assets/icons/dropdownicon.svg'

const MultiSelect = ({
  value,
  options,
  placeholder,
  onChange,
}: SelectProps) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0)
  const [open, setOpen] = useState<boolean>(false)

  // helpers

  const selected = (option: string) => {
    return value.includes(option)
  }

  // logic controls:

  const handleDropdown = () => {
    setOpen(!open)
  }

  const handleSelect = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((selected) => selected !== option))
    } else {
      onChange([...value, option])
    }

    setOpen(false)
  }

  const handleDelete = (option: string) => {
    onChange(value.filter((opt: string) => opt !== option))
  }

  return (
    <div
      className={styles.select}
      tabIndex={0}
      onBlur={() => setOpen(false)}
      onClick={handleDropdown}
    >
      <div className={styles.values}>
        {value.length > 0 ? (
          value.map((selected) => (
            <div className={styles.value}>
              {' '}
              {selected}{' '}
              <img
                onClick={() => handleDelete(selected)}
                src={closeIcon}
                alt="close"
              />
            </div>
          ))
        ) : (
          <div className={styles.placeholder}> {placeholder} </div>
        )}
        <img
          className={styles.dropdownicon}
          src={dropdownIcon}
          alt="drop-down-icon"
        />
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
  value: string[]
  onChange: (selectedOptions: string[]) => void
}

export default MultiSelect
