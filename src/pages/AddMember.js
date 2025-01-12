import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Snackbar,
} from '@mui/material';

function AddMember() {
  const [member, setMember] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    duration: '',
    originalPrice: 0, // ราคาเต็มก่อนลด
    finalPrice: 0, // ราคาหลังลด
    points: 0,
    discount: 0,
    startDate: '',
    endDate: '',
  });
  const [usePoints, setUsePoints] = useState(false); // ใช้แต้มส่วนลดหรือไม่
  const [alert, setAlert] = useState(false);

  // รายเดือน (1-12 เดือน)
  const durations = Array.from({ length: 12 }, (_, i) => i + 1);

  // ฟังก์ชันคำนวณวันหมดอายุ
  const calculateEndDate = (start, months) => {
    if (!start || !months) return '';
    const startDateObj = new Date(start);
    startDateObj.setMonth(startDateObj.getMonth() + parseInt(months));
    return startDateObj.toISOString().split('T')[0]; // คืนค่าในรูปแบบ YYYY-MM-DD
  };

  // ฟังก์ชันสำหรับการเปลี่ยนค่า
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'duration') {
      const duration = parseInt(value, 10);
      const originalPrice = duration * 900; // ราคาเต็ม 900 บาทต่อเดือน
      const points = duration * 10; // แต้ม 10 ต่อเดือน

      let discount = 0;
      if (usePoints && points >= 100) {
        discount = originalPrice * 0.1; // ส่วนลด 10%
      }

      const finalPrice = originalPrice - discount;

      setMember((prev) => ({
        ...prev,
        duration,
        originalPrice,
        finalPrice,
        points,
        discount,
        endDate: calculateEndDate(prev.startDate, duration), // คำนวณ End Date
      }));
    } else {
      setMember({ ...member, [name]: value });
    }
  };

  // ฟังก์ชันเมื่อเลือก/ยกเลิกการใช้แต้มส่วนลด
  const toggleUsePoints = () => {
    const newUsePoints = !usePoints;
    setUsePoints(newUsePoints);

    const discount = newUsePoints ? member.originalPrice * 0.1 : 0; // คำนวณส่วนลด
    const finalPrice = member.originalPrice - discount;

    setMember((prev) => ({
      ...prev,
      discount,
      finalPrice,
    }));
  };

  // ฟังก์ชันส่งข้อมูล
  const handleSubmit = () => {
    const remainingPoints = member.points - (usePoints ? 100 : 0); // หักแต้มถ้าใช้ส่วนลด

    axios.post('http://localhost:5000/api/members', {
      ...member,
      points: remainingPoints,
    }).then(() => {
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
      setMember({
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
      setUsePoints(false);
    });
  };

  return (
    <Container>
      <h2>Add Member</h2>
      <TextField
        name="firstName"
        label="First Name"
        onChange={handleChange}
        value={member.firstName}
        fullWidth
        margin="normal"
      />
      <TextField
        name="lastName"
        label="Last Name"
        onChange={handleChange}
        value={member.lastName}
        fullWidth
        margin="normal"
      />
      <TextField
        name="age"
        label="Age"
        onChange={handleChange}
        value={member.age}
        fullWidth
        margin="normal"
      />
      <TextField
        name="phone"
        label="Phone"
        onChange={handleChange}
        value={member.phone}
        fullWidth
        margin="normal"
      />
      <TextField
        name="email"
        label="Email"
        onChange={handleChange}
        value={member.email}
        fullWidth
        margin="normal"
      />
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
      <TextField
        name="originalPrice"
        label="Original Price"
        value={member.originalPrice}
        disabled
        fullWidth
        margin="normal"
      />
      <TextField
        name="finalPrice"
        label="Final Price"
        value={member.finalPrice}
        disabled
        fullWidth
        margin="normal"
      />
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
      <TextField
        name="discount"
        label="Discount Amount"
        value={member.discount}
        disabled
        fullWidth
        margin="normal"
      />
      <TextField
        label="Start Date"
        type="date"
        value={member.startDate}
        onChange={(e) => {
          const newStartDate = e.target.value;
          setMember((prev) => ({
            ...prev,
            startDate: newStartDate,
            endDate: calculateEndDate(newStartDate, member.duration), // คำนวณ End Date
          }));
        }}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="End Date"
        type="text"
        value={member.endDate}
        readOnly
        fullWidth
        margin="normal"
      />

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Save
      </Button>
      <Snackbar open={alert} message="Member added successfully!" />
    </Container>
  );
}

export default AddMember;
