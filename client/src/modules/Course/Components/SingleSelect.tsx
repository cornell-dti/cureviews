import React, { useState } from 'react';

// CSS FILES
import styles from '../Styles/Select.module.css';
import dropdownIcon from '../../../assets/icons/dropdownicon.svg';

const SingleSelect = ({
  value,
  options,
  placeholder,
  onChange,
  appearFromTop = true
}: SelectProps) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  // helpers

  const selected = (option: string) => {
    return value.includes(option);
  };

  // logic controls:

  const handleDropdown = () => {
    setOpen(!open);
  };

  const handleSelect = (selection: string) => {
    onChange(selection);

    setOpen(false);
  };

  return (
    <div
      className={styles.select}
      tabIndex={0}
      onBlur={() => setOpen(false)}
      onClick={handleDropdown}
    >
      <div className={styles.values}>
        {value !== '' ? (
          <div className={styles['single-value']}>{value}</div>
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
        <ul className={appearFromTop ? styles.gradeoptions : styles.options}>
          {options.map((option, index) => (
            <li
              className={`${styles.option} ${
                selected(option) && styles.selected
              } ${index === highlightedIndex && styles.highlighted}`}
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
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
  );
};

type SelectProps = {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (selectedOptions: string) => void;
  appearFromTop?: boolean;
};

export default SingleSelect;
