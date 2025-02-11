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

function AddFinger() {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/fingrtprints/members");
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("❌ Error fetching members:", error);
      }
    };
    fetchMembers();

    // ✅ เปิด WebSocket เพื่อรับข้อมูลแบบเรียลไทม์
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📡 Received WebSocket data:", data);

      if (data.status === "success") {
        setAlert({
          open: true,
          message: `✅ ลงทะเบียนสำเร็จ! Fingerprint ID: ${data.fingerprintID}`,
          severity: "success",
        });

        // 🔥 อัปเดตรายชื่อสมาชิกที่ยังไม่มีลายนิ้วมือ
        setMembers((prev) => prev.filter((member) => member.id !== data.memberId));
        setSelectedMemberId("");
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
      setAlert({ open: true, message: "⚠️ กรุณาเลือกสมาชิกก่อนเริ่มการสแกน!", severity: "warning" });
      return;
    }

    setIsScanning(true);
    setOpenDialog(true);
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

      <Button variant="contained" color="primary" onClick={handleStartScan} disabled={isScanning || members.length === 0} fullWidth>
        {isScanning ? <CircularProgress size={24} style={{ marginRight: 10, color: "white" }} /> : "เริ่มสแกนลายนิ้วมือ"}
      </Button>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ open: false, message: "", severity: "" })}>
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default AddFinger;
