import React, { useState, type ChangeEvent } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Tabs, 
  Tab, 
  Alert,
  Typography 
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../components/functions/useAuth';
import { useNavigate } from 'react-router-dom';

interface FormState {
  name: string;
  email: string;
  password: string;
}

const LoginRegisterPage: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setForm({ name: '', email: '', password: '' });
    setError('');
    setSuccessMessage('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    try {
      if (tab === 0) {
        // Login handling
        const res = await axios.post('/auth/login', {
          email: form.email,
          password: form.password,
        });

        if (res.status === 200) {
          await login({
            id: res.data.id, 
            name: form.name, 
            email: form.email,
            role: res.data.role, 
          }, res.data.token);
          navigate('/main');
        }
      } else {
        // Registration handling
        const res = await axios.post('/auth/signup', {
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.password,
          role: "STUDENT"
        });

        if (res.status === 201) {
          setSuccessMessage('Registration successful!');
          setForm({ name: '', email: '', password: '' });
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Invalid email or password');
        } else if (err.response?.status === 409) {
          setError('Email is already registered');
        } else {
          setError('An error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} mt={3}>
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert 
              severity="success" 
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => handleTabChange(null as any, 0)}
                >
                  Go to Login
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {successMessage}
            </Alert>
          )}

          {tab === 1 && (
            <TextField
              name="name"
              label="Name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          )}

          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            {tab === 0 ? 'Login' : 'Register'}
          </Button>
        </Box>

        {/* Additional links or info */}
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          {tab === 0 ? "Don't have an account?" : "Already have an account?"}
          <Button 
            size="small" 
            onClick={() => handleTabChange(null as any, tab === 0 ? 1 : 0)}
            sx={{ ml: 1 }}
          >
            {tab === 0 ? 'Register here' : 'Login here'}
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginRegisterPage;