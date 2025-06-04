import React, { useState } from 'react';

import AppBar       from '@mui/material/AppBar';
import Box          from '@mui/material/Box';
import CssBaseline  from '@mui/material/CssBaseline';
import Divider      from '@mui/material/Divider';
import Drawer       from '@mui/material/Drawer';
import IconButton   from '@mui/material/IconButton';
import List         from '@mui/material/List';
import ListItem     from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar      from '@mui/material/Toolbar';
import Typography   from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ListItemButton } from '@mui/material';

import MenuIcon     from '@mui/icons-material/Menu';
import HomeIcon     from '@mui/icons-material/Home';
import BookIcon     from '@mui/icons-material/Book';
import AccountIcon  from '@mui/icons-material/AccountCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon   from '@mui/icons-material/Logout';

import { useAuth } from '../components/functions/useAuth';
import type { MenuItemData, PageKey } from '../types/MenuItemData';

import MeusLivrosPage from './MeusLivrosPage';

const drawerWidth = 240;

const MainPage: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /** 
   * Aqui fica o estado que determina qual “página” está ativa. 
   * Inicialmente, vamos mostrar "Home"
   */
  const [selectedPage, setSelectedPage] = useState<PageKey>('Home');

  /** Controle de abertura do drawer em mobile */
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  /** 
   * Cada item do menu: 
   * - Se `effect` existir, nós chamamos a função. 
   * - Caso contrário, `text` é uma das chaves de PageKey, 
   *   e então faremos setSelectedPage(text).
   */
  const menuItems: MenuItemData[] = [
    { text: 'Home',         icon: <HomeIcon /> },
    { text: 'Meus Livros',  icon: <BookIcon /> },
    { text: 'Conta',        icon: <AccountIcon /> },
    { text: 'Contatos',     icon: <ContactsIcon /> },
    { text: 'Configurações',icon: <SettingsIcon /> },
    { text: 'Logout',       icon: <LogoutIcon />, effect: logout },
  ];

  /** Este bloco renderiza o conteúdo do drawer (menu lateral). */
    const drawer = (
    <div>
      <Toolbar />
      <Divider />
            <List>
        {menuItems.map(({ text, icon, effect }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => {
                if (effect) {
                  effect();
                } else {
                  setSelectedPage(text);
                }
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              selected={!effect && selectedPage === text}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  /**
   * Esta função retorna o componente correto que deve aparecer 
   * na área “Main Content”, de acordo com selectedPage.
   */
  function renderPageContent() {
    switch (selectedPage) {
      case 'Home':
        //return <HomePage />;
        break; // Tirar quando for adicionado a HomePage
      case 'Meus Livros':
        return <MeusLivrosPage />;
      case 'Conta':
        //return <ContaPage />;
      case 'Contatos':
        //return <ContatosPage />;
      case 'Configurações':
        //return <ConfiguracoesPage />;
      // O caso 'Logout' não deve aparecer aqui porque executamos logout() acima.
      default:
        return <Typography>Ops… página desconhecida</Typography>;
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ ml: isMobile ? 0 : 2 }}>
            Vira a Página
          </Typography>
          <Typography variant="subtitle1">Oi, {user}!</Typography>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navegação"
      >
        {/* Mobile Drawer (temporário) */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // melhora performance em mobile
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Desktop Drawer (permanente) */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // para não ficar atrás do AppBar
        }}
      >
        {/* Cabeçalho fixo (pode variar conforme a página). */}
        <Typography variant="h4" gutterBottom>
          {selectedPage === 'Logout'
            ? 'Saindo…'
            : `Bem-vindo ao Vira a Página — ${selectedPage}`}
        </Typography>

        {/* Aqui injetamos o componente correto de acordo com selectedPage */}
        {renderPageContent()}
      </Box>
    </Box>
  );
};

export default MainPage;
