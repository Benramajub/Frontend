import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Button, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { ThemeProvider, createTheme } from "@mui/material/styles";

function Reports() {
  const [scanLogs, setScanLogs] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("scanLogs"); // ใช้สำหรับเลือกแสดงข้อมูล

  useEffect(() => {
    const fetchScanLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reports");
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

  const customTheme = createTheme({
          typography: {
            fontFamily: '"Kanit", sans-serif',
          },
        });

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
       <Paper elevation={3} sx={{ p: 2, background: "rgba(223, 235, 241, 0.5))", borderRadius:"32px" }}>
       <Box mb={2}>
        <Button variant="contained" color="primary" onClick={() => setView("scanLogs")} style={{ marginRight: 10 }}>
          รายงานการสแกน
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setView("dailyReports")}> 
          รายงานรายวัน
        </Button>
      </Box>
      <Paper sx={{ height: 400, width: "90%", padding: "10px", margin: "0 auto", background: "rgb(125, 133, 138))", border: "2px solid gray" }}>
      <DataGrid
          sx={{
            "& .MuiDataGrid-root": {
              border: "5px solid white", // เปลี่ยนความหนาของเส้นตาราง
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "5px solid rgba(10, 10, 10, 0.5)", // เปลี่ยนเส้นคั่นแต่ละแถว
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "5px solid white", // เส้นคั่นระหว่างหัวข้อกับข้อมูล
            }
          }}
          rows={view === "scanLogs" ? scanLogs : dailyReports}
          columns={view === "scanLogs" ? scanLogsColumns : dailyReportsColumns}
          pageSize={5}
          loading={loading}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
      </Paper>
      </Paper>
    </Container>
    </ThemeProvider>
  );
}

export default Reports;