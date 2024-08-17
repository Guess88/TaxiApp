import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode}  from 'jwt-decode';

const Dashboard = () => {
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode (token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
        navigate('/login'); // Preusmeri na login ako token nije validan
      }
    } else {
      navigate('/login'); // Preusmeri na login ako token ne postoji
    }
  }, [navigate]);

  return (
    <div>
      {userRole === 'Administrator' && <h1>Admin Dashboard</h1>}
      {userRole === 'Driver' && <h1>Driver Dashboard</h1>}
      {userRole === 'User' && <h1>User Dashboard</h1>}
    </div>
  );
};

export default Dashboard;
