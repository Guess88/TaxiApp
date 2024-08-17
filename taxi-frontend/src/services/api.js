import axios from 'axios';

const API_URL = 'http://localhost:9062/api/Users';
const PHOTO_URL = 'http://localhost:9062/Photos';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const fetchUserData = async () => {
  try {
    const response = await api.get('/user-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
