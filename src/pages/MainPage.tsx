import React, { useState } from 'react';

import AppBar         from '@mui/material/AppBar';
import Box            from '@mui/material/Box';
import CssBaseline    from '@mui/material/CssBaseline';
import Divider        from '@mui/material/Divider';
import Drawer         from '@mui/material/Drawer';
import IconButton     from '@mui/material/IconButton';
import List           from '@mui/material/List';
import ListItem       from '@mui/material/ListItem';
import ListItemIcon   from '@mui/material/ListItemIcon';
import ListItemText   from '@mui/material/ListItemText';
import Toolbar        from '@mui/material/Toolbar';
import Typography     from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery  from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import AccountIcon from '@mui/icons-material/AccountCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../components/functions/useAuth';
import type { MenuItemData } from '../types/MenuItemData';

const drawerWidth = 240;

const MainPage: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const menuItems: MenuItemData[] = [
    { text: 'Home', icon: <HomeIcon /> },
    { text: 'Meus Livros', icon: <BookIcon /> },
    { text: 'Conta', icon: <AccountIcon /> },
    { text: 'Contatos', icon: <ContactsIcon /> },
    { text: 'Configurações', icon: <SettingsIcon /> },
    { text: 'Logout', icon: <LogoutIcon />, effect: logout},
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map(({ text, icon, effect }) => (
          <ListItem component="button" key={text} onClick={effect ? () => effect() : undefined}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

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
          <Typography variant="subtitle1">
            Oi, {user}!
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // better mobile performance
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Desktop Drawer */}
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
          mt: 8,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Bem vindo ao Vira a Página!
        </Typography>
        {/* Your swipe cards or main content go here */}
      </Box>
    </Box>
  );
};

export default MainPage;