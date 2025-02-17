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
  const [paymentType, setPaymentType] = useState('payment1');
  const [payment, setPayment] = useState({
    memberId: '',
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // ล็อกวันที่ปัจจุบัน
  });
  const [members, setMembers] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/members').then((response) => {
      setMembers(response.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (paymentType === 'payment1' && name === 'memberId') {
      const selectedMember = members.find((member) => member.id === value);
      setPayment({
        ...payment,
        memberId: value,
        amount: selectedMember ? selectedMember.originalPrice : '',
      });
    } else if (paymentType === 'payment2' && name === 'name') {
      setPayment({ ...payment, name: value, amount: '100' }); // Payment2 ใช้ราคา 100 บาท
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const handleDialogOpen = () => {
    if ((paymentType === 'payment1' && (!payment.memberId || !payment.amount)) ||
        (paymentType === 'payment2' && !payment.name)) {
      setAlert({ open: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วน!', severity: 'error' });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmPayment = async () => {
    try {
      setIsDialogOpen(false);
      let successMessage = 'ชำระเงินเรียบร้อย!';
      
      if (paymentType === 'payment1') {
        // 📌 **API ชำระเงินของ Payment1**
        await axios.post(`${NEXT_PUBLIC_API_URL}/api/payments`, {
          memberId: payment.memberId,
          amount: payment.amount,
          date: payment.date
        });

      } else if (paymentType === 'payment2') {
        // 📌 **API ชำระเงินของ Payment2 และสร้างรหัส**
        const response = await axios.post(`${NEXT_PUBLIC_API_URL}/api/dailymembers`, {
          name: payment.name
        });

        successMessage += ` รหัสปลดล็อกของคุณ: ${response.data.code}`;
        setGeneratedCode(response.data.code);
      }

      setAlert({ open: true, message: successMessage, severity: 'success' });

      setPayment({
        memberId: '',
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
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
        <InputLabel>ประเภทการชำระเงิน</InputLabel>
        <Select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <MenuItem value="payment1">Payment 1 (ระบบเดิม)</MenuItem>
          <MenuItem value="payment2">Payment 2 (ปลดล็อกประตู)</MenuItem>
        </Select>
      </FormControl>

      {paymentType === 'payment1' ? (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel>Member ID</InputLabel>
            <Select name="memberId" value={payment.memberId} onChange={handleChange}>
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {`${member.id} - ${member.firstName} ${member.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField name="amount" label="Amount" fullWidth margin="normal" value={payment.amount} InputProps={{ readOnly: true }} />
        </>
      ) : (
        <>
          <TextField name="name" label="ชื่อผู้ใช้" fullWidth margin="normal" value={payment.name} onChange={handleChange} />
          <TextField name="amount" label="Amount" fullWidth margin="normal" value="100" InputProps={{ readOnly: true }} />
        </>
      )}

      <TextField name="date" label="Date" type="date" fullWidth margin="normal" value={payment.date} InputProps={{ readOnly: true }} />

      <Button variant="contained" color="primary" onClick={handleDialogOpen}>
        {paymentType === 'payment1' ? 'Process Payment' : 'Generate Unlock Code & Pay'}
      </Button>

      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>ยืนยันการชำระเงิน</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {paymentType === 'payment1'
              ? 'คุณต้องการยืนยันการชำระเงินนี้ใช่หรือไม่?'
              : 'คุณต้องการสร้างรหัสปลดล็อกและยืนยันการชำระเงินนี้ใช่หรือไม่?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">ยกเลิก</Button>
          <Button onClick={handleConfirmPayment} color="primary" variant="contained">ยืนยัน</Button>
        </DialogActions>
      </Dialog>

      {generatedCode && paymentType === 'payment2' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          รหัสปลดล็อกของคุณ: <strong>{generatedCode}</strong> (ใช้ได้ 2 ครั้ง)
        </Alert>
      )}

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
