import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
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
import DialogContentText from '@mui/material/DialogContentText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Define the User type
export type User = {
  id: string; // Using string for UUID-like IDs
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive';
  rating: number; // Added user rating (1 to 5, float)
};

// Mock initial user data
const initialUsers: User[] = [
  { id: 'user-001', name: 'João Silva', email: 'joao.silva@example.com', role: 'admin', status: 'active', rating: 4.8 },
  { id: 'user-002', name: 'Maria Souza', email: 'maria.souza@example.com', role: 'moderator', status: 'active', rating: 4.5 },
  { id: 'user-003', name: 'Pedro Santos', email: 'pedro.santos@example.com', role: 'member', status: 'active', rating: 3.9 },
  { id: 'user-004', name: 'Ana Oliveira', email: 'ana.oliveira@example.com', role: 'member', status: 'inactive', rating: 2.5 },
  { id: 'user-005', name: 'Carlos Ferreira', email: 'carlos.f@example.com', role: 'member', status: 'active', rating: 4.2 },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // Added rating to initial newUser state
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'member', status: 'active', rating: 3.0 });

  // State for delete confirmation dialog
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // State for user info dialog
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [userInfoDialogUser, setUserInfoDialogUser] = useState<User | null>(null);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter(
      ({ name, email }) =>
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  // Handle search (logic is handled by useMemo, this just triggers re-render if needed)
  const handleSearch = () => {
    // No explicit action needed here, as searchTerm change updates filteredUsers via useMemo
  };

  // Clear search term
  const handleClear = () => {
    setSearchTerm('');
  };

  // Open Add User Dialog
  const openAddDialog = () => {
    // Reset form including rating
    setNewUser({ name: '', email: '', role: 'member', status: 'active', rating: 3.0 });
    setAddDialogOpen(true);
  };

  // Close Add User Dialog (starts animation)
  const closeAddDialog = () => {
    setAddDialogOpen(false);
  };

  // Resets state after Add User dialog closes animation
  const handleExitedAddDialog = () => {
    // Clear form fields including rating
    setNewUser({ name: '', email: '', role: 'member', status: 'active', rating: 3.0 });
  };

  // Add new user
  const handleAddUser = () => {
    const { name, email, role, status, rating } = newUser;
    if (!name || !email) {
      console.warn("Nome e Email são obrigatórios."); 
      return;
    }
    // Basic validation for rating
    if (rating < 1 || rating > 5) {
      console.warn("Avaliação deve ser entre 1 e 5."); 
      return;
    }

    const newId = `user-${Date.now()}`;
    const user: User = { id: newId, name, email, role, status, rating: parseFloat(rating.toFixed(1)) }; // Ensure float with one decimal
    setUsers(prevUsers => [...prevUsers, user]);
    closeAddDialog();
  };

  // Open delete confirmation dialog
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmDialogOpen(true);
  };

  // Close delete confirmation dialog (starts animation)
  const handleCloseDeleteConfirmDialog = () => {
    setDeleteConfirmDialogOpen(false);
  };

  // Resets state after delete confirmation dialog closes animation
  const handleExitedDeleteConfirmDialog = () => {
    setUserToDelete(null);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
      console.log(`Usuário ${userToDelete.id} (${userToDelete.name}) excluído.`); 
    }
    handleCloseDeleteConfirmDialog();
  };

  // Open User Info Dialog
  const handleOpenUserInfoDialog = (user: User) => {
    setUserInfoDialogUser(user);
    setUserInfoDialogOpen(true);
  };

  // Close User Info Dialog (starts animation)
  const handleCloseUserInfoDialog = () => {
    setUserInfoDialogOpen(false);
  };

  // Resets state after User Info dialog closes animation
  const handleExitedUserInfoDialog = () => {
    setUserInfoDialogUser(null);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      {/* Page Title Removed */}

      {/* Search and Add controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        sx={{ mb: { xs: 1, sm: 2 } }}
      >
        <TextField
          label="Pesquisar por Nome ou Email" 
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <Stack direction="row" spacing={1}>
          {/* Search Button */}
          <IconButton onClick={handleSearch} sx={{ display: { xs: 'inline-flex', sm: 'none' } }} aria-label="pesquisar"> 
            <SearchIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Buscar 
          </Button>

          {/* Clear Button */}
          <IconButton onClick={handleClear} sx={{ display: { xs: 'inline-flex', sm: 'none' } }} aria-label="limpar filtros"> 
            <ClearIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Limpar 
          </Button>

          {/* Add User Button */}
          <IconButton onClick={openAddDialog} color="primary" sx={{ display: { xs: 'inline-flex', sm: 'none' } }} aria-label="adicionar novo usuário"> 
            <AddIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Adicionar 
          </Button>
        </Stack>
      </Stack>

      {filteredUsers.length === 0 ? (
        <Typography align="center" variant="h6" sx={{ mt: 4 }}>
          Nenhum usuário encontrado com estes critérios. 
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: { xs: '40vh', sm: '60vh' }, overflowY: 'auto', borderRadius: 2 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell> 
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Função</TableCell> 
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Status</TableCell> 
                <TableCell align="center">Ações</TableCell> 
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{user.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{user.role === 'admin' ? 'Administrador' : user.role === 'moderator' ? 'Moderador' : 'Membro'}</TableCell> 
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{user.status === 'active' ? 'Ativo' : 'Inativo'}</TableCell> 
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {/* Info Icon (always visible) */}
                      <Tooltip title="Ver Detalhes do Usuário">
                        <IconButton onClick={() => handleOpenUserInfoDialog(user)} size="small" color="info" aria-label="ver detalhes do usuário"> 
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      {/* Delete Icon (always visible) */}
                      <Tooltip title="Excluir Usuário">
                        <IconButton onClick={() => confirmDelete(user)} size="small" color="error" aria-label="excluir usuário"> 
                          <DeleteIcon />
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

      {/* Add User Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={closeAddDialog}
        TransitionProps={{ onExited: handleExitedAddDialog }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Adicionar Novo Usuário</DialogTitle> 
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome" 
            fullWidth
            variant="outlined"
            value={newUser.name}
            onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email" 
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Função</InputLabel> 
            <Select
              labelId="role-select-label"
              id="role-select"
              value={newUser.role}
              label="Função" 
              onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
            >
              <MenuItem value="member">Membro</MenuItem> 
              <MenuItem value="moderator">Moderador</MenuItem> 
              <MenuItem value="admin">Administrador</MenuItem> 
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel> 
            <Select
              labelId="status-select-label"
              id="status-select"
              value={newUser.status}
              label="Status" 
              onChange={e => setNewUser(prev => ({ ...prev, status: e.target.value as User['status'] }))}
            >
              <MenuItem value="active">Ativo</MenuItem> 
              <MenuItem value="inactive">Inativo</MenuItem> 
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Avaliação (1.0 - 5.0)" 
            type="number"
            inputProps={{ step: "0.1", min: "1.0", max: "5.0" }}
            fullWidth
            variant="outlined"
            value={newUser.rating}
            onChange={e => setNewUser(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancelar</Button> 
          <Button variant="contained" onClick={handleAddUser}>Adicionar</Button> 
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={handleCloseDeleteConfirmDialog}
        TransitionProps={{ onExited: handleExitedDeleteConfirmDialog }}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">Confirmar Exclusão</DialogTitle> 
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            Tem certeza que deseja excluir o usuário "{userToDelete?.name}"? Esta ação não pode ser desfeita. 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmDialog}>Cancelar</Button> 
          <Button onClick={handleDeleteUser} color="error" variant="contained" autoFocus>
            Excluir 
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Info Dialog */}
      <Dialog
        open={userInfoDialogOpen}
        onClose={handleCloseUserInfoDialog}
        TransitionProps={{ onExited: handleExitedUserInfoDialog }}
        aria-labelledby="user-info-dialog-title"
      >
        <DialogTitle id="user-info-dialog-title">Detalhes do Usuário</DialogTitle> 
        <DialogContent dividers>
          {userInfoDialogUser ? (
            <Stack spacing={1}>
              <Typography variant="body1">
                <strong>Nome:</strong> {userInfoDialogUser.name} 
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {userInfoDialogUser.email} 
              </Typography>
              <Typography variant="body1">
                <strong>Função:</strong> {userInfoDialogUser.role === 'admin' ? 'Administrador' : userInfoDialogUser.role === 'moderator' ? 'Moderador' : 'Membro'} 
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {userInfoDialogUser.status === 'active' ? 'Ativo' : 'Inativo'} 
              </Typography>
              <Typography variant="body1">
                <strong>Avaliação:</strong> {userInfoDialogUser.rating.toFixed(1)} / 5.0 
              </Typography>
            </Stack>
          ) : (
            <Typography>Carregando detalhes do usuário...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserInfoDialog}>Fechar</Button> 
        </DialogActions>
      </Dialog>
    </Box>
  );
}
