import React from 'react';
import styles from '../Styles/AdminSidebar.module.css';

type SidebarProps = {
  setCurrentPage: (page: string) => void;
};

const AdminSidebar = ({ setCurrentPage }: SidebarProps) => {
  return (
    <nav className={styles.sidebar}>
      <ul>
        <li onClick={() => setCurrentPage("reviews")}>Reviews</li>
        <li onClick={() => setCurrentPage("analytics")}>Analytics</li>
        <li onClick={() => setCurrentPage("admins")}>Admin</li>
        <li onClick={() => setCurrentPage("developer")}>Developer</li>
      </ul>
    </nav>
  );
};

export default AdminSidebar;
