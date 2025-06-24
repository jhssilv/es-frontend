import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useAuth } from '../../components/functions/useAuth';

type ExchangeStatus = 'REQUESTED' | 'ACCEPTED' | 'REFUSED' | 'WAITING_APPROVAL' | 'COMPLETED' | 'CANCELED';

interface ApiUser {
  id: number
  name: string
  email: string
  password: string
  uniCard: string
  course: string
  contact: string
  rating: number
  status: string
} 

interface ApiBook {
    id: number;
    title: string;
    author: string;
    year: number;
    condition: string;
    ownerId: number; 
  }

interface ApiExchange {
    id: number;
    providerId: number;
    requesterId: number;
    status: ExchangeStatus;
    requestDate: string;
    requesterBook?: ApiBook;
    providerBook?: ApiBook;
    owner: ApiUser;
}

interface Exchange {
  id: number;
  providerId: number;
  bookOffered: string;
  bookRequested: string;
  status: ExchangeStatus;
  offerDate: string;
  name: string;
}

export default function ExchangesPage() {
  const [offers, setOffers] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [infoDialogOffer, setInfoDialogOffer] = useState<Exchange | null>(null);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogOffer, setConfirmDialogOffer] = useState<Exchange | null>(null);
  const [confirmDialogAction, setConfirmDialogAction] = useState<'accept' | 'reject' | null>(null);

  const [anchorElActionsMenu, setAnchorElActionsMenu] = useState<null | HTMLElement>(null);
  const openActionsMenu = Boolean(anchorElActionsMenu);
  const { user } = useAuth();

  useEffect(() => {
    const fetchExchanges = async () => {
      if (!user?.id) {
        setError("Usuário não identificado. Não é possível carregar as trocas.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/exchanges/user/${user?.id}`);
        const rawExchanges: ApiExchange[] = response.data.items;

        if (!Array.isArray(rawExchanges)) {
          throw new Error('Formato de dados da API inesperado.');
        }
        
        const formattedOffers = rawExchanges.map((item: ApiExchange) => {
            return {
              id: item.id,
              providerId: item.providerId,
              status: item.status,
              offerDate: item.requestDate,
              bookRequested: item.requesterBook?.title || 'Livro não encontrado',
              bookOffered: item.providerBook?.title || 'Livro não encontrado',
              name: item.owner?.name ?? 'Usuário Indisponível',
            };
          });

        setOffers(formattedOffers);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro inesperado.';
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchanges();
  }, [user?.id]);

  const handleOpenInfoDialog = (offer: Exchange) => {
    setInfoDialogOffer(offer);
    setIsInfoDialogOpen(true);
    handleCloseActionsMenu();
  };
  const handleCloseInfoDialog = () => setIsInfoDialogOpen(false);
  const handleExitedInfoDialog = () => setInfoDialogOffer(null);

  const handleOpenConfirmDialog = (offer: Exchange, action: 'accept' | 'reject') => {
    setConfirmDialogOffer(offer);
    setConfirmDialogAction(action);
    setIsConfirmDialogOpen(true);
    handleCloseActionsMenu();
  };
  const handleCloseConfirmDialog = () => {
    if (isSubmitting) return;
    setIsConfirmDialogOpen(false);
  };
  const handleExitedConfirmDialog = () => {
    setConfirmDialogOffer(null);
    setConfirmDialogAction(null);
  };

  const handleAcceptOffer = async () => {
    if (!confirmDialogOffer || !Number.isFinite(confirmDialogOffer.id)) {
      setError("Erro: ID da oferta inválido. Não foi possível completar a ação.");
      setIsSubmitting(false);
      handleCloseConfirmDialog();
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
       await axios.patch(`/exchanges/${confirmDialogOffer.id}/accept`, { userId: user?.id });
      
      setOffers(prev => prev.map(o => 
        o.id === confirmDialogOffer.id ? { ...o, status: 'ACCEPTED' } : o
      ));
      
      handleCloseConfirmDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Falha ao aceitar a oferta.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!confirmDialogOffer || !Number.isFinite(confirmDialogOffer.id)) {
      setError("Erro: ID da oferta inválido. Não foi possível completar a ação.");
      setIsSubmitting(false);
      handleCloseConfirmDialog();
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.patch(`/exchanges/${confirmDialogOffer.id}/reject`, { userId: user?.id });

      setOffers(prev => prev.map(o => 
        o.id === confirmDialogOffer.id ? { ...o, status: 'REFUSED' } : o
      ));

      handleCloseConfirmDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Falha ao recusar a oferta.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusDisplay = (status: ExchangeStatus) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <HelpOutlineIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">Requisitada</Typography>
          </Stack>
        );
      case 'WAITING_APPROVAL':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <AutorenewIcon color="info" fontSize="small" />
            <Typography variant="body2" color="info.main">Aguardando</Typography>
          </Stack>
        );
      case 'ACCEPTED':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" color="success.main">Aceita</Typography>
          </Stack>
        );
      case 'COMPLETED':
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ThumbUpIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main">Concluída</Typography>
            </Stack>
          );
      case 'REFUSED':
      case 'CANCELED':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CancelIcon color="error" fontSize="small" />
            <Typography variant="body2" color="error.main">{status === 'REFUSED' ? 'Recusada' : 'Cancelada'}</Typography>
          </Stack>
        );
      default:
        return <Typography variant="body2">{status}</Typography>;
    }
  };

  const handleOpenActionsMenu = (event: React.MouseEvent<HTMLElement>, offer: Exchange) => {
    setAnchorElActionsMenu(event.currentTarget);
    setConfirmDialogOffer(offer);
  };
  const handleCloseActionsMenu = () => setAnchorElActionsMenu(null);
  
  // A função isActionable não é mais necessária, a lógica será feita diretamente no JSX.

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }
  
  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {offers.length === 0 && !error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Você não tem nenhuma oferta de troca no momento.</Typography>
        </Paper>
      ) : (
        !error && <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Livro Solicitado</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Livro Ofertado</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Usuário</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Data</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.map((offer, index) => (
                <TableRow key={`${offer.id}-${index}`}>
                  <TableCell>{offer.bookRequested}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{offer.bookOffered}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{offer.name}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{new Date(offer.offerDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusDisplay(offer.status)}</TableCell>
                  <TableCell align="center">
                    {Number(user?.id) == offer.providerId && offer.status === 'REQUESTED' ? (
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Ver Detalhes">
                            <IconButton size="small" color="info" onClick={() => handleOpenInfoDialog(offer)}>
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                        
                        {/* Ações para telas pequenas (Menu) */}
                        <Tooltip title="Mais Ações">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenActionsMenu(e, offer)}
                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Ações para telas maiores (Botões) */}
                        <Button variant="outlined" size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleOpenConfirmDialog(offer, 'accept')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                          Aceitar
                        </Button>
                        <Button variant="outlined" size="small" color="error" startIcon={<CancelIcon />} onClick={() => handleOpenConfirmDialog(offer, 'reject')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                          Recusar
                        </Button>
                      </Stack>
                    ) : (
                      // Caso contrário, mostramos apenas o ícone de detalhes
                      <Tooltip title="Ver Detalhes">
                        <IconButton size="small" color="info" onClick={() => handleOpenInfoDialog(offer)}>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MUDANÇA 4: Atualizar a condição para mostrar os itens do menu */}
      <Menu anchorEl={anchorElActionsMenu} open={openActionsMenu} onClose={handleCloseActionsMenu}>
        {confirmDialogOffer && Number(user?.id) == confirmDialogOffer.providerId && confirmDialogOffer.status === 'REQUESTED' && [
          <MenuItem key="accept" onClick={() => handleOpenConfirmDialog(confirmDialogOffer, 'accept')}>
            <CheckCircleIcon sx={{ mr: 1 }} color="success" /> Aceitar
          </MenuItem>,
          <MenuItem key="reject" onClick={() => handleOpenConfirmDialog(confirmDialogOffer, 'reject')}>
            <CancelIcon sx={{ mr: 1 }} color="error" /> Recusar
          </MenuItem>
        ]}
      </Menu>

      <Dialog open={isInfoDialogOpen} onClose={handleCloseInfoDialog} fullWidth maxWidth="sm" TransitionProps={{ onExited: handleExitedInfoDialog }}>
        <DialogTitle>Detalhes da Oferta</DialogTitle>
        <DialogContent dividers>
          {infoDialogOffer ? (
            <Stack spacing={2} sx={{ py: 1 }}>
              {/* LINHA ADICIONADA */}
              <Typography><strong>Usuário:</strong> {infoDialogOffer.name}</Typography> 
              
              <Typography><strong>Livro Ofertado:</strong> {infoDialogOffer.bookOffered}</Typography>
              <Typography><strong>Livro Solicitado:</strong> {infoDialogOffer.bookRequested}</Typography>
              <Typography><strong>Data da Oferta:</strong> {new Date(infoDialogOffer.offerDate).toLocaleString()}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography><strong>Status:</strong></Typography>
                {getStatusDisplay(infoDialogOffer.status)}
              </Stack>
            </Stack>
          ) : <Typography>Carregando detalhes...</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfoDialog} color="primary">Fechar</Button>
        </DialogActions>
    </Dialog>

      <Dialog open={isConfirmDialogOpen} onClose={handleCloseConfirmDialog} fullWidth maxWidth="xs" TransitionProps={{ onExited: handleExitedConfirmDialog }}>
        <DialogTitle>{confirmDialogAction === 'accept' ? 'Aceitar Oferta' : 'Recusar Oferta'}</DialogTitle>
        <DialogContent dividers>
          {confirmDialogOffer && (
            <Typography>
              Tem certeza que deseja {confirmDialogAction === 'accept' ? 'aceitar' : 'recusar'} a oferta de troca?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit" disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={confirmDialogAction === 'accept' ? handleAcceptOffer : handleRejectOffer} color={confirmDialogAction === 'accept' ? 'success' : 'error'} variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
            {isSubmitting ? 'Confirmando...' : (confirmDialogAction === 'accept' ? 'Confirmar Aceite' : 'Confirmar Recusa')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}