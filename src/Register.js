import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoginIcon from '@mui/icons-material/Login';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme({
    typography: {
      fontFamily: 'Kanit, sans-serif',
    },
});

// TODO remove, this demo shouldn't need to reset the theme.

export default function SignUp() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
   
    const jsonData = {
        Email: data.get('email'),
      Password: data.get('password'),
      fname: data.get('firstName'),
      lname: data.get('lastName'),
    }
    fetch('http://localhost:5000/api/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify(jsonData),
      })
        .then(Response => Response.json())
        .then(data => {

         if( data.status === 'Ok'){
            alert('✅ สมัครสำเร็จ')
            
         }else{
            alert('❌ สมัครไม่สำเร็จ')
         }
        })
        .catch(error => {
         console.log('Error', error);
        }) ;

  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url(/images/gym2.jpg)", // เปลี่ยน path เป็นภาพของคุณ
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex:"-1",
        }}
      >
      <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 2, background: "rgba(223, 235, 241, 0.5))", borderRadius:"32px" }}>
        <CssBaseline />
        <Grid/>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            
            </Grid>
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
                SIGN UP
              </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/Login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>

          </Box>
        </Box>
        </Paper>
      </Container>
      </Box>
    </ThemeProvider>
  );
}