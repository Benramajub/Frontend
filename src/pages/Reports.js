import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Button, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

function Reports() {
  const [scanLogs, setScanLogs] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("scanLogs"); // ใช้สำหรับเลือกแสดงข้อมูล

  useEffect(() => {
    const fetchScanLogs = async () => {
      try {
        const response = await axios.get("https://gym-management-smoky.vercel.app/api/reports");
        setScanLogs(response.data);
      } catch (error) {
        console.error("Error fetching scan logs:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDailyReports = async () => {
      try {
        const response = await axios.get("https://gym-management-smoky.vercel.app/api/daily-reports");
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