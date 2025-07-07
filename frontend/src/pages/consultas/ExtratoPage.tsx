import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ExtratoPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Extrato
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Histórico de Operações
        </Typography>
        <Typography variant="body2">
          Nenhuma operação encontrada.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ExtratoPage;
