import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Container,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // TODO: Implementar registro
      console.log('Dados de registro:', data);
      // await authService.register(data);
      navigate('/login');
    } catch (error) {
      console.error('Erro no registro:', error);
      // TODO: Mostrar mensagem de erro para o usuário
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
              {...register('email', { required: 'Email é obrigatório' })}
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrar
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
