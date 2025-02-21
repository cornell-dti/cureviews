import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import Reviews from './Pages/Reviews/Reviews';
import ManageAdmins from './Pages/ManageAdmins/ManageAdmins';
import AdminSidebar from './Components/AdminSidebar';
import styles from './Styles/NewAdmin.module.css';
import { useAuthMandatoryLogin } from '../../auth/auth_utils';
import axios from 'axios';
import Loading from '../Globals/Loading';
import Navbar from '../Globals/Navbar';

export const Admin = () => {
  const { isLoggedIn, token, isAuthenticating } = useAuthMandatoryLogin('admin');
  const [currentPage, setCurrentPage] = useState<string>('reviews');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isLoggedIn) return;

    const confirmAdmin = async () => {
      try {
        const response = await axios.post(`/api/admin/token/validate`, { token });
        setIsAdmin(response.data.result);
      } catch (error) {
        console.error("Admin validation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    confirmAdmin();
  }, [isLoggedIn, token, isAuthenticating]);

  if (loading) return <Loading />;

  /** 
   * If user is not an admin, redirect back to homepage. 
   * */
  if (!isLoggedIn || !token || !isAdmin) {
    return <Redirect to="/" />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'reviews':
        return <Reviews token={token} />;
      case 'admins':
        return <ManageAdmins token={token} />;
      default:
        return <Reviews token={token} />;
    }
  };

  return (
    <div className={styles.adminLayout}>
      <Navbar userInput={''} showSearchBar={false} />
      <div className={styles.contentWrapper}>
        <AdminSidebar setCurrentPage={setCurrentPage} />
        <div className={styles.mainContent}>{renderPage()}</div>
      </div>
    </div>
  );
};
