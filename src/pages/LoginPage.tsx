import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { parseApiError } from '@/utils/api-error';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { setSession } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { accessToken, user } = await login(values);
      setSession(accessToken, user);
      navigate(from, { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 429) {
        enqueueSnackbar(parsed.message, { variant: 'warning' });
      } else {
        // generic message to avoid user enumeration
        setError('root', { message: 'Invalid email or password. Please try again.' });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '50%',
                p: 1.5,
                mb: 1.5,
                display: 'flex',
              }}
            >
              <LockOutlinedIcon sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Admin Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
              <Box
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  mb: 2,
                  fontSize: 14,
                }}
                role="alert"
                aria-live="polite"
              >
                {errors.root.message}
              </Box>
            )}

            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
              inputProps={{ 'aria-label': 'Email Address' }}
            />

            <TextField
              {...register('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              fullWidth
              required
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      size="small"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
