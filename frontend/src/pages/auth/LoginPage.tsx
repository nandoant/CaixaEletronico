import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  login: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await login({
        login: data.login,
        senha: data.password,
      });
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      setLoginError(errorMessage);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Caixa Eletrônico
          </Typography>
          
          <Typography component="h2" variant="h6" align="center" gutterBottom>
            Entrar na sua conta
          </Typography>

          {(loginError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError || error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Login"
              autoComplete="username"
              autoFocus
              {...register('login', { required: 'Login é obrigatório' })}
              error={!!errors.login}
              helperText={errors.login?.message}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password', { required: 'Senha é obrigatória' })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
            
            <Box textAlign="center">
              <Link 
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
              >
                Não tem uma conta? Registre-se
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
