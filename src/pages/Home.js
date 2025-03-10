import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogContent  from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CardActions from '@mui/material/CardActions';  
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material/styles';  
import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const customTheme = createTheme({
  typography: {
    fontFamily: '"Kanit", sans-serif',
  },
});

function Home() {
  const [members, setMembers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/members').then((response) => {
      console.log(response.data);
      setMembers(response.data);
    });
  }, []);

  const handleOpenDialog = (member) => {
    setSelectedMember(member);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMember(null);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url(/images/gym4.jpg) no-repeat center center fixed',
          backgroundSize: 'cover',
          zIndex: -1,
        }}
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3}
          sx={{
            p: 5,
            background: 'linear-gradient(to right,rgba(25, 116, 162, 0.8),rgb(30, 135, 188))',
            borderRadius: '32px',
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{ textAlign: 'center', color: 'white', fontWeight: 'bold', mb: 3 }}
          >
            ยินดีต้อนรับเข้าสู่ระบบจัดการสมาชิกฟิตเนส
          </Typography>
          <br />
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: 'center', color: 'white', fontWeight: 'bold', mb: 3 }}
          >
            ข้อมูลสมาชิก
          </Typography>
          <Grid container spacing={2}>
            {members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.5)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">
                      {member.firstName} {member.lastName}
                    </Typography>
                    <Typography>โทรศัพท์ : {member.phone}</Typography>
                    <Typography>อีเมลล์ : {member.email}</Typography>
                    <Typography>แต้มสะสม : {member.points}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      sx={{
                        backgroundColor: 'rgb(28, 118, 69)',
                        color: '#fff',
                      }}
                      onClick={() => handleOpenDialog(member)}
                    >
                      ดูข้อมูลสมาชิก
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Dialog สำหรับแสดงข้อมูลสมาชิก */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            scroll="paper"
            PaperProps={{
              sx: { width: '420px', maxWidth: '75vw', borderRadius: '16px' },
            }}
          >
            <DialogTitle sx={{ fontSize: '24px', fontWeight: 'bold' }}>
              ข้อมูลสมาชิก
            </DialogTitle>
            <DialogContent>
              {selectedMember && (
                <Box
                  sx={{
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography>ชื่อ : {`${selectedMember.firstName} ${selectedMember.lastName}`}</Typography>
                  <Typography>โทรศัพท์ : {selectedMember.phone}</Typography>
                  <Typography>อีเมล : {selectedMember.email}</Typography>
                  <Typography>แต้มสะสม : {selectedMember.points}</Typography>
                  <Typography>ระยะเวลา : {selectedMember.duration} เดือน</Typography>
                  <Typography>
                    วันที่เริ่มต้น :{' '}
                    {new Date(selectedMember.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    วันที่สิ้นสุด :{' '}
                    {new Date(selectedMember.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                ปิด
              </Button>
            </DialogActions>
          </Dialog>
          <br />
          <br />
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: 'white',
              textAlign: 'center',
              mt: 4,
              fontWeight: 'bold',
            }}
          >
            คำแนะนำเกี่ยวกับการออกกำลังกาย
          </Typography>
          <Box
            sx={{
              backgroundColor: 'rgb(255, 255, 255)',
              p: 2,
              borderRadius: '12px',
            }}
          >
            <Typography fontSize="18px">
              <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              1. ออกกำลังกายอย่างน้อย 150 นาที/สัปดาห์ เพื่อสุขภาพที่ดี
            </Typography>
            <Typography fontSize="18px">
              <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              2. รับประทานอาหารที่มีประโยชน์และหลากหลาย
            </Typography>
            <Typography fontSize="18px">
              <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              3. ดื่มน้ำให้เพียงพอในแต่ละวัน
            </Typography>
            <Typography fontSize="18px">
              <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              4. นอนหลับให้เพียงพอเพื่อฟื้นฟูร่างกาย
            </Typography>
            <Typography fontSize="18px">
              <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              5. หลีกเลี่ยงการนั่งนาน ๆ และเคลื่อนไหวบ่อย ๆ
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default Home;