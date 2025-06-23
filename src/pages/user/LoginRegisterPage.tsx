import React, { useState, type ChangeEvent } from 'react';
import Container  from '@mui/material/Container';
import Box        from '@mui/material/Box';
import TextField  from '@mui/material/TextField';
import Button     from '@mui/material/Button';
import Tabs       from '@mui/material/Tabs';
import Tab        from '@mui/material/Tab';
import Alert      from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useAuth } from '../../components/functions/useAuth';
import { useNavigate } from 'react-router-dom';

// 1. Adicionar todos os campos do formulário de registro
interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  uniCard: string;
  course: string;
  contact: string;
}

const LoginRegisterPage: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  
  // 2. Inicializar o estado com todos os campos
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    uniCard: '',
    course: '',
    contact: '',
  });

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    // Limpar o formulário e mensagens ao trocar de aba
    setForm({
      name: '', email: '', password: '', confirmPassword: '',
      uniCard: '', course: '', contact: '',
    });
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
    setSuccessMessage('');
    
    try {
      if (tab === 0) {
        // --- Lógica de Login ---
        const res = await axios.post('/auth/login', {
          email: form.email,
          password: form.password,
          isMod: false
        });

        if (res.status === 200) {
          // O retorno da API (id, name, email, token) corresponde ao esperado
          await login({
            id: res.data.id, 
            name: res.data.name, 
            email: res.data.email,
            // Assumindo que sua API também retorna 'role' para o redirecionamento
            role: res.data.role, 
          }, res.data.token);

          navigate('/main');
        }
      } else {
        // --- Lógica de Registro ---
        
        // 3. Adicionar validação de senha
        if (form.password !== form.confirmPassword) {
          setError('As senhas não coincidem.');
          return;
        }

        // 4. Enviar todos os campos necessários para a rota /auth/signup
        const res = await axios.post('/auth/signup', {
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          uniCard: form.uniCard,
          course: form.course,
          contact: form.contact,
        });

        // A API retorna um corpo vazio e status 201 em caso de sucesso
        if (res.status === 201) {
          setSuccessMessage('Registro realizado com sucesso! Você já pode fazer o login.');
          setForm({
            name: '', email: '', password: '', confirmPassword: '',
            uniCard: '', course: '', contact: '',
          });
          setTab(0);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Email ou senha inválidos.');
        } else if (err.response?.status === 409) {
          setError('Este email já está registrado.');
        } else {
          setError('Ocorreu um erro. Por favor, tente novamente.');
        }
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Typography variant = "h4">
          Bem-vindo(a) ao Vira a Página!
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Registrar" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} mt={3}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {successMessage && !error && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Campos do Formulário */}
          {tab === 1 && (
            <>
              <TextField name="name" label="Nome Completo" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
              <TextField name="uniCard" label="Matrícula" value={form.uniCard} onChange={handleChange} fullWidth margin="normal" required />
              <TextField name="course" label="Curso" value={form.course} onChange={handleChange} fullWidth margin="normal" required />
              <TextField name="contact" label="Contato (Telefone)" value={form.contact} onChange={handleChange} fullWidth margin="normal" required />
            </>
          )}

          <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
          <TextField name="password" label="Senha" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required />

          {tab === 1 && (
             <TextField name="confirmPassword" label="Confirmar Senha" type="password" value={form.confirmPassword} onChange={handleChange} fullWidth margin="normal" required />
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            {tab === 0 ? 'Login' : 'Registrar'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          {tab === 0 ? "Não tem uma conta?" : "Já possui uma conta?"}
          <Button 
            size="small" 
            onClick={() => handleTabChange(null as unknown as React.SyntheticEvent, tab === 0 ? 1 : 0)}
            sx={{ ml: 1 }}
          >
            {tab === 0 ? 'Registre-se aqui' : 'Fazer login aqui'}
          </Button>
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Acesso interno
          <Button 
            size="small" 
            onClick={() => navigate("/loginmod")}
            sx={{ ml: 1 }}
          >
          Clique aqui
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginRegisterPage;