import React, { useState, useEffect } from 'react';
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
    <Container>
      <h2>Add Member</h2>

      <TextField
        name="id"
        label="Member ID"
        value={member.id}
        disabled
        fullWidth
        margin="normal"
      />
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
            endDate: calculateEndDate(newStartDate, member.duration),
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
