import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, TextField, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// ลงทะเบียน chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function PaymentSummary() {
  const [payments, setPayments] = useState([]);
  const [dailyMembers, setDailyMembers] = useState([]); // ✅ ข้อมูลจาก /api/dailymembers
  const [dailySummary, setDailySummary] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0); // ✅ ตัวแปรสรุปยอดรวมทั้งหมด

  // ดึงข้อมูลจาก API
  useEffect(() => {
    // ดึงข้อมูล payment
    axios.get(`${NEXT_PUBLIC_API_URL}/api/payments`)
      .then((response) => {
        setPayments(response.data);
        calculateDailySummary(response.data, dailyMembers);
      })
      .catch((error) => {
        console.error("Error fetching payments data:", error);
      });

    // ดึงข้อมูลจาก /api/dailymembers
    axios.get(`${NEXT_PUBLIC_API_URL}/api/dailymembers`)
      .then((response) => {
        setDailyMembers(response.data);
        calculateDailySummary(payments, response.data);
      })
      .catch((error) => {
        console.error("Error fetching daily members data:", error);
      });
  }, []);

  // คำนวณยอดรวมรายวัน
  const calculateDailySummary = (payments, dailyMembers) => {
    let summary = {};
    let total = 0; // ✅ ตัวแปรสำหรับเก็บยอดรวมทั้งหมด

    // รวม payment ปกติ
    payments.forEach((payment) => {
      const date = new Date(payment.date).toLocaleDateString();
      if (!summary[date]) summary[date] = 0;
      summary[date] += parseFloat(payment.amount);
      total += parseFloat(payment.amount);
    });

    // รวม amount จาก /api/dailymembers
    dailyMembers.forEach((member) => {
      const date = new Date(member.date).toLocaleDateString();
      if (!summary[date]) summary[date] = 0;
      summary[date] += parseFloat(member.amount);
      total += parseFloat(member.amount);
    });

    setDailySummary(summary);
    setTotalAmount(total); // ✅ อัปเดตยอดรวมทั้งหมด
  };

  // ฟังก์ชันกรองข้อมูลตามวันที่ที่เลือก
  const filterPaymentsByDate = () => {
    if (!startDate || !endDate) return payments.concat(dailyMembers);

    return payments.concat(dailyMembers).filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });
  };

  // คำนวณยอดรวมใหม่หลังจากกรองวันที่
  useEffect(() => {
    const filteredData = filterPaymentsByDate();
    calculateDailySummary(filteredData, filteredData);
  }, [startDate, endDate, payments, dailyMembers]);

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
            {filterPaymentsByDate().map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.id ? String(item.id).slice(-1).padStart(4, '0') : '-'}</TableCell>
                <TableCell>{item.memberId || '-'}</TableCell>
                <TableCell>{(parseFloat(item.amount) || 0).toFixed(2)}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* ✅ แสดงยอดรวมด้านล่างตาราง */}
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right' }}>Total:</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PaymentSummary;
