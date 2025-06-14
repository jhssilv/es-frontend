import React, { useState, type JSX } from 'react';

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
import Button         from '@mui/material/Button';
import Dialog         from '@mui/material/Dialog';
import DialogActions  from '@mui/material/DialogActions';
import DialogContent  from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle    from '@mui/material/DialogTitle';
import { useTheme }   from '@mui/material/styles';
import useMediaQuery  from '@mui/material/useMediaQuery';
import { ListItemButton } from '@mui/material';

// Ícones Genéricos
import MenuIcon     from '@mui/icons-material/Menu';
import LogoutIcon   from '@mui/icons-material/Logout';

// Ícones específicos para Moderador
import GroupIcon        from '@mui/icons-material/Group';
import RateReviewIcon   from '@mui/icons-material/RateReview';
import DashboardIcon    from '@mui/icons-material/Dashboard';
import CampaignIcon     from '@mui/icons-material/Campaign';

import { useAuth }  from '../components/functions/useAuth';

// Tipos para menu e páginas de moderador
type ModeratorPageKey = 'Gerenciar Publicações' | 'Gerenciar Usuários' | 'Avaliações de usuários' | 'Configurações';
interface ModeratorMenuItem {
  text: ModeratorPageKey | 'Logout';
  icon: JSX.Element;
  effect?: () => void;
}

const drawerWidth = 240;

const ModeratorPage: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  
  // O estado inicial agora reflete a primeira página do moderador
  const [selectedPage, setSelectedPage] = useState<ModeratorPageKey>('Gerenciar Publicações');

  /** Controle de abertura do drawer em mobile */
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  /** * Itens de menu específicos para o Moderador.
   */
  const moderatorMenuItems: ModeratorMenuItem[] = [
    { text: 'Gerenciar Publicações', icon: <GroupIcon /> },
    { text: 'Gerenciar Usuários',   icon: <RateReviewIcon /> },
    { text: 'Avaliações de usuários',          icon: <DashboardIcon /> },
    { text: 'Configurações',           icon: <CampaignIcon /> },
    { text: 'Logout',             icon: <LogoutIcon />, effect: () => setLogoutModalOpen(true) },
  ];

  /** Este bloco renderiza o conteúdo do drawer (menu lateral). */
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {moderatorMenuItems.map(({ text, icon, effect }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => {
                if (effect) {
                  effect();
                } else {
                  setSelectedPage(text as ModeratorPageKey);
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
   * Esta função retorna o componente correto para a área de conteúdo principal,
   * de acordo com a página de moderador selecionada.
   */
  function renderPageContent() {
    switch (selectedPage) {
      case 'Gerenciar Publicações':
        // return <GerenciarPubliPage />;
        return <Typography>Página para moderação de conteúdo publicado.</Typography>;
      case 'Gerenciar Usuários':
        // return <GerenciarUsuariosPage />;
        return <Typography>Página para gerenciamento de usuários.</Typography>;
      case 'Avaliações de usuários':
        // return <AvaliacoesPage />;
        return <Typography>Página com as avaliações dos usuários.</Typography>;
      case 'Configurações':
        // return <ConfiguraçõesPage />;
      default:
        return <Typography>Ops… página desconhecida</Typography>;
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar com indicação de Moderador */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            <Typography variant="h6" noWrap>
              Vira a Página
            </Typography>
            <Typography variant="subtitle2" sx={{ ml: 1, opacity: 0.7 }}>
              (Moderador)
            </Typography>
          </Box>
          <Typography variant="subtitle1">Oi, {user}!</Typography>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navegação de moderador"
      >
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        )}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open
            sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
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
          {selectedPage}
        </Typography>

        {renderPageContent()}
      </Box>

      {/* Modal de Confirmação de Logout (sem alterações) */}
      <Dialog
        open={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você tem certeza que deseja sair da sua conta?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutModalOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              setLogoutModalOpen(false);
              logout();
            }} 
            color="error" 
            autoFocus
          >
            Sair
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModeratorPage;