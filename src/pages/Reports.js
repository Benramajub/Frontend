import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// ลงทะเบียนสเกลที่จำเป็น
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function Reports() {
  const [scanLogs, setScanLogs] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("scanLogs");

  useEffect(() => {
    const fetchScanLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/fingerreports");
        setScanLogs(response.data);
      } catch (error) {
        console.error("Error fetching scan logs:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDailyReports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/daily-reports");
        const formattedData = response.data.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp).toLocaleDateString("th-TH") // แสดงเฉพาะวัน/เดือน/ปี
        }));
        setDailyReports(formattedData);
      } catch (error) {
        console.error("Error fetching daily reports:", error);
      }
    };
    

    fetchScanLogs();
    fetchDailyReports();
  }, []);

  const customTheme = createTheme({
    typography: {
      fontFamily: '"Kanit", sans-serif',
    },
  });

  const scanLogsColumns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "memberId", headerName: "Member ID", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "scanTime", headerName: "Date", width: 200 },
  ];

  const dailyReportsColumns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "code", headerName: "Code", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "timestamp", headerName: "Date", width: 200 },
  ];

  const prepareChartData = (data) => {
    const dailyCounts = {};
    
    data.forEach(item => {
      const date = new Date(item.scanTime || item.timestamp);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      if (!dailyCounts[formattedDate]) {
        dailyCounts[formattedDate] = 0;
      }
      dailyCounts[formattedDate] += 1; // นับจำนวนคนเข้าใช้
    });

    const labels = Object.keys(dailyCounts);
    const counts = Object.values(dailyCounts);

    return {
      labels: labels,
      datasets: [
        {
          label: 'จำนวนคนเข้าใช้',
          data: counts,
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        },
      ],
    };
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
            >รายงาน
            </Typography>
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={() => setView("scanLogs")} style={{ marginRight: 10 }}>
          รายงานการสแกน
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setView("dailyReports")}> 
          รายงานรายวัน
        </Button>
      </Box>

      <Paper style={{ padding: "10px", marginBottom: "20px" }}>
        <Typography variant="h5" gutterBottom>
          {view === "scanLogs" ? "กราฟรายงานการสแกน" : "กราฟรายงานรายวัน"}
        </Typography>
        <Line data={view === "scanLogs" ? prepareChartData(scanLogs) : prepareChartData(dailyReports)} />
      </Paper>

      <Paper style={{ height: 400, width: "98%", padding: "10px" }}>
        <DataGrid
          rows={view === "scanLogs" ? scanLogs : dailyReports}
          columns={view === "scanLogs" ? scanLogsColumns : dailyReportsColumns}
          pageSize={5}
          loading={loading}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
      </Paper>
    </Container>
    </ThemeProvider>
  );
}

export default Reports;