import React, { useState } from 'react';
import axios from 'axios';
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
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../components/functions/useAuth';

type ExchangeStatus = 'REQUESTED' | 'ACCEPTED' | 'REFUSED' | 'WAITING_APPROVAL' | 'COMPLETED' | 'CANCELED';

// Interface para os dados formatados que este popup usará
interface NotificationOffer {
  id: number;
  offeringUser: string;
  bookOffered: string;
  bookRequested: string;
}

// Interfaces para os dados brutos da API (do seu exemplo)
interface ApiBook {
    id: number;
    title: string;
    ownerId: number;
}

interface ApiExchange {
    id: number;
    status: ExchangeStatus;
    requestDate: string;
    requesterBooks: ApiBook[];
    providerBooks: ApiBook[];
}

// A prop onNavigateToExchanges ainda é útil
interface ExchangeOffersPopupProps {
  onNavigateToExchanges: () => void;
}

const ExchangeOffersPopup: React.FC<ExchangeOffersPopupProps> = ({ onNavigateToExchanges }) => {
  // --- GERENCIAMENTO DE ESTADO (BASEADO NO SEU EXEMPLO) ---
  const [offers, setOffers] = useState<NotificationOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Pega o usuário do contexto de autenticação
  const { user } = useAuth();

  // --- LÓGICA DE BUSCA DE DADOS (BASEADO NO SEU EXEMPLO) ---
  const fetchPendingOffers = async () => {
    // Não busca se já estiver buscando ou se o usuário não estiver logado
    if (isLoading || !user?.id) {
      if (!user?.id) console.log("Popup de trocas: Usuário não identificado.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/exchanges/user/${user.id}`);
      const rawExchanges: ApiExchange[] = response.data.items;

      if (!Array.isArray(rawExchanges)) {
        throw new Error('Formato de dados da API inesperado.');
      }
      
      const pendingReceivedOffers: NotificationOffer[] = rawExchanges
        // 1. Filtra para manter apenas ofertas recebidas e pendentes
        .filter(item => {
          const providerInfo = item.providerBooks?.[0];
          // A oferta é "recebida" se o ID do usuário logado for o mesmo do "provider" do livro
          const isUserTheProvider = String(providerInfo?.ownerId) === String(user.id);
          // A oferta está "pendente" se o status for 'REQUESTED'
          const isPending = item.status === 'REQUESTED';
          
          return isUserTheProvider && isPending;
        })
        // 2. Mapeia os itens filtrados para o formato que a UI precisa
        .map((item): NotificationOffer | null => {
            const requesterBook = item.requesterBooks?.[0];
            const providerBook = item.providerBooks?.[0];

            // Checagem de segurança
            if (!requesterBook || !providerBook) return null;

            return {
                id: item.id,
                offeringUser: `Usuário #${requesterBook.ownerId}`, // Quem oferta é o requester
                bookOffered: requesterBook.title,                  // O livro que ele oferece
                bookRequested: providerBook.title,                 // O livro que ele quer de você
            };
        })
        // 3. Remove quaisquer nulos que possam ter surgido no mapeamento
        .filter((offer): offer is NotificationOffer => offer !== null);

      setOffers(pendingReceivedOffers);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro inesperado.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchPendingOffers(); // Busca os dados ao abrir o popup
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToAllExchanges = () => {
    onNavigateToExchanges();
    handleClose();
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <MenuItem disabled sx={{ justifyContent: 'center', p: 2 }}>
          <CircularProgress size={20} />
          <Typography sx={{ ml: 1 }}>Carregando...</Typography>
        </MenuItem>
      );
    }

    if (error) {
      return (
        <MenuItem disabled>
          <ListItemText primary="Falha ao carregar" secondary={error} sx={{ color: 'error.main' }} />
        </MenuItem>
      );
    }

    if (offers.length === 0) {
      return (
        <MenuItem disabled>
          <ListItemText>Nenhuma nova oferta pendente.</ListItemText>
        </MenuItem>
      );
    }

    // Mostra no máximo as 3 primeiras ofertas pendentes
    return offers.slice(0, 3).map(offer => (
      <MenuItem key={offer.id} onClick={handleNavigateToAllExchanges}>
        <ListItemIcon>
          <SwapCallsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={`De: ${offer.offeringUser}`}
          secondary={`"${offer.bookOffered}" por "${offer.bookRequested}"`}
          primaryTypographyProps={{ fontWeight: 'bold' }}
          secondaryTypographyProps={{ whiteSpace: 'normal' }}
        />
      </MenuItem>
    ));
  };

  return (
    <Box>
      <IconButton size="large" color="inherit" onClick={handleClick}>
        <Badge badgeContent={offers.length} color="error">
          <SwapCallsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
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
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
          Ofertas Pendentes ({offers.length})
        </Typography>
        <Divider />
        
        {renderContent()}

        {(offers.length > 0 || error) && <Divider />}

        <MenuItem onClick={handleNavigateToAllExchanges}>
          <Button size="small" fullWidth>
            {offers.length > 0 ? 'Ver Todas as Trocas' : 'Ir para Trocas'}
          </Button>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExchangeOffersPopup;
