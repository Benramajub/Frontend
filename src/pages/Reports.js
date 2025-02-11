import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

function Reports() {
  const [scanLogs, setScanLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false); // 🔄 สถานะการสแกน

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

    fetchScanLogs();
  }, []);

  const handleStartScan = async () => {
    setScanning(true); // 🔄 อัปเดตสถานะการสแกน
    try {
      await axios.post("http://localhost:5000/api/fingerprint/start-scan");
      alert("ระบบสแกนเริ่มทำงานแล้ว!");
    } catch (error) {
      console.error("Error starting scan:", error);
      alert("ไม่สามารถเริ่มการสแกนได้!");
    } finally {
      setScanning(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "memberId", headerName: "Member ID", width: 100 },
    { field: "name", headerName: "ชื่อ - นามสกุล", width: 200 },
    { field: "scanTime", headerName: "วันที่ & เวลา", width: 200 },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        รายงานการสแกนเข้าใช้งาน
      </Typography>

      {/* 🔥 ปุ่มเริ่มต้นระบบสแกน */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleStartScan}
        disabled={scanning}
        style={{ marginBottom: "10px" }}
      >
        {scanning ? "กำลังเริ่มระบบ..." : "เริ่มระบบการสแกนเข้า"}
      </Button>

      <Paper style={{ height: 400, width: "100%", padding: "10px" }}>
        <DataGrid
          rows={scanLogs}
          columns={columns}
          pageSize={5}
          loading={loading}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
    </Container>
  );
}

export default Reports;
