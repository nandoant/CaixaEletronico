import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SaldoPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Saldo
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Saldo Atual
        </Typography>
        <Typography variant="h3" color="primary">
          R$ 0,00
        </Typography>
      </Paper>
    </Box>
  );
};

export default SaldoPage;
