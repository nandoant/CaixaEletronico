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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  perfil: 'CLIENTE' | 'ADMIN';
}

const RegisterPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: {
      perfil: 'CLIENTE'
    }
  });
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    setSuccessMessage(null);
    try {
      const response = await registerUser({
        login: data.login,
        email: data.email,
        senha: data.password,
        perfil: data.perfil,
      });
      
      setSuccessMessage(response.message || 'Usuário registrado com sucesso!');
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro';
      setRegisterError(errorMessage);
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
            Criar nova conta
          </Typography>

          {(registerError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerError || error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Nome de usuário"
              autoComplete="username"
              autoFocus
              {...register('login', { required: 'Nome de usuário é obrigatório' })}
              error={!!errors.login}
              helperText={errors.login?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email inválido'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              id="password"
              autoComplete="new-password"
              {...register('password', { 
                required: 'Senha é obrigatória',
                minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar Senha"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword', { 
                required: 'Confirmação de senha é obrigatória',
                validate: value => value === password || 'Senhas não coincidem'
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="perfil-label">Perfil</InputLabel>
              <Select
                labelId="perfil-label"
                id="perfil"
                label="Perfil"
                {...register('perfil', { required: 'Perfil é obrigatório' })}
                error={!!errors.perfil}
                defaultValue="CLIENTE"
              >
                <MenuItem value="CLIENTE">Cliente</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Registrar'}
            </Button>
            
            <Box textAlign="center">
              <Link 
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
              >
                Já tem uma conta? Faça login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
