import { useState, useEffect, type FormEvent } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// Em um projeto real, você provavelmente teria uma interface para o usuário.
// Ex: import type { User } from '../../types/User';

// --- DADOS MOCKADOS ---
// Em uma aplicação real, estes dados viriam de uma API ou de um Contexto de Autenticação.
const mockUserData = {
  name: 'Usuário Exemplo',
  email: 'usuario@exemplo.com',
};
// --------------------

export default function ContaPage() {
  // Estado para os campos de informações do perfil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Estado para os campos de alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Simula o carregamento dos dados do usuário quando o componente é montado.
  useEffect(() => {
    // Em um cenário real, você faria uma chamada a uma API aqui.
    setName(mockUserData.name);
    setEmail(mockUserData.email);
  }, []);

  /**
   * Lida com o salvamento das informações do perfil (nome e e-mail).
   * @param event - O evento do formulário.
   */
  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault(); // Evita o recarregamento da página
    console.log('Salvando informações do perfil:', { name, email });
    // TODO: Implementar a chamada à API para salvar os dados.
    alert('Perfil atualizado com sucesso!');
  };

  /**
   * Lida com a alteração da senha.
   * @param event - O evento do formulário.
   */
  const handlePasswordSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Erro: A nova senha e a confirmação não correspondem.');
      return;
    }

    if (newPassword.length < 8) {
      alert('Erro: A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    console.log('Alterando senha...');
    // TODO: Implementar a chamada à API para alterar a senha.
    alert('Senha alterada com sucesso!');

    // Limpa os campos de senha após a submissão
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
  <Box>
    <Typography variant="h4" component="h1" gutterBottom>
      Minha Conta
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
      Gerencie suas informações pessoais e de segurança.
    </Typography>

    {/* O componente Grid continua sendo o container */}
    <Grid container spacing={4}>
      {/* CORREÇÃO: Em vez de usar 'xs' e 'md' diretamente, 
        você deve usar a prop 'gridColumn' para definir a largura.
        'span 6' em um grid de 12 colunas é o equivalente a 'md={6}'.
      */}
      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Card>
          <CardHeader title="Informações do Perfil" />
          <Divider />
          <CardContent>
            <Box component="form" onSubmit={handleProfileSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Nome Completo"
                  variant="outlined"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <TextField
                  label="Endereço de E-mail"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained">
                    Salvar Alterações
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Aplicamos a mesma lógica para o segundo item do Grid */}
      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Card>
          <CardHeader title="Alterar Senha" />
          <Divider />
          <CardContent>
            <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
              <Stack spacing={3}>
                {/* ... Seus TextFields de senha ... */}
                <TextField label="Senha Atual" type="password" fullWidth required />
                <TextField label="Nova Senha" type="password" fullWidth required />
                <TextField label="Confirmar Nova Senha" type="password" fullWidth required />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained">
                    Alterar Senha
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);
}