import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

// URL ของรูปภาพพื้นหลัง
const backgroundImage = 'https://images.unsplash.com/photo-1517841905240-4729888e0b1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&q=80&w=1080';

const styles = {
  background: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    padding: '20px',
    color: '#fff', // เปลี่ยนสีข้อความให้เข้ากับพื้นหลัง
  },
  card: {
    borderRadius: '8px',
    transition: '0.3s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
};

function Home() {
  const [members, setMembers] = useState([]);
  const [goods, setGoods] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลสมาชิก
    axios.get('http://localhost:5000/api/members').then((response) => {
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
    <Container style={styles.background}>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
        ยินดีต้อนรับสู่ระบบแลกสินค้า
      </Typography>

      <Typography variant="h5" gutterBottom style={{ textAlign: 'center' }}>
        ข้อมูลสมาชิก
      </Typography>
      <Grid container spacing={2}>
        {members.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <Card elevation={3} style={styles.card}>
              <CardContent>
                <Typography variant="h6">{member.firstName} {member.lastName}</Typography>
                <Typography>โทรศัพท์: {member.phone}</Typography>
                <Typography>แต้มสะสม: {member.points}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handleOpenDialog(member)}>
                  ดูข้อมูลสมาชิก
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom style={{ textAlign: 'center', color: '#3f51b5', marginTop: '20px' }}>
        สินค้าที่สามารถแลกได้
      </Typography>
      <Grid container spacing={2}>
        {goods.map((good) => (
          <Grid item xs={12} sm={6} md={4} key={good.id}>
            <Card elevation={3} style={{ borderRadius: '8px', transition: '0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <CardContent>
                <Typography variant="h6">{good.name}</Typography>
                <Typography>แต้มที่ต้องใช้: {good.pointsRequired}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  แลก
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog สำหรับแสดงข้อมูลสมาชิก */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>ข้อมูลสมาชิก</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box>
              <Typography variant="h6">{selectedMember.firstName} {selectedMember.lastName}</Typography>
              <Typography>โทรศัพท์: {selectedMember.phone}</Typography>
              <Typography>อีเมล: {selectedMember.email}</Typography>
              <Typography>แต้มสะสม: {selectedMember.points}</Typography>
              <Typography>ระยะเวลา: {selectedMember.duration} เดือน</Typography>
              <Typography>วันที่เริ่มต้น: {new Date(selectedMember.startDate).toLocaleDateString()}</Typography>
              <Typography>วันที่สิ้นสุด: {new Date(selectedMember.endDate).toLocaleDateString()}</Typography>
              <Typography>สถานะ: {selectedMember.status}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h5" gutterBottom style={{ textAlign: 'center', marginTop: '20px' }}>
        คำแนะนำเกี่ยวกับฟิตเนส
      </Typography>
      <Box style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '8px' }}>
        <Typography>
          <FitnessCenterIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          1. ออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์เพื่อสุขภาพที่ดี
        </Typography>
        <Typography>
          <FitnessCenterIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          2. รับประทานอาหารที่มีประโยชน์และหลากหลาย
        </Typography>
        <Typography>
          <FitnessCenterIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          3. ดื่มน้ำให้เพียงพอในแต่ละวัน
        </Typography>
        <Typography>
          <FitnessCenterIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          4. นอนหลับให้เพียงพอเพื่อฟื้นฟูร่างกาย
        </Typography>
        <Typography>
          <FitnessCenterIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          5. หลีกเลี่ยงการนั่งนาน ๆ และเคลื่อนไหวบ่อย ๆ
        </Typography>
      </Box>
    </Container>
  );
}

export default Home;