import React, { useState, useEffect, useRef } from 'react';
import styles from '../Styles/Dropdown.module.css';
import dropdownIcon from '../../../assets/icons/dropdown2.svg';

const options = [
  { label: 'Last 25 Reviews', value: 25 },
  { label: 'Last 50 Reviews', value: 50 },
  { label: 'Last 100 Reviews', value: 100 },
  { label: 'Last 200 Reviews', value: 200 }
];

type CustomDropdownProps = {
  selectedValue: number;
  onChange: (value: number) => void;
};

/**
 * Dropdown Component
 *
 * Component to filter x number of most recently approved reviews so that those
 * x reviews will be displayed on the screen. Options for 5, 10, 20, and 30.
 */

const Dropdown: React.FC<CustomDropdownProps> = ({
  selectedValue,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.dropdownContent}>
          <div className={styles.dropdownText}>
            {options.find((o) => o.value === selectedValue)?.label ||
              'Select Review Limit'}
          </div>
          <img
            src={dropdownIcon}
            alt="Dropdown Arrow"
            className={styles.icon}
          />
        </div>
      </button>

      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.dropdownItem} ${selectedValue === option.value ? styles.selected : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
