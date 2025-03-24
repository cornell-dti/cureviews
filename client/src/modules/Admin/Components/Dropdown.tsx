import React, { useState, useEffect, useRef } from "react";
import styles from "../Styles/Dropdown.module.css";
import dropdownIcon from '../../../assets/icons/dropdown2.svg';

const options = [
  { label: "Last 5 Reviews", value: 5 },
  { label: "Last 10 Reviews", value: 10 },
  { label: "Last 20 Reviews", value: 20 },
  { label: "Last 30 Reviews", value: 30 },
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

const Dropdown: React.FC<CustomDropdownProps> = ({ selectedValue, onChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <button className={styles.dropdownButton} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.dropdownContent}>
          <div className={styles.dropdownText}>
            {options.find((o) => o.value === selectedValue)?.label || "Select Review Limit"}
          </div>
          <img src={dropdownIcon} alt="Dropdown Arrow" className={styles.icon} />
        </div>
      </button>

      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.dropdownItem} ${selectedValue === option.value ? styles.selected : ""}`}
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
