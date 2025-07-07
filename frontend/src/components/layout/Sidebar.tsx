import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  SwapHoriz,
  Receipt,
  AccountBalance,
  Schedule,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface MenuItemType {
  text: string;
  icon: React.ReactElement;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Operações', icon: <SwapHoriz />, path: '/operacoes' },
  { text: 'Extrato', icon: <Receipt />, path: '/extrato' },
  { text: 'Saldo', icon: <AccountBalance />, path: '/saldo' },
  { text: 'Agendamentos', icon: <Schedule />, path: '/agendamentos' },
  { text: 'Administração', icon: <AdminPanelSettings />, path: '/admin', adminOnly: true },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.perfil === 'ADMIN'
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box' 
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
