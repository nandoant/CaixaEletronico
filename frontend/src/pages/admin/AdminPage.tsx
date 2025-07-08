import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Administração
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Painel Administrativo
        </Typography>
        <Typography variant="body2">
          Área restrita para administradores.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminPage;
