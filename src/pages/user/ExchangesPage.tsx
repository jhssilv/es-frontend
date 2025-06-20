import React, { useState } from 'react';

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
import DialogContentText from '@mui/material/DialogContentText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface ExchangeOffer {
  id: number;
  offeringUser: string;
  bookOffered: string;
  bookRequested: string;
  status: 'pending' | 'accepted' | 'rejected';
  offerDate: string;
}

const initialExchangeOffers: ExchangeOffer[] = [
  {
    id: 1,
    offeringUser: 'Ana Silva',
    bookOffered: 'O Pequeno Príncipe',
    bookRequested: 'Dom Casmurro',
    status: 'pending',
    offerDate: '15/05/2025',
  },
  {
    id: 2,
    offeringUser: 'Bruno Mendes',
    bookOffered: 'Cem Anos de Solidão',
    bookRequested: 'O Alquimista',
    status: 'pending',
    offerDate: '10/05/2025',
  },
  {
    id: 3,
    offeringUser: 'Carla Souza',
    bookOffered: '1984',
    bookRequested: 'Harry Potter e a Pedra Filosofal',
    status: 'accepted',
    offerDate: '01/05/2025',
  },
  {
    id: 4,
    offeringUser: 'Daniel Costa',
    bookOffered: 'A Revolução dos Bichos',
    bookRequested: 'O Grande Gatsby',
    status: 'rejected',
    offerDate: '28/04/2025',
  },
];

