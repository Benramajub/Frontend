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
          timestamp: new Date(item.timestamp).toISOString().replace("T", " ").split(".")[0]
        }));
        setDailyReports(formattedData);
      } catch (error) {
        console.error("Error fetching daily reports:", error);
      }
    };

    fetchScanLogs();
    fetchDailyReports();
  }, []);

  const scanLogsColumns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "memberId", headerName: "Member ID", width: 100 },
    { field: "name", headerName: "ชื่อ - นามสกุล", width: 200 },
    { field: "scanTime", headerName: "วันที่ & เวลา", width: 200 },
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
    <Container>
      <Typography variant="h4" gutterBottom>
        รายงาน
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
          {view === "scanLogs" ? "กราฟการสแกน" : "กราฟรายงานรายวัน"}
        </Typography>
        <Line data={view === "scanLogs" ? prepareChartData(scanLogs) : prepareChartData(dailyReports)} />
      </Paper>

      <Paper style={{ height: 400, width: "100%", padding: "10px" }}>
        <DataGrid
          rows={view === "scanLogs" ? scanLogs : dailyReports}
          columns={view === "scanLogs" ? scanLogsColumns : dailyReportsColumns}
          pageSize={5}
          loading={loading}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
    </Container>
  );
}

export default Reports;