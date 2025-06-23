import React, { useState, useEffect } from 'react';

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

interface Exchange {
  id: number;
  offeringUser: string;
  bookOffered: string;
  bookRequested: string;
  status: ExchangeStatus;
  offerDate: string;
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
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/exchanges/user/${user?.id}`);
        const responseText = await response.text(); // Sempre ler como texto primeiro

        if (!response.ok) {
          // Se a resposta não for bem-sucedida, o corpo pode ter detalhes do erro
          throw new Error(responseText || 'Falha ao buscar as ofertas de troca. Tente novamente.');
        }

        if (!responseText) {
          // Resposta bem-sucedida, mas com corpo vazio
          setOffers([]);
          return;
        }

        let responseData;
        try {
          // CORREÇÃO: Tentar fazer o parse dentro de um bloco try-catch
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Falha ao analisar a resposta JSON da API:", e);
          console.error("Resposta recebida:", responseText);
          throw new Error("Formato de resposta inesperado do servidor.");
        }
        
        const exchangesList = Array.isArray(responseData) ? responseData : responseData.Exchanges;

        if (!Array.isArray(exchangesList)) {
          console.error("Estrutura de dados inesperada:", responseData);
          throw new Error('O formato dos dados recebidos da API é inválido.');
        }
        
        setOffers(exchangesList);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro inesperado.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExchanges();
  }, []);

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
    if (!confirmDialogOffer) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/exchanges/${confirmDialogOffer.id}/accept`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Falha ao aceitar a oferta.');
      
      // CORREÇÃO: Lida com respostas JSON ou vazias
      const responseText = await response.text();
      if (responseText) {
        const updatedOffer = JSON.parse(responseText) as Exchange;
        setOffers(prev => prev.map(o => o.id === updatedOffer.id ? updatedOffer : o));
      } else {
        // Se a API retornar corpo vazio, atualiza o estado manualmente
        setOffers(prev => prev.map(o => 
          o.id === confirmDialogOffer.id ? { ...o, status: 'ACCEPTED' } : o
        ));
      }

      handleCloseConfirmDialog();
    } catch (err) {
      console.error(err); // TODO: Adicionar feedback de erro para o usuário (ex: Snackbar)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!confirmDialogOffer) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/exchanges/${confirmDialogOffer.id}/reject`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Falha ao recusar a oferta.');
      
      // CORREÇÃO: Lida com respostas JSON ou vazias
      const responseText = await response.text();
      if (responseText) {
          const updatedOffer = JSON.parse(responseText) as Exchange;
          setOffers(prev => prev.map(o => o.id === updatedOffer.id ? updatedOffer : o));
      } else {
          // Se a API retornar corpo vazio, atualiza o estado manualmente
          setOffers(prev => prev.map(o => 
            o.id === confirmDialogOffer.id ? { ...o, status: 'REFUSED' } : o
          ));
      }

      handleCloseConfirmDialog();
    } catch (err) {
      console.error(err); // TODO: Adicionar feedback de erro para o usuário (ex: Snackbar)
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

  const isActionable = (status: ExchangeStatus) => {
    return status === 'REQUESTED' || status === 'WAITING_APPROVAL';
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      {offers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Você não tem nenhuma oferta de troca no momento.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Seu Livro Solicitado</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Livro Ofertado</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Usuário Ofertante</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Data</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.map(offer => (
                <TableRow key={offer.id}>
                  <TableCell>{offer.bookRequested}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{offer.bookOffered}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{offer.offeringUser}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{new Date(offer.offerDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{getStatusDisplay(offer.status)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Ver Detalhes">
                        <IconButton size="small" color="info" onClick={() => handleOpenInfoDialog(offer)}>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      {isActionable(offer.status) ? (
                        <>
                          <Tooltip title="Mais Ações">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenActionsMenu(e, offer)}
                              sx={{ display: { xs: 'flex', sm: 'none' } }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                          <Button variant="outlined" size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleOpenConfirmDialog(offer, 'accept')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                            Aceitar
                          </Button>
                          <Button variant="outlined" size="small" color="error" startIcon={<CancelIcon />} onClick={() => handleOpenConfirmDialog(offer, 'reject')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                            Recusar
                          </Button>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', alignItems: 'center', minHeight: '34px' }}>
                          {getStatusDisplay(offer.status)}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={anchorElActionsMenu} open={openActionsMenu} onClose={handleCloseActionsMenu}>
        {confirmDialogOffer && isActionable(confirmDialogOffer.status) && [
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
              <Typography><strong>De:</strong> {infoDialogOffer.offeringUser}</Typography>
              <Typography><strong>Livro Ofertado:</strong> {infoDialogOffer.bookOffered}</Typography>
              <Typography><strong>Seu Livro Solicitado:</strong> {infoDialogOffer.bookRequested}</Typography>
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
              Tem certeza que deseja {confirmDialogAction === 'accept' ? 'aceitar' : 'recusar'} a oferta de <strong>{confirmDialogOffer.offeringUser}</strong>?
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
