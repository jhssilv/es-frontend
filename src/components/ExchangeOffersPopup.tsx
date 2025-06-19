// components/ExchangeOffersPopup.tsx
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// Simulação de dados de ofertas de troca
interface ExchangeOffer {
  id: number;
  offeringUser: string;
  bookOffered: string;
  bookRequested: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const dummyOffers: ExchangeOffer[] = [
  { id: 1, offeringUser: 'Ana', bookOffered: 'O Senhor dos Anéis: A Sociedade do Anel (edição de luxo)', bookRequested: '1984', status: 'pending' },
  { id: 2, offeringUser: 'Bruno', bookOffered: 'Cem Anos de Solidão', bookRequested: 'Dom Casmurro: Uma Leitura Crítica e Análise Literária Detalhada', status: 'pending' },
  { id: 3, offeringUser: 'Carla', bookOffered: 'A Culpa é das Estrelas', bookRequested: 'O Alquimista', status: 'pending' },
  { id: 4, offeringUser: 'Pedro', bookOffered: 'Sapiens: Uma Breve História da Humanidade', bookRequested: 'Homo Deus: Uma Breve História do Amanhã', status: 'pending' },
];

interface ExchangeOffersPopupProps {
  onNavigateToExchanges: () => void; // Nova prop para navegar
}

const ExchangeOffersPopup: React.FC<ExchangeOffersPopupProps> = ({ onNavigateToExchanges }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [offers, setOffers] = useState<ExchangeOffer[]>(dummyOffers);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewOffer = (offerId: number) => {
    console.log(`Visualizar oferta específica: ${offerId}`);
    // Em um cenário real, você poderia navegar para uma página de detalhes da oferta
    // ou abrir um modal com mais informações sobre essa oferta específica.
    handleClose();
  };

  const handleNavigateToAllExchanges = () => {
    onNavigateToExchanges(); // Chama a função de navegação passada via prop
    handleClose(); // Fecha o popup
  };

  const pendingOffersCount = offers.filter(offer => offer.status === 'pending').length;

  return (
    <Box sx={{ flexGrow: 0 }}>
      <IconButton
        size="large"
        aria-label={`mostrar ${pendingOffersCount} novas ofertas de troca`}
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={pendingOffersCount} color="error">
          <SwapCallsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="exchange-offers-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 280,
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 },
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
          Suas Ofertas de Troca ({pendingOffersCount})
        </Typography>
        <Divider />
        {pendingOffersCount === 0 ? (
          <MenuItem disabled>
            <ListItemText>Nenhuma nova oferta de troca.</ListItemText>
          </MenuItem>
        ) : (
          offers.filter(offer => offer.status === 'pending').slice(0, 3).map(offer => (
            <MenuItem key={offer.id} onClick={() => handleViewOffer(offer.id)}>
              <ListItemIcon>
                <SwapCallsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxHeight: '3.6em',
                  lineHeight: '1.2em'
                }}
              >
                De **{offer.offeringUser}**: "{offer.bookOffered}" por "{offer.bookRequested}"
              </ListItemText>
            </MenuItem>
          ))
        )}
        {pendingOffersCount > 0 && ( // Mudado para mostrar o botão se houver qualquer oferta
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button size="small" onClick={handleNavigateToAllExchanges}>
              Ver Todas
            </Button>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemText>Fechar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExchangeOffersPopup;