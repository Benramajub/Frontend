import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
} from '@mui/material';

function Goods() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [goods, setGoods] = useState([]);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลสมาชิก
    axios.get('http://localhost:5000/api/members').then((response) => {
      setMembers(response.data);
    });

    // ดึงข้อมูลสินค้า
    axios.get('http://localhost:5000/api/goods').then((response) => {
      setGoods(response.data);
    });
  }, []);

  const handleMemberChange = (event) => {
    const memberId = event.target.value;
    const member = members.find((m) => m.id === memberId);
    setSelectedMember(member);
  };

  const handleExchange = (good) => {
    if (selectedMember.points < good.pointsRequired) {
      alert('ไม่พอแต้มในการแลกสินค้า');
      return;
    }

    // หักแต้ม
    const updatedMember = {
      ...selectedMember,
      points: selectedMember.points - good.pointsRequired,
    };

    axios.put(`http://localhost:5000/api/members/${selectedMember.id}`, updatedMember)
      .then(() => {
        setAlert(true);
        setSelectedMember(updatedMember);
      })
      .catch((error) => {
        console.error('Error updating member points:', error);
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        แลกสินค้า
      </Typography>

      <Select
        fullWidth
        value={selectedMember ? selectedMember.id : ''}
        onChange={handleMemberChange}
        displayEmpty
      >
        <MenuItem value="" disabled>
          เลือกสมาชิก
        </MenuItem>
        {members.map((member) => (
          <MenuItem key={member.id} value={member.id}>
            {member.firstName} {member.lastName}
          </MenuItem>
        ))}
      </Select>

      {selectedMember && (
        <div style={{ margin: '20px 0' }}>
          <Typography variant="h6">ข้อมูลสมาชิก:</Typography>
          <Typography>ชื่อ: {selectedMember.firstName} {selectedMember.lastName}</Typography>
          <Typography>แต้มสะสม: {selectedMember.points}</Typography>
        </div>
      )}

      <Typography variant="h6" gutterBottom>
        สินค้าที่สามารถแลกได้
      </Typography>

      <Grid container spacing={2}>
        {goods.map((good) => (
          <Grid item xs={12} sm={6} md={4} key={good.id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{good.name}</Typography>
                <Typography>แต้มที่ต้องใช้: {good.pointsRequired}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleExchange(good)}
                >
                  แลก
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={alert}
        message="แลกสินค้าสำเร็จ"
        autoHideDuration={3000}
        onClose={() => setAlert(false)}
      />
    </Container>
  );
}

export default Goods;