export default function ExchangesPage() {
  const [offers, setOffers] = useState<ExchangeOffer[]>(initialExchangeOffers);

  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [infoDialogOffer, setInfoDialogOffer] = useState<ExchangeOffer | null>(null);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogOffer, setConfirmDialogOffer] = useState<ExchangeOffer | null>(null);
  const [confirmDialogAction, setConfirmDialogAction] = useState<'accept' | 'reject' | null>(null);

  const [anchorElActionsMenu, setAnchorElActionsMenu] = useState<null | HTMLElement>(null);
  const openActionsMenu = Boolean(anchorElActionsMenu);

  // Função para abrir o diálogo de informações
  const handleOpenInfoDialog = (offer: ExchangeOffer) => {
    setInfoDialogOffer(offer);
    setIsInfoDialogOpen(true);
    handleCloseActionsMenu(); // Garante que o menu de ações esteja fechado
  };

  // Função para fechar o diálogo de informações e limpar o estado APÓS A TRANSIÇÃO
  const handleCloseInfoDialog = () => {
    setIsInfoDialogOpen(false);
    // Não limpa infoDialogOffer aqui, será limpo em onExited
  };

  // Função que é chamada APÓS a animação de fechamento do Info Dialog
  const handleExitedInfoDialog = () => {
    setInfoDialogOffer(null);
  };

  // Função para abrir o diálogo de confirmação
  const handleOpenConfirmDialog = (offer: ExchangeOffer, action: 'accept' | 'reject') => {
    setConfirmDialogOffer(offer);
    setConfirmDialogAction(action);
    setIsConfirmDialogOpen(true);
    handleCloseActionsMenu(); // Garante que o menu de ações esteja fechado
  };

  // Função para fechar o diálogo de confirmação e limpar o estado APÓS A TRANSIÇÃO
  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    // Não limpa confirmDialogOffer/confirmDialogAction aqui, será limpo em onExited
  };

  // Função que é chamada APÓS a animação de fechamento do Confirm Dialog
  const handleExitedConfirmDialog = () => {
    setConfirmDialogOffer(null);
    setConfirmDialogAction(null);
  };

  const handleAcceptOffer = () => {
    if (confirmDialogOffer) {
      console.log(`Oferta ${confirmDialogOffer.id} ACEITA.`);
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer.id === confirmDialogOffer.id ? { ...offer, status: 'accepted' } : offer
        )
      );
      handleCloseConfirmDialog(); // Inicia o fechamento visual
    }
  };

  const handleRejectOffer = () => {
    if (confirmDialogOffer) {
      console.log(`Oferta ${confirmDialogOffer.id} RECUSADA.`);
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer.id === confirmDialogOffer.id ? { ...offer, status: 'rejected' } : offer
        )
      );
      handleCloseConfirmDialog(); // Inicia o fechamento visual
    }
  };

  const getStatusDisplay = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <HelpOutlineIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">Pendente</Typography>
          </Stack>
        );
      case 'accepted':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" color="success.main">Aceita</Typography>
          </Stack>
        );
      case 'rejected':
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CancelIcon color="error" fontSize="small" />
            <Typography variant="body2" color="error.main">Recusada</Typography>
          </Stack>
        );
      default:
        return status;
    }
  };

  const handleOpenActionsMenu = (event: React.MouseEvent<HTMLElement>, offer: ExchangeOffer) => {
    setAnchorElActionsMenu(event.currentTarget);
    setConfirmDialogOffer(offer);
  };

  const handleCloseActionsMenu = () => {
    setAnchorElActionsMenu(null);
  };

  return (
    <Box>
      {offers.length === 0 ? (
        <Typography>Você não tem nenhuma oferta de troca no momento.</Typography>
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
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{offer.offerDate}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {getStatusDisplay(offer.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <Tooltip title="Ver Detalhes">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenInfoDialog(offer)}
                          aria-label="ver detalhes da oferta"
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>

                      {offer.status === 'pending' && (
                        <Tooltip title="Mais Ações">
                          <IconButton
                            size="small"
                            onClick={(event) => handleOpenActionsMenu(event, offer)}
                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                            aria-label="mais ações"
                            aria-controls={openActionsMenu ? 'actions-menu' : undefined}
                            aria-haspopup="true"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {offer.status === 'pending' ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleOpenConfirmDialog(offer, 'accept')}
                            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                          >
                            Aceitar
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleOpenConfirmDialog(offer, 'reject')}
                            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                          >
                            Recusar
                          </Button>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{
                          display: { xs: 'flex', sm: 'none' },
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
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

      <Menu
        anchorEl={anchorElActionsMenu}
        id="actions-menu"
        open={openActionsMenu}
        onClose={handleCloseActionsMenu}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        {confirmDialogOffer?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleOpenConfirmDialog(confirmDialogOffer, 'accept')}>
              <CheckCircleIcon sx={{ mr: 1 }} color="success" /> Aceitar
            </MenuItem>
            <MenuItem onClick={() => handleOpenConfirmDialog(confirmDialogOffer, 'reject')}>
              <CancelIcon sx={{ mr: 1 }} color="error" /> Recusar
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleCloseActionsMenu}>Fechar</MenuItem>
      </Menu>

      {/* DIÁLOGO DE DETALHES DA OFERTA (SEPARADO) */}
      <Dialog
        open={isInfoDialogOpen}
        onClose={handleCloseInfoDialog} // Inicia o fechamento visual
        fullWidth
        maxWidth="sm"
        TransitionProps={{
          onExited: handleExitedInfoDialog // Limpa o estado APÓS a transição de saída
        }}
      >
        <DialogTitle>Detalhes da Oferta</DialogTitle>
        <DialogContent dividers>
          {/* Só renderiza o conteúdo se infoDialogOffer não for null */}
          {infoDialogOffer && (
            <Stack spacing={1}>
              <DialogContentText>
                **De:** {infoDialogOffer.offeringUser}
              </DialogContentText>
              <DialogContentText>
                **Livro Ofertado por Ele(a):** {infoDialogOffer.bookOffered}
              </DialogContentText>
              <DialogContentText>
                **Seu Livro Solicitado:** {infoDialogOffer.bookRequested}
              </DialogContentText>
              <DialogContentText>
                **Data da Oferta:** {infoDialogOffer.offerDate}
              </DialogContentText>
              <DialogContentText>
                **Status:** {getStatusDisplay(infoDialogOffer.status)}
              </DialogContentText>
            </Stack>
          )}
          {/* Se infoDialogOffer for null (durante a animação de saída), evita renderizar o conteúdo vazio */}
          {!infoDialogOffer && (
             <Typography>Carregando detalhes...</Typography> // ou null, ou um spinner
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfoDialog} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE AÇÃO (ACEITAR/RECUSAR) (SEPARADO) */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog} // Inicia o fechamento visual
        fullWidth
        maxWidth="xs"
        TransitionProps={{
          onExited: handleExitedConfirmDialog // Limpa o estado APÓS a transição de saída
        }}
      >
        <DialogTitle>
          {confirmDialogAction === 'accept' ? 'Aceitar Oferta' : 'Recusar Oferta'}
        </DialogTitle>
        <DialogContent dividers>
          {confirmDialogOffer && confirmDialogAction && ( // Só renderiza o conteúdo se tiver dados
            <Typography>
              Tem certeza que deseja {confirmDialogAction === 'accept' ? 'aceitar' : 'recusar'} a oferta de{' '}
              **{confirmDialogOffer.offeringUser}** para o livro "{confirmDialogOffer.bookRequested}" (seu) por "{confirmDialogOffer.bookOffered}" (dele)?
            </Typography>
          )}
          {!confirmDialogOffer && !confirmDialogAction && (
              <Typography>Aguardando seleção...</Typography> // ou null
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={confirmDialogAction === 'accept' ? handleAcceptOffer : handleRejectOffer}
            color={confirmDialogAction === 'accept' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {confirmDialogAction === 'accept' ? 'Confirmar Aceite' : 'Confirmar Recusa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}