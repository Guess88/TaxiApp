import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Input, Grid, IconButton, Link} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    const formData = new FormData();
    formData.append('Username', username);
    formData.append('Email', email);
    formData.append('PasswordHash', password);
    formData.append('FirstName', firstName);
    formData.append('LastName', lastName);
    formData.append('DateOfBirth', dateOfBirth);
    formData.append('Address', address);
    if (profilePicture) {
      formData.append('ProfilePicture', profilePicture);
    }

    try {
      await axios.post('http://localhost:9062/api/Users/Register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/login'); // Preusmeri na login nakon registracije
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        maxWidth: 600, // Povećano da bi se omogućio prostor za dva `TextField`-a u redu
        margin: 'auto',
        backgroundColor: '#f7f7f7',
        borderRadius: 2,
        boxShadow: 3,
        marginTop: 7
      }}>
      <Typography variant="h4" gutterBottom>Registration</Typography>
      <Box component="form" noValidate sx={{ width: '100%' }}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
          </Grid>
        </Grid>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <IconButton component="label">
            <UploadIcon />
          <Input
            
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />
        </IconButton>
        <Button
          type="button"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleRegister}
        >
          Register
        </Button>
        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            Already have an account?{' '}
            <Link href="/" variant="body">
                Sign in
            </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Registration;
