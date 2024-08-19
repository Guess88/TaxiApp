import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Paper, Box, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_LOGIN, { email, PasswordHash: password });
      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);

      navigate('/dashboard');


    } catch (error) {
      if (error.response) {
        console.error('Login failed DATA:', error.response.data);
      } else {
        console.error('Login failed:', error.message);
      }
    }
    
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4">Sign in</Typography>
        <Box component="form" noValidate sx={{ width: '100%', marginTop: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 3 }}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            type="button"
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ marginTop: 2 }}
            startIcon={<FacebookIcon />}
          >
            Login with Facebook
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
          Don't have an account?{' '}
          <Link href="/register" variant="body2">
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
