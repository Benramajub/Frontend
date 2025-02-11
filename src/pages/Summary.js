import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, TextField, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// ลงทะเบียน chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function PaymentSummary() {
  const [payments, setPayments] = useState([]);
  const [dailySummary, setDailySummary] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ดึงข้อมูลจาก API
  useEffect(() => {
    axios.get('http://localhost:5000/api/payments')
      .then((response) => {
        setPayments(response.data);
        calculateDailySummary(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payments data:", error);
      });
  }, []);

  // คำนวณยอดรวมรายวัน
  const calculateDailySummary = (payments) => {
    let summary = {};

    payments.forEach((payment) => {
      const date = new Date(payment.date).toLocaleDateString(); // ทำให้วันที่เป็นรูปแบบที่สามารถใช้เป็น key ได้

      if (!summary[date]) {
        summary[date] = 0;
      }

      summary[date] += parseFloat(payment.amount); // รวมยอด
    });

    setDailySummary(summary);
  };

  // ฟังก์ชันกรองข้อมูลตามวันที่ที่เลือก
  const filterPaymentsByDate = () => {
    if (!startDate || !endDate) return payments;

    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
    });

    return filteredPayments;
  };

  // คำนวณยอดรวมใหม่หลังจากกรองวันที่
  useEffect(() => {
    const filteredPayments = filterPaymentsByDate();
    calculateDailySummary(filteredPayments);
  }, [startDate, endDate, payments]);

  // การเตรียมข้อมูลกราฟ
  const chartData = {
    labels: Object.keys(dailySummary),
    datasets: [
      {
        label: 'Total Amount (Daily)',
        data: Object.values(dailySummary),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  // ฟังก์ชันเคลียร์การเลือกวัน
  const clearDateSelection = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <Container>
      <h2>Payment Summary</h2>

      {/* ฟอร์มเลือกวันที่ */}
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="outlined" onClick={clearDateSelection} style={{ marginLeft: '10px' }}>
          Clear Date Selection
        </Button>
      </div>

      {/* กราฟรายวัน */}
      <div style={{ marginBottom: '30px' }}>
        <Line data={chartData} />
      </div>
      
      {/* ตารางแสดงข้อมูลยอดรวมรายวัน */}
      <TableContainer component={Paper} style={{ marginBottom: '30px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {Object.entries(dailySummary).map(([date, totalAmount]) => (
    <TableRow key={date}>
      <TableCell>{date}</TableCell>
      <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
    </TableRow>
  ))}
</TableBody>

        </Table>
      </TableContainer>

      {/* ตารางแสดงข้อมูล Payment */}
      <h3>Payment Details</h3>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment ID</TableCell>
              <TableCell>Member ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {filterPaymentsByDate().map((payment) => (
    <TableRow key={payment.id}>
      <TableCell>{String(payment.id).slice(-4).padStart(4, '0')}</TableCell>
      <TableCell>{payment.memberId}</TableCell>
      <TableCell>{(parseFloat(payment.amount) || 0).toFixed(2)}</TableCell>
      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PaymentSummary;
