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
  Typography,
  Paper,
  DialogContentText,
  DialogActions,
  Alert,
  Box,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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

  const customTheme = createTheme({
        typography: {
          fontFamily: '"Kanit", sans-serif',
        },
      });

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
        await axios.post('http://localhost:5000/api/payments', {
          memberId: payment.memberId,
          amount: payment.amount,
          date: payment.date
        });

      } else if (paymentType === 'payment2') {
        // 📌 **API ชำระเงินของ Payment2 และสร้างรหัส**
        const response = await axios.post('http://localhost:5000/api/dailymembers', {
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
    <Paper elevation={3} sx={{ p: 3, background:"linear-gradient(to right,rgba(27, 134, 187, 0.8),rgb(30, 135, 188))", borderRadius: "32px"}}>
        <Typography
          variant="h5"
          sx={{
            color: "white",
            padding: "10px",
            fontWeight: "bold",
            borderRadius: "5px",
            textAlign: "left",
          }}
        >บันทึกชำระเงิน
        </Typography>
      <Paper elevation={3} sx={{ p: 2, background: "rgba(223, 235, 241, 0.5))", borderRadius:"32px" }}>
      <FormControl fullWidth margin="normal">
        <InputLabel>ประเภทการชำระเงิน</InputLabel>
        <Select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <MenuItem value="payment1">สมาชิกรายเดือน</MenuItem>
          <MenuItem value="payment2">สมาชิกรายวัน</MenuItem>
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
          <TextField name="amount" label="Amount" fullWidth margin="normal" value={payment.amount} InputProps={{ readOnly: true }} disabled />
        </>
      ) : (
        <>
          <TextField name="name" label="Username" fullWidth margin="normal" value={payment.name} onChange={handleChange} />
          <TextField name="amount" label="Amount" fullWidth margin="normal" value="100" InputProps={{ readOnly: true }} disabled />
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
    </Paper>
    </Paper>
    </Container>
    </ThemeProvider>
  );
}

export default Payment;