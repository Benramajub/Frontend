import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Container,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';

function Payment() {
  const [payment, setPayment] = useState({
    memberId: '',
    amount: '',
    date: '',
  });
  const [members, setMembers] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ดึงข้อมูล Member จาก API
  useEffect(() => {
    axios.get('http://localhost:5000/api/members').then((response) => {
      setMembers(response.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // กรณีเลือก Member ID
    if (name === 'memberId') {
      const selectedMember = members.find((member) => member.id === value);

      // อัปเดต Amount อัตโนมัติจาก Member
      setPayment({
        ...payment,
        memberId: value,
        amount: selectedMember ? selectedMember.originalPrice : '', // ค่า defaultAmount จาก API
      });
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const handleDialogOpen = () => {
    // ตรวจสอบข้อมูลการชำระเงิน
    if (!payment.memberId || !payment.amount || !payment.date) {
      setAlert({ open: true, message: 'กรุณากรอกข้อมูลการชำระเงินให้ครบถ้วน!', severity: 'error' });
      return;
    }
    setIsDialogOpen(true); // เปิดหน้าต่างยืนยัน
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false); // ปิดหน้าต่างยืนยัน
  };

  const handleConfirmPayment = async () => {
    try {
      // ปิด Dialog
      setIsDialogOpen(false);

      // ส่งข้อมูลการชำระเงิน
      await axios.post('http://localhost:5000/api/payments', payment);

      // แจ้งเตือนสำเร็จ
      setAlert({ open: true, message: 'ชำระเงินเรียบร้อยแล้ว!', severity: 'success' });

      // อัปเดตข้อมูลสมาชิกใหม่ใน MemberList
      const response = await axios.get('http://localhost:5000/api/members');
      setMembers(response.data);

      // รีเซ็ตข้อมูลการชำระเงิน
      setPayment({
        memberId: '',
        amount: '',
        date: '',
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setAlert({ open: true, message: 'เกิดข้อผิดพลาดในการชำระเงิน!', severity: 'error' });
    }
  };

  return (
    <Container>
      <h2>Payment</h2>
      <FormControl fullWidth margin="normal">
        <InputLabel>Member ID</InputLabel>
        <Select
          name="memberId"
          value={payment.memberId}
          onChange={handleChange}
        >
          {members.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              {`${member.id} - ${member.firstName} ${member.lastName}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        name="amount"
        label="Amount"
        fullWidth
        margin="normal"
        value={payment.amount}
        InputProps={{
          readOnly: true, // ทำให้ Amount เป็นช่องที่อ่านได้อย่างเดียว
        }}
      />
      <TextField
        name="date"
        label="Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        onChange={handleChange}
        fullWidth
        margin="normal"
        value={payment.date}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpen} // เปิดหน้าต่างยืนยัน
      >
        Process Payment
      </Button>

      {/* Dialog สำหรับยืนยันการชำระเงิน */}
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">ยืนยันการชำระเงิน</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            คุณต้องการยืนยันการชำระเงินนี้ใช่หรือไม่?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            ยกเลิก
          </Button>
          <Button onClick={handleConfirmPayment} color="primary" variant="contained">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar แจ้งเตือน */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Payment;
