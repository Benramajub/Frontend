import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, TextField, Button, Typography, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function Summary() {
  const [payments, setPayments] = useState([]);
  const [dailyMembers, setDailyMembers] = useState([]);
  const [paymentDailySummary, setPaymentDailySummary] = useState({});
  const [paymentMonthlySummary, setPaymentMonthlySummary] = useState({});
  const [paymentYearlySummary, setPaymentYearlySummary] = useState({});
  const [memberDailySummary, setMemberDailySummary] = useState({});
  const [memberMonthlySummary, setMemberMonthlySummary] = useState({});
  const [memberYearlySummary, setMemberYearlySummary] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPayments, setIsPayments] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/payments')
      .then((response) => {
        setPayments(response.data);
        calculatePaymentSummaries(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payments data:", error);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dailymembers')
      .then((response) => {
        setDailyMembers(response.data);
        calculateMemberSummaries(response.data);
      })
      .catch((error) => {
        console.error("Error fetching daily members data:", error);
      });
  }, []);

  const calculatePaymentSummaries = (payments) => {
    const daily = {};
    const monthly = {};
    const yearly = {};
    
    payments.forEach((payment) => {
      const date = new Date(payment.date);
      const day = date.toLocaleDateString('en-GB'); // แสดงวันที่ในรูปแบบ DD/MM/YYYY
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const year = date.getFullYear();

      if (!daily[day]) daily[day] = 0;
      daily[day] += parseFloat(payment.amount);

      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += parseFloat(payment.amount);

      if (!yearly[year]) yearly[year] = 0;
      yearly[year] += parseFloat(payment.amount);
    });

    setPaymentDailySummary(daily);
    setPaymentMonthlySummary(monthly);
    setPaymentYearlySummary(yearly);
  };

  const customTheme = createTheme({
          typography: {
            fontFamily: '"Kanit", sans-serif',
          },
        });

  const calculateMemberSummaries = (dailyMembers) => {
    const daily = {};
    const monthly = {};
    const yearly = {};
    
    dailyMembers.forEach((member) => {
      const date = new Date(member.date);
      const day = date.toLocaleDateString('en-GB'); // แสดงวันที่ในรูปแบบ DD/MM/YYYY
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const year = date.getFullYear();

      if (!daily[day]) daily[day] = 0;
      daily[day] += parseFloat(member.amount);

      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += parseFloat(member.amount);

      if (!yearly[year]) yearly[year] = 0;
      yearly[year] += parseFloat(member.amount);
    });

    setMemberDailySummary(daily);
    setMemberMonthlySummary(monthly);
    setMemberYearlySummary(yearly);
  };

  const clearDateSelection = () => {
    setStartDate('');
    setEndDate('');
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
          <Typography variant="h5" sx={{ color: "white", padding: "10px", fontWeight: "bold", borderRadius: "5px", textAlign: "left" }}>
            สรุปยอด
          </Typography>

          <Paper elevation={3} sx={{ p: 2, background: "rgba(223, 235, 241, 0.5))", borderRadius: "32px" }}>
            <Button variant="contained" onClick={() => setIsPayments(true)} style={{ marginRight: '10px' }}>
            สรุปยอดสมาชิกรายเดือน
            </Button>
            <Button variant="contained" onClick={() => setIsPayments(false)} color="secondary">
            สรุปยอดสมาชิกรายวัน
            </Button>

        

            {isPayments ? (
              <>
                <h3>สรุปยอดรายวัน (สมาชิกรายเดือน)</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(paymentDailySummary).map(([date, totalAmount]) => (
                        <TableRow key={date}>
                          <TableCell>{date}</TableCell>
                          <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />

                <h3>สรุปยอดรายเดือน (สมาชิกรายเดือน)</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(paymentMonthlySummary).map(([month, totalAmount]) => (
                        <TableRow key={month}>
                          <TableCell>{month}</TableCell>
                          <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />

                <h3>สรุปยอดรายปี (สมาชิกรายเดือน)</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(paymentYearlySummary).map(([year, totalAmount]) => (
                        <TableRow key={year}>
                          <TableCell>{year}</TableCell>
                          <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />

                <h3>รายละเอียดสมาชิกรายเดือนทั้งหมด</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment ID</TableCell>
                        <TableCell>Member ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.id ? String(item.id).slice(-1).padStart(4, '0') : '-'}</TableCell>
                          <TableCell>{item.memberId || '-'}</TableCell>
                          <TableCell>{(parseFloat(item.amount) || 0).toFixed(2)}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString('en-GB')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />
              </>
            ) : (
              <>
                <h3>สรุปยอดรายวัน (สมาชิกรายวัน)</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(memberDailySummary).map(([date, totalAmount]) => (
                        <TableRow key={date}>
                          <TableCell>{date}</TableCell>
                          <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />

                <h3>สรุปยอดรายเดือน (สมาชิกรายวัน)</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(memberMonthlySummary).map(([month, totalAmount]) => (
                        <TableRow key={month}>
                          <TableCell>{month}</TableCell>
                          <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />

                <h3>สรุปยอดรายปี (สมาชิกรายวัน)</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(memberYearlySummary).map(([year, totalAmount]) => (
                        <TableRow key={year}>
                          <TableCell>{year}</TableCell>
                          <TableCell>{(parseFloat(totalAmount) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />

                <h3>รายละเอียดสมาชิกรายวันทั้งหมด</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ border: "2px solid gray" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailyMembers.map((item, index) => (
                        <TableRow key={index}>

                          <TableCell>{item.name || '-'}</TableCell>
                          <TableCell>{(parseFloat(item.amount) || 0).toFixed(2)}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString('en-GB')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default Summary;