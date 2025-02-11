import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

function AddFinger() {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/members`);
        setMembers(response.data);
      } catch (error) {
        console.error("❌ Error fetching members:", error);
      }
    };

    fetchMembers();

    // ✅ เปิด WebSocket เพื่อฟังข้อมูลจากเซิร์ฟเวอร์
    const ws = new WebSocket("wss://gym-management-m20js3uuh-benramajubs-projects.vercel.app");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📡 Received WebSocket data:", data);

      if (data.status === "success") {
        setAlert({
          open: true,
          message: `✅ ลงทะเบียนสำเร็จ! Fingerprint ID: ${data.fingerprintID}`,
          severity: "success",
        });

        // 🔥 ลบสมาชิกที่ลงทะเบียนสำเร็จออกจากลิสต์
        setMembers((prev) => prev.filter((member) => member.id !== data.memberId));
        setSelectedMemberId("");
        setIsScanning(false);
        setOpenDialog(false);
      } else if (data.status === "error") {
        setAlert({
          open: true,
          message: ` เกิดข้อผิดพลาด: ${data.message}`,
          severity: "error",
        });
        setIsScanning(false);
        setOpenDialog(false);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSelectMember = (event) => {
    setSelectedMemberId(event.target.value);
  };

  const handleStartScan = async () => {
    if (!selectedMemberId) {
      setAlert({ open: true, message: "กรุณาเลือกสมาชิกก่อนเริ่มการสแกน!", severity: "warning" });
      return;
    }

    setIsScanning(true);
    setOpenDialog(true);

    try {
      console.log("🔵 ส่งคำขอให้ ESP32 ลงทะเบียนสมาชิก:", selectedMemberId);
      const response = await axios.post(`http://localhost:5000/fingerprint/request_enroll`, {
        memberId: selectedMemberId,
      });

      console.log("📡 API Response:", response.data);

      if (response.data.message) {
        setAlert({ open: true, message: response.data.message, severity: "info" });
      }
    } catch (error) {
      console.error(" Error sending fingerprint enroll request:", error);
      setAlert({ open: true, message: " เกิดข้อผิดพลาดในการส่งคำขอ!", severity: "error" });
      setIsScanning(false);
      setOpenDialog(false);
    }
  };

  return (
    <Container>
      <h2>ลงทะเบียนลายนิ้วมือ</h2>

      <FormControl fullWidth margin="normal">
        <InputLabel>เลือกสมาชิก</InputLabel>
        <Select value={selectedMemberId} onChange={handleSelectMember}>
          {members.length > 0 ? (
            members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {`${member.id} - ${member.firstName} ${member.lastName}`}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>ไม่มีสมาชิกที่สามารถลงทะเบียนได้</MenuItem>
          )}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={handleStartScan}
        disabled={isScanning || members.length === 0}
        fullWidth
      >
        {isScanning ? (
          <>
            <CircularProgress size={24} style={{ marginRight: 10, color: "white" }} />
            กำลังสแกน...
          </>
        ) : (
          "เริ่มสแกนลายนิ้วมือ"
        )}
      </Button>

      <Dialog open={openDialog} maxWidth="xs" fullWidth>
        <DialogTitle align="center">กำลังสแกนลายนิ้วมือ</DialogTitle>
        <DialogContent style={{ textAlign: "center", padding: "20px" }}>
          <CircularProgress size={50} />
          <p style={{ marginTop: "10px" }}>กรุณาวางนิ้วมือบนเครื่องสแกน...</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary" disabled={isScanning}>
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ open: false, message: "", severity: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default AddFinger;
