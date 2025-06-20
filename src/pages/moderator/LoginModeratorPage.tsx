import React, { useState, type ChangeEvent } from 'react';
import Container  from '@mui/material/Container';
import Box        from '@mui/material/Box';
import TextField  from '@mui/material/TextField';
import Button     from '@mui/material/Button';
import Alert      from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useAuth } from '../../components/functions/useAuth';
import { useNavigate } from 'react-router-dom';

interface FormState {
  email: string;
  password: string;
}

const LoginModeratorPage: React.FC = () => {
  const { login } = useAuth();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    try {
        // Login handling
        const res = await axios.post('/auth/login', {
          email: form.email,
          password: form.password,
          isMod: true
        });

        console.log(res);

        if (res.status === 200) {
          await login({
            id: res.data.id, 
            name: res.data.name, 
            email: res.data.email,
            role: res.data.role, 
          }, res.data.token);

          console.log(res.data.role);
          navigate ("/moderator");
        }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Email ou senha inválidos.');
        } else {
          setError('Um erro ocorreu. Tente novamente.');
        }
      } else {
        setError('Um erro inesperado ocorreu!');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Typography variant = "h3">
          Moderator Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} mt={3}>
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
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
            label="Senha"
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
          Login
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Acesso externo
          <Button 
            size="small" 
            onClick={() => navigate("/login")}
            sx={{ ml: 1 }}
          >
          Clique aqui
          </Button>
        </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginModeratorPage;