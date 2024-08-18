import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode}  from 'jwt-decode';
import DashboardAdmin from './dashboardAdmin';
import DashboardUser from './dashboardUser';
import DashboardDriver from './dashboardDriver';


const Dashboard = () => {
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode (token);
        setUserRole(decodedToken.role);
        setUserEmail(decodedToken.unique_name);
      } catch (error) {
        console.error('Failed to decode token:', error);
        navigate('/login'); // Preusmeri na login ako token nije validan
      }
    } else {
      navigate('/login'); // Preusmeri na login ako token ne postoji
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:9062/api/Users/get-user-by-email?email=${userEmail}`,{
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }});
        
  
        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText);
          return;
        }
        
        const contentType = response.headers.get('content-type');
  
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setUserData(data);
          
        } else {
          // Ispis sadržaja ako nije JSON
          const text = await response.text();
          console.error('Expected JSON, but received:', text);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
  
    if (userEmail) { // Proveri da li je userEmail postavljen
      fetchUserData();
    }
  }, [userEmail]);


  return (
    <div>
      {userRole === 'Administrator' && <DashboardAdmin user={userData}/>}
      {userRole === 'Driver' && <DashboardDriver user={userData}/>}
      {userRole === 'User' && <DashboardUser user={userData}/>}
    </div>
  );
};

export default Dashboard;
