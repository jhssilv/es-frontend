import { useState, useMemo, useEffect } from 'react';
import axios from 'axios'; // 1. Importar o axios
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
// ... (todos os outros imports do Material UI permanecem os mesmos)
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Icons
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Tipo User (sem alterações)
export type User = {
  id: number;
  name: string;
  email: string;
  uniCard: string;
  course: string;
  contact: string;
  rating: number;
  status: 'WAITING_APPROVAL' | 'ACTIVE';
  createdAt: string;
};

// Componente StatusBadge (sem alterações)
const StatusBadge = ({ status }: { status: User['status'] }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-block',
      px: 1.5,
      py: 0.5,
      borderRadius: '12px',
      color: 'white',
      backgroundColor: status === 'ACTIVE' ? 'success.main' : 'warning.main',
      fontSize: '0.75rem',
      fontWeight: 'bold',
    }}
  >
    {status === 'ACTIVE' ? 'Aprovado' : 'Pendente'}
  </Box>
);


export default function UserModerationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States para os diálogos (sem alterações)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<User['status'] | ''>('');
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [userInfoDialogUser, setUserInfoDialogUser] = useState<User | null>(null);

  // 2. useEffect refatorado para usar axios.get
  useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    console.log("Iniciando busca de usuários..."); // Log 1: Início da chamada

    try {
      const response = await axios.get('/moderators/users');
      
      console.log("Resposta da API recebida:", response); // Log 2: Resposta completa
      console.log("Dados da API (response.data):", response.data); // Log 3: Dados específicos

      console.log(response);
      const items = response.data.data;

      if (!items) {
        console.warn("A resposta da API não contém a propriedade 'items'. Verifique a estrutura do JSON.");
        setError("O formato da resposta da API é inválido.");
        setUsers([]);
      } else if (items.length === 0) {
        console.log("A API retornou uma lista vazia de usuários.")
        setUsers([]);
      } else {
        console.log(`Foram encontrados ${items.length} usuários.`);
        setUsers(items);
      }

    } catch (err) {
      console.error("Ocorreu um erro ao buscar usuários:", err); // Log 5: Erro detalhado
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // O servidor respondeu com um status de erro (4xx, 5xx)
          setError(`Erro ${err.response.status}: ${err.response.data.message || 'Não foi possível carregar os dados.'}`);
        } else if (err.request) {
          // A requisição foi feita mas não houve resposta (ex: proxy errado, backend desligado)
          setError("Não foi possível conectar à API. Verifique se o backend está rodando e o proxy está configurado.");
        } else {
          // Erro na configuração da requisição
          setError("Erro ao configurar a requisição para a API.");
        }
      } else {
        setError("Ocorreu um erro inesperado.");
      }
      
    } finally {
      console.log("Finalizando estado de loading."); // Log 6: Fim do processo
      setLoading(false);
    }
  };

  fetchUsers();
}, []);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      ({ name, email, course }) =>
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        course.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const handleClear = () => setSearchTerm('');

  const openEditDialog = (user: User) => {
    setUserToEdit(user);
    setNewStatus(user.status);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setUserToEdit(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!userToEdit || !newStatus) return;

    try {
      const url = `/users/${userToEdit.id}`;
      
      // O segundo argumento do axios.patch é o corpo (body) da requisição
      await axios.patch(url, { status: newStatus });

      // Atualiza o estado local para refletir a mudança imediatamente
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userToEdit.id ? { ...u, status: newStatus } : u))
      );
      closeEditDialog();

    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert('Não foi possível atualizar o status. Tente novamente.');
    }
  };

  // Funções para o diálogo de informações do usuário (sem alterações)
  const openUserInfoDialog = (user: User) => {
    setUserInfoDialogUser(user);
    setUserInfoDialogOpen(true);
  };
  const closeUserInfoDialog = () => setUserInfoDialogOpen(false);
  const handleExitedUserInfoDialog = () => setUserInfoDialogUser(null);


  // --- Renderização do Componente (JSX sem alterações) ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando usuários...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Pesquisar por Nome, Email ou Curso"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
          Limpar
        </Button>
      </Stack>

      {filteredUsers.length === 0 ? (
        <Typography align="center" variant="h6" sx={{ mt: 4 }}>
          Nenhum usuário encontrado.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Curso</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{user.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{user.course}</TableCell>
                  <TableCell align="center">
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Alterar Status">
                        <IconButton onClick={() => openEditDialog(user)} size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Detalhes">
                        <IconButton onClick={() => openUserInfoDialog(user)} size="small" color="info">
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Status Dialog (JSX sem alterações) */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="xs">
        <DialogTitle>Alterar Status de Usuário</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Alterando status para <strong>{userToEdit?.name}</strong>.
          </Typography>
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Novo Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Novo Status"
              onChange={e => setNewStatus(e.target.value as User['status'])}
            >
              <MenuItem value="ACTIVE">Aprovado</MenuItem>
              <MenuItem value="WAITING_APPROVAL">Pendente</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>Salvar Alterações</Button>
        </DialogActions>
      </Dialog>

      {/* User Info Dialog (JSX sem alterações) */}
      <Dialog
        open={userInfoDialogOpen}
        onClose={closeUserInfoDialog}
        TransitionProps={{ onExited: handleExitedUserInfoDialog }}
      >
        <DialogTitle>Detalhes do Usuário</DialogTitle>
        <DialogContent dividers>
          {userInfoDialogUser ? (
            <Stack spacing={1.5}>
              <Typography><strong>Nome:</strong> {userInfoDialogUser.name}</Typography>
              <Typography><strong>Email:</strong> {userInfoDialogUser.email}</Typography>
              <Typography><strong>Curso:</strong> {userInfoDialogUser.course}</Typography>
              <Typography><strong>Matrícula (uniCard):</strong> {userInfoDialogUser.uniCard}</Typography>
              <Typography><strong>Contato:</strong> {userInfoDialogUser.contact}</Typography>
              <Typography><strong>Avaliação:</strong> {userInfoDialogUser.rating.toFixed(1)} / 5.0</Typography>
              <Typography>
                <strong>Status:</strong> <StatusBadge status={userInfoDialogUser.status} />
              </Typography>
               <Typography variant="caption" color="text.secondary">
                Criado em: {new Date(userInfoDialogUser.createdAt).toLocaleDateString('pt-BR')}
              </Typography>
            </Stack>
          ) : (
            <Typography>Carregando...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUserInfoDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}