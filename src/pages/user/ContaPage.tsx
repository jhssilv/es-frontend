import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes do Material-UI
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
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import StarIcon from '@mui/icons-material/Star';

// Importar o hook de autenticação para obter dados do usuário
import { useAuth } from '../../components/functions/useAuth'; 

type UserStatus = 'ACTIVE' | 'WAITING_APPROVAL'; 
interface User {
  id: string;
  name: string;
  email: string;
  uniCard: string;
  course: string;
  contact: string;
  rating: number;
  status: UserStatus | string;
}

export default function ContaPage() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // O estado do formulário agora reflete a nova interface
  const [formData, setFormData] = useState<User>({
    id: '',
    name: '',
    email: '',
    uniCard: '',
    course: '',
    contact: '',
    rating: 0,
    status: '',
  });
  
  // Estado para o diálogo de confirmação de exclusão
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Popular o formulário com dados do usuário logado
  useEffect(() => {
    // Define uma função async dentro do useEffect para poder usar await
    const fetchUserData = async () => {
      // Garante que temos um usuário e token antes de fazer a chamada
      if (user && user.id && token) {
        setIsLoading(true);
        setErrorMessage('');
        try {
          const response = await axios.get(
            `/users/${user.id}`,
            {
              headers: {
                // Autentica a requisição com o token do usuário
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          // Popula o formulário com os dados mais recentes vindos da API
          setFormData(response.data);

        } catch (error) {
          console.error("Falha ao buscar dados do usuário:", error);
          setErrorMessage("Não foi possível carregar seus dados. Tente recarregar a página.");
        } finally {
          // Garante que o loading seja desativado ao final, com sucesso ou erro
          setIsLoading(false);
        }
      } else {
        // Se não houver usuário, para o loading
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, token]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Lida com a atualização das informações do perfil.
   */
  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!formData.email.trim().toLowerCase().endsWith('@ufrgs.br')) {
      setErrorMessage('O e-mail fornecido não é válido. Use seu e-mail institucional @ufrgs.br.');
      return;
    }

    if (!formData.id) {
        setErrorMessage("ID do usuário não encontrado. Faça login novamente.");
        return;
    }

    try {
      const response = await axios.patch(
        `/users/${formData.id}`,
        { // Envia apenas os campos que podem ser atualizados
          name: formData.name,
          email: formData.email,
          uniCard: formData.uniCard,
          course: formData.course,
          contact: formData.contact,
        }
      );

      if (response.status === 200) {
        setSuccessMessage('Perfil atualizado com sucesso!');
        updateUser(response.data); 
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setErrorMessage("Não foi possível atualizar o perfil. Tente novamente.");
    }
  };


  const handleDeleteAccount = async () => {
    setOpenDeleteDialog(false);
    setErrorMessage('');

    if (!formData.id) {
        setErrorMessage("ID do usuário não encontrado. Faça login novamente.");
        return;
    }

    try {
        const response = await axios.delete(
            `/users/${formData.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
            alert('Conta excluída com sucesso. Você será desconectado.');
            logout(); // Limpa a sessão do usuário
            navigate('/auth/login'); // Redireciona para a página de login
        }
    } catch (error) {
        console.error("Erro ao excluir conta:", error);
        setErrorMessage("Não foi possível excluir a conta. Tente novamente.");
    }
  };

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Carregando seus dados...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        <div>
          <Typography variant="h4">Minha Conta</Typography>
        </div>

        <Box sx={{ mb: 2 }}>
        {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success">
              {successMessage}
            </Alert>
          )}
        </Box>

        <Card>
        <CardHeader title="Informações do Perfil" />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleProfileSubmit}>
            <Grid container spacing={3} alignItems="center">
              {/* Campos Editáveis */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Nome Completo" name="name" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Matrícula" name="uniCard" value={formData.uniCard} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Curso" name="course" value={formData.course} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Contato" name="contact" value={formData.contact} onChange={handleChange} fullWidth />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, p: 1, borderRadius: 1 }}>
                  <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="subtitle1" component="span" sx={{ mr: 0.5 }}>
                    Sua Avaliação:
                  </Typography>
                  <Typography variant="h6" component="span" fontWeight="bold">
                    {formData.rating.toFixed(1)}
                  </Typography>
                </Box>
              </Grid>

            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button type="submit" variant="contained">
                Salvar Alterações
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

        <Card sx={{ borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardHeader title="Zona de Perigo" titleTypographyProps={{ color: 'error.main' }} />
          <Divider />
          <CardContent>
            <Stack spacing={2} alignItems="flex-start">
                <Typography variant="body1">
                    Uma vez que você apaga sua conta, não há como voltar atrás. Tenha certeza.
                </Typography>
                <Button color="error" variant="contained" onClick={() => setOpenDeleteDialog(true)}>
                    Deletar Minha Conta
                </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão de Conta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja excluir permanentemente sua conta? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteAccount} color="error">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}