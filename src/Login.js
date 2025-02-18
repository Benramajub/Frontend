import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

export default function SignInSide() {

const defaultTheme = createTheme({
    typography: {
      fontFamily: 'Kanit, sans-serif',
    },
});

const navigate = useNavigate();

const handleSubmit = (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const jsonData = {
    Email: data.get('email'),
    Password: data.get('password'),
  };

  fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonData),
  })
    .then(response => response.json())
    .then((data) => {
      if (data.status === 'Ok') {
        alert('✅ เข้าสู่ระบบสำเร็จ');
        localStorage.setItem('token', data.token);
        navigate('/home'); // ✅ ใช้ React Router
      } else {
        alert('❌ รหัสผ่าน หรือ Email ไม่ถูกต้อง ! !');
      }
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      alert('🚨 Login failed. Please try again.');
    });
};

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              'url(/images/login.png)',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'left',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
            ลงชื่อเข้าใช้งาน
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                  transition: 'background-color 0.3s, transform 0.2s',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                LOGIN
              </Button>
             
              <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/Register" variant="body2">
                  Dont't have an account? Sig Up
                </Link>
              </Grid>
            </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}