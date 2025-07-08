import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          pt: 8, // Para compensar a altura da navbar
          pl: { sm: '240px' }, // Para compensar a largura da sidebar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
