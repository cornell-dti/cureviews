import React, { useState } from 'react';

// CSS FILES
import styles from '../Styles/Select.module.css';
import closeIcon from '../../../assets/icons/X.svg';
import dropdownIcon from '../../../assets/icons/dropdownicon.svg';

const MultiSelect = ({
  value,
  options,
  placeholder,
  onChange,
  appearFromTop = false
}: SelectProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const filteredOptions =
    searchTerm.length !== 0
      ? options.filter((option) =>
          option.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  const handleDropdown = () => {
    setOpen(!open);
  };

  const handleSelect = (option: string) => {
    if (!value.includes(option)) {
      onChange([...value, option]);
    }
    setSearchTerm('');
    setOpen(false);
  };

  const handleDelete = (option: string) => {
    onChange(value.filter((opt: string) => opt !== option));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!open) setOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div
      className={styles.select}
      tabIndex={0}
      onBlur={handleBlur}
      onClick={handleDropdown}
    >
      <div className={styles.values}>
        {value.map((selection) => (
          <div className={styles.value} key={selection}>
            {selection}
            <img
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(selection);
              }}
              src={closeIcon}
              alt="close"
            />
          </div>
        ))}
        <input
          type="text"
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={value.length === 0 ? placeholder : ''}
        />
        <img
          className={styles.dropdownicon}
          src={dropdownIcon}
          alt="dropdown"
        />
      </div>
      {open && (
        <ul className={appearFromTop ? styles.gradeoptions : styles.options}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                className={styles.option}
                key={option}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
              >
                {option}
              </li>
            ))
          ) : (
            <li className={styles.noOptions}>No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

type SelectProps = {
  options: string[];
  placeholder: string;
  value: string[];
  onChange: (selectedOptions: string[]) => void;
  appearFromTop?: boolean;
};

export default MultiSelect;
