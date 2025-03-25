import React from 'react';
import styles from '../Styles/AdminSidebar.module.css';

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
};

/**
 * Sidebar Component
 *
 * Component to navigate the admin page. There are four pages reviews,
 * analytics, manage admins, and developer tools. Hovering over a page
 * option changes the text to blue and the current selected page is highlighted
 * blue.
 */

const AdminSidebar = ({ currentPage, setCurrentPage }: SidebarProps) => {
  const menuItems = [
    { key: 'reviews', label: 'Reviews' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'admins', label: 'Admin Users' },
    { key: 'developer', label: 'Dev Tools' }
  ];

  return (
    <nav className={styles.sidebar}>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.key}
            onClick={() => setCurrentPage(item.key)}
            className={
              currentPage === item.key ? styles.active : styles.inactive
            }
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminSidebar;
