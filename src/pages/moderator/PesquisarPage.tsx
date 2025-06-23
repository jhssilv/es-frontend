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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Define the Book interface
interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  status: 'pending' | 'accepted' | 'rejected';
  publishedBy: string; // User who published the book (mock ID)
}

// Mock initial book data
const initialBooks: Book[] = [
  { id: '1', title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899, status: 'pending', publishedBy: 'user-abc-123' },
  { id: '2', title: 'O Alquimista', author: 'Paulo Coelho', year: 1988, status: 'accepted', publishedBy: 'user-def-456' },
  { id: '3', title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', year: 1997, status: 'pending', publishedBy: 'user-ghi-789' },
  { id: '4', title: '1984', author: 'George Orwell', year: 1949, status: 'rejected', publishedBy: 'user-abc-123' },
  { id: '5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, status: 'pending', publishedBy: 'user-jkl-012' },
  { id: '6', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', year: 2011, status: 'accepted', publishedBy: 'user-def-456' },
  { id: '7', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', year: 1866, status: 'pending', publishedBy: 'user-mno-345' },
];

export default function App() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // State for confirmation dialog (Reject/Delete)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'delete' | null>(null);

  // State for Info dialog
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [infoDialogBook, setInfoDialogBook] = useState<Book | null>(null);

  // State for action menu (MoreVertIcon)
  const [anchorElActionsMenu, setAnchorElActionsMenu] = useState<null | HTMLElement>(null);
  const openActionsMenu = Boolean(anchorElActionsMenu);

  // Filter books based on search term and status filter
  const filteredBooks = useMemo(() => {1111111111111
    let currentBooks = books;

    // Apply status filter
    if (statusFilter !== 'all') {
      currentBooks = currentBooks.filter(book => book.status === statusFilter);
    }

    // Apply text search
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      currentBooks = currentBooks.filter(
        ({ title, author }) =>
          title.toLowerCase().includes(q) ||
          author.toLowerCase().includes(q)
      );
    }

    return currentBooks;
  }, [books, searchTerm, statusFilter]);

  // Handle search button click
  const handleSearch = () => {
    // Filtering is handled by useMemo based on searchTerm change.
    // This function can be used to trigger a search explicitly if needed,
    // e.g., for a "Go" button, but for now, it simply re-evaluates.
  };

  // Clear search and filters
  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Open confirmation dialog for reject/delete
  const confirmAction = (book: Book, action: 'reject' | 'delete') => {
    setSelectedBook(book);
    setActionType(action);
    setOpenConfirmDialog(true);
    handleCloseActionsMenu(); // Close menu if action initiated from there
  };

  // Close confirmation dialog (starts animation)
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  // Resets state after confirmation dialog closes animation
  const handleExitedConfirmDialog = () => {
    setSelectedBook(null);
    setActionType(null);
  };

  // Execute confirmed action (reject or delete) on local state
  const handleConfirmAction = () => {
    if (!selectedBook) return;

    if (actionType === 'reject') {
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === selectedBook.id ? { ...book, status: 'rejected' } : book
        )
      );
      console.log(`Book ${selectedBook.id} rejected (locally).`);
    } else if (actionType === 'delete') {
      setBooks(prevBooks => prevBooks.filter(book => book.id !== selectedBook.id));
      console.log(`Book ${selectedBook.id} deleted (locally).`);
    }
    handleCloseConfirmDialog();
  };

  // Handle accepting a book on local state
  const handleAccept = (book: Book) => {
    setBooks(prevBooks =>
      prevBooks.map(b =>
        b.id === book.id ? { ...b, status: 'accepted' } : b
      )
    );
    console.log(`Book ${book.id} accepted (locally).`);
    handleCloseActionsMenu(); // Close menu if action initiated from there
  };

  // Helper to display status with appropriate styling (used in info dialog)
  const getStatusDisplay = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
            Pending
          </Typography>
        );
      case 'accepted':
        return (
          <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            Accepted
          </Typography>
        );
      case 'rejected':
        return (
          <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
            Rejected
          </Typography>
        );
      default:
        return status;
    }
  };

  // Handle opening the MoreVertIcon menu
  const handleOpenActionsMenu = (event: React.MouseEvent<HTMLElement>, book: Book) => {
    setAnchorElActionsMenu(event.currentTarget);
    setSelectedBook(book); // Set the book for actions within the menu
  };

  // Handle closing the MoreVertIcon menu
  const handleCloseActionsMenu = () => {
    setAnchorElActionsMenu(null);
  };

  // Handle opening the Info dialog
  const handleOpenInfoDialog = (book: Book) => {
    setInfoDialogBook(book);
    setOpenInfoDialog(true);
  };

  // Handle closing the Info dialog (starts animation)
  const handleCloseInfoDialog = () => {
    setOpenInfoDialog(false);
  };

  // Resets state after info dialog closes animation
  const handleExitedInfoDialog = () => {
    setInfoDialogBook(null);
  };


  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      {/* Responsive filter and search bar */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="center"
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        <TextField
          label="Search by Title or Author"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />

        <FormControl sx={{ minWidth: 180, width: { xs: '100%', md: 'auto' } }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter-select"
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Tooltip title="Search">
            <IconButton color="primary" onClick={handleSearch} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Filters">
            <IconButton color="secondary" onClick={handleClear} aria-label="clear filters">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {filteredBooks.length === 0 ? (
        <Typography align="center" variant="h6" sx={{ mt: 4 }}>
          No books found matching your criteria.
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: { xs: '60vh', sm: '70vh' }, overflowX: 'auto', borderRadius: 2 }}
        >
          <Table stickyHeader aria-label="moderator books table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Author</TableCell> {/* Responsive */}
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Year</TableCell>   {/* Responsive */}
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell> {/* Responsive */}
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Published By</TableCell> {/* Responsive */}
                <TableCell align="center">Details & Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow
                  key={book.id}
                  hover
                  sx={{ backgroundColor: book.status === 'pending' ? 'rgba(255, 255, 0, 0.05)' : 'inherit' }} // Subtle yellow for pending
                >
                  <TableCell>{book.title}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{book.author}</TableCell> {/* Responsive */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{book.year}</TableCell>   {/* Responsive */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {getStatusDisplay(book.status)}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{book.publishedBy}</TableCell> {/* Responsive */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton
                          aria-label="view book details"
                          onClick={() => handleOpenInfoDialog(book)}
                          size="small"
                        >
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton
                          aria-label="more actions"
                          aria-controls={openActionsMenu ? 'actions-menu' : undefined}
                          aria-haspopup="true"
                          onClick={(event) => handleOpenActionsMenu(event, book)}
                          size="small"
                        >
                          <MoreVertIcon />
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

      {/* Confirmation Dialog (Reject/Delete) */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        TransitionProps={{ onExited: handleExitedConfirmDialog }}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {actionType === 'reject' ? 'Confirm Rejection' : 'Confirm Deletion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to {actionType} the book "{selectedBook?.title}" by {selectedBook?.author}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmAction} autoFocus color={actionType === 'reject' ? 'warning' : 'error'}>
            {actionType === 'reject' ? 'Reject' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog */}
      <Dialog
        open={openInfoDialog}
        onClose={handleCloseInfoDialog}
        TransitionProps={{ onExited: handleExitedInfoDialog }}
        aria-labelledby="info-dialog-title"
      >
        <DialogTitle id="info-dialog-title">Book Details</DialogTitle>
        <DialogContent dividers>
          {infoDialogBook ? (
            <Stack spacing={1}>
              <Typography variant="body1">
                <strong>Title:</strong> {infoDialogBook.title}
              </Typography>
              <Typography variant="body1">
                <strong>Author:</strong> {infoDialogBook.author}
              </Typography>
              <Typography variant="body1">
                <strong>Year:</strong> {infoDialogBook.year}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {getStatusDisplay(infoDialogBook.status)}
              </Typography>
              <Typography variant="body1">
                <strong>Published By:</strong> {infoDialogBook.publishedBy}
              </Typography>
            </Stack>
          ) : (
            <Typography>Loading details...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfoDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorElActionsMenu}
        id="actions-menu"
        open={openActionsMenu}
        onClose={handleCloseActionsMenu}
        MenuListProps={{
          'aria-labelledby': 'more-actions-button',
        }}
      >
        {selectedBook && ( // Ensure a book is selected before rendering menu items
          <>
            <MenuItem
              onClick={() => handleAccept(selectedBook)}
              disabled={selectedBook.status === 'accepted'}
            >
              <CheckCircleOutlineIcon sx={{ mr: 1 }} color="success" /> Accept
            </MenuItem>
            <MenuItem
              onClick={() => confirmAction(selectedBook, 'reject')}
              disabled={selectedBook.status === 'rejected'}
            >
              <CancelOutlinedIcon sx={{ mr: 1 }} color="warning" /> Reject
            </MenuItem>
            <MenuItem onClick={() => confirmAction(selectedBook, 'delete')}>
              <DeleteOutlineIcon sx={{ mr: 1 }} color="error" /> Delete
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}