import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Box,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function AddMember() {
  const [member, setMember] = useState({
    id: 1, // ค่าเริ่มต้น
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    duration: '',
    originalPrice: 0,
    finalPrice: 0,
    points: 0,
    discount: 0,
    startDate: '',
    endDate: '',
  });

  const [usePoints, setUsePoints] = useState(false);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState(''); // ข้อความเตือน

  // รายเดือน (1-12 เดือน)
  const durations = Array.from({ length: 12 }, (_, i) => i + 1);

  // ฟังก์ชันดึง ID สมาชิกล่าสุด
  useEffect(() => {
    axios.get("http://localhost:5000/api/members/latestId")
      .then((response) => {
        setMember((prev) => ({ ...prev, id: response.data.latestId })); // ใช้ ID ที่ได้จาก backend
      })
      .catch((error) => {
        console.error("Error fetching latest member ID:", error);
      });
  }, []);

  const validateForm = () => {
    if (!member.firstName) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    if (!member.lastName) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    if (!member.age || isNaN(member.age) || member.age <= 0) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    if (!member.phone) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    if (!member.email) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    if (!member.duration) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    if (!member.startDate) return 'กรุณากรอกข้อมูลให้ครบถ้วน ! !';
    return ''; // ไม่มีข้อผิดพลาด
  };
  
  const customTheme = createTheme({
    typography: {
      fontFamily: '"Kanit", sans-serif',
    },
  });

  const calculateEndDate = (start, months) => {
    if (!start || !months) return '';
    const startDateObj = new Date(start);
    startDateObj.setMonth(startDateObj.getMonth() + parseInt(months));
    return startDateObj.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'duration') {
      const duration = parseInt(value, 10);
      const originalPrice = duration * 900;
      const points = duration * 10;
      let discount = 0;

      if (usePoints && points >= 100) {
        discount = originalPrice * 0.1;
      }

      const finalPrice = originalPrice - discount;

      setMember((prev) => ({
        ...prev,
        duration,
        originalPrice,
        finalPrice,
        points,
        discount,
        endDate: calculateEndDate(prev.startDate, duration),
      }));
    } else {
      setMember({ ...member, [name]: value });
    }
  };

  // ฟังก์ชันล้างข้อมูลฟอร์ม
  const resetForm = () => {
    setMember(prev => ({
      ...prev, // ใช้ค่าเดิมของ id
      firstName: '',
      lastName: '',
      age: '',
      phone: '',
      email: '',
      duration: '',
      originalPrice: 0,
      points: 0,
      discount: 0,
      startDate: '',
      endDate: '',
    }));
    setUsePoints(false);
    setError(''); // รีเซ็ตข้อความเตือน
  };
  

  const toggleUsePoints = () => {
    const newUsePoints = !usePoints;
    setUsePoints(newUsePoints);

    const discount = newUsePoints ? member.originalPrice * 0.1 : 0;
    const finalPrice = member.originalPrice - discount;

    setMember((prev) => ({
      ...prev,
      discount,
      finalPrice,
    }));
  };

  const handleSubmit = () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg); // แสดงข้อความแจ้งเตือน
      return;
    }
  
    axios.post("http://localhost:5000/api/addmembers", member)
      .then(() => {
        setAlert(true);
        setTimeout(() => setAlert(false), 3000);
  
        // ดึง ID ใหม่จาก Backend หลังจากเพิ่มสำเร็จ
        axios.get("http://localhost:5000/api/members/latestId")
          .then((response) => {
            setMember({
              id: response.data.latestId, // ใช้ ID ใหม่
              firstName: '',
              lastName: '',
              age: '',
              phone: '',
              email: '',
              duration: '',
              originalPrice: 0,
              points: 0,
              discount: 0,
              startDate: '',
              endDate: '',
            });
          });
      })
      .catch((error) => {
        console.error("❌ Error adding member:", error);
      });
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
        <Paper elevation={3} sx={{ p: 3, background: "linear-gradient(to right,rgba(27, 134, 187, 0.8),rgb(30, 135, 188))", borderRadius: "32px" }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              padding: "10px",
              fontWeight: "bold",
              borderRadius: "5px",
              textAlign: "left",
            }}
          >
            เพิ่มผู้ใช้งาน
          </Typography>
          <Paper elevation={3} sx={{ p: 2, background: "rgba(223, 235, 241, 0.5))", borderRadius: "32px" }}>
            {/* แสดงข้อความเตือนถ้ามีข้อผิดพลาด */}
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
      <Grid container spacing={2}>
      <Grid item xs={12} sm={12}>
      <TextField
        name="id"
        label="Member ID"
        value={member.id}
        disabled
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="firstName"
        label="First Name"
        onChange={handleChange}
        value={member.firstName}
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="lastName"
        label="Last Name"
        onChange={handleChange}
        value={member.lastName}
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="age"
        label="Age"
        onChange={handleChange}
        value={member.age}
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="phone"
        label="Phone"
        onChange={handleChange}
        value={member.phone}
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="email"
        label="Email"
        onChange={handleChange}
        value={member.email}
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        select
        name="duration"
        label="Duration (months)"
        value={member.duration}
        onChange={handleChange}
        fullWidth
        margin="normal"
      >
        {durations.map((month) => (
          <MenuItem key={month} value={month}>
            {month} Month{month > 1 ? 's' : ''}
          </MenuItem>
        ))}
      </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="originalPrice"
        label="Original Price"
        value={member.originalPrice}
        disabled
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="points"
        label="Points"
        value={member.points}
        disabled
        fullWidth
        margin="normal"
      />
      {member.points >= 100 && (
        <div>
          <Button
            variant="contained"
            color={usePoints ? 'secondary' : 'primary'}
            onClick={toggleUsePoints}
          >
            {usePoints ? 'Cancel Discount' : 'Use 10% Discount (100 Points)'}
          </Button>
        </div>
      )}
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        name="discount"
        label="Discount Amount"
        value={member.discount}
        disabled
        fullWidth
        margin="normal"
      />
      </Grid>
      <Grid item xs={12} sm={6}>
      <TextField
        label="Start Date"
        type="date"
        value={member.startDate}
        onChange={(e) => {
          const newStartDate = e.target.value;
          setMember((prev) => ({
            ...prev,
            startDate: newStartDate,
            endDate: calculateEndDate(newStartDate, member.duration),
          }));
        }}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      </Grid>
      <Grid item xs={12} sm={12}>
      <TextField
        label="End Date"
        type="text"
        value={member.endDate}
        readOnly
        fullWidth
        disabled
        margin="normal"
      />
      </Grid>
      </Grid>
      <Box sx={{display:"flex" , justifyContent:"center", gap:1, mt:2}}>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
      Save
      </Button>
      <Button onClick={resetForm} variant="contained" sx={{ backgroundColor:"orangered", color:"white" }}>
      Clear
      </Button>
      </Box>
      <Snackbar open={alert} message="Member added successfully!" />
      </Paper>
      </Paper>
    </Container>
    </ThemeProvider>
  );
}

export default AddMember;