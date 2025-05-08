import React, { useState, type ChangeEvent } from 'react';
import { Container, Box, TextField, Button, Tabs, Tab } from '@mui/material';

interface FormState {
  name?: string;
  email: string;
  password: string;
}

const LoginRegisterPage: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    // Reset form on tab switch
    setForm({ name: '', email: '', password: '' });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 0) {
      // TODO: Implement login logic
      console.log('Logging in with', { email: form.email, password: form.password });
    } else {
      // TODO: Implement registration logic
      console.log('Registering with', form);
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
      </Box>
    </Container>
  );
};

export default LoginRegisterPage;
