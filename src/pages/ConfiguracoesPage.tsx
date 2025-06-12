import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useConfig } from '../components/functions/useConfig';

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useConfig();

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="theme-select-label">Tema</InputLabel>
        <Select
          labelId="theme-select-label"
          value={theme}
          label="Tema"
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
        >
          <MenuItem value="light">Claro</MenuItem>
          <MenuItem value="dark">Escuro</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}