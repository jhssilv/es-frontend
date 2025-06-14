import { useState } from 'react';
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

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Define your Contact type
export type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

const initialContacts: Contact[] = [
  { id: 1, name: 'Alice Silva', email: 'alice@example.com', phone: '(11) 98765-4321' },
  { id: 2, name: 'Bruno Ramos', email: 'bruno@example.com', phone: '(21) 91234-5678' },
  { id: 3, name: 'Carla Souza', email: 'carla@example.com', phone: '(31) 99876-5432' },
];

export default function ContactListPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [results, setResults] = useState<Contact[]>(initialContacts);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });

  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    setResults(
      q
        ? contacts.filter(
            ({ name, email, phone }) =>
              name.toLowerCase().includes(q) ||
              email.toLowerCase().includes(q) ||
              phone.toLowerCase().includes(q)
          )
        : contacts
    );
  };

  const handleClear = () => {
    setQuery('');
    setResults(contacts);
  };

  const openAddDialog = () => {
    setNewContact({ name: '', email: '', phone: '' });
    setDialogOpen(true);
  };

  const closeAddDialog = () => {
    setDialogOpen(false);
  };

  const handleAdd = () => {
    const { name, email, phone } = newContact;
    if (!name || !email || !phone) return;
    const contact: Contact = { id: Date.now(), name, email, phone };
    const updated = [...contacts, contact];
    setContacts(updated);
    setResults(updated);
    closeAddDialog();
  };

  const handleDelete = (id: number) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    const q = query.trim().toLowerCase();
    setResults(
      q
        ? updated.filter(
            ({ name, email, phone }) =>
              name.toLowerCase().includes(q) ||
              email.toLowerCase().includes(q) ||
              phone.toLowerCase().includes(q)
          )
        : updated
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>

      {/* Search and Add */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        sx={{ mb: { xs: 1, sm: 2 } }}
      >
        <TextField
          label="Pesquisar"
          variant="outlined"
          placeholder="Nome, email ou telefone"
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Stack direction="row" spacing={1}>
          {/* IconButtons on xs, text Buttons on sm+ */}
          <IconButton onClick={handleSearch} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
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

          <IconButton onClick={handleClear} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
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

          <IconButton onClick={openAddDialog} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
            <AddIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Adicionar
          </Button>
        </Stack>
      </Stack>

      {results.length === 0 ? (
        <Typography align="center">Nenhum contato encontrado.</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: { xs: '40vh', sm: '60vh' }, overflowY: 'auto' }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Telefone</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{c.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{c.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDelete(c.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={dialogOpen} onClose={closeAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Contato</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            variant="outlined"
            value={newContact.name}
            onChange={e => setNewContact(n => ({ ...n, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newContact.email}
            onChange={e => setNewContact(n => ({ ...n, email: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Telefone"
            fullWidth
            variant="outlined"
            value={newContact.phone}
            onChange={e => setNewContact(n => ({ ...n, phone: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleAdd}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}