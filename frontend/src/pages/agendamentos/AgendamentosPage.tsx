import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AgendamentosPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Agendamentos
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pagamentos Agendados
        </Typography>
        <Typography variant="body2">
          Nenhum agendamento encontrado.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AgendamentosPage;
