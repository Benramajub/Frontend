import React, { useState, useEffect } from 'react';
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
  Box,
  Paper,
  Typography,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';

function AddFinger() {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedDeleteId, setSelectedDeleteId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fingrtprints/members');
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();

    // ✅ เปิด WebSocket
    const ws = new WebSocket("ws://localhost:8080");

    let scanTimeout; // 🔥 ตั้งตัวแปร Timeout

    ws.onmessage = (event) => {
      clearTimeout(scanTimeout); // ❌ เคลียร์ Timeout ถ้ามีการตอบกลับ
      const data = JSON.parse(event.data);
      console.log("📡 Received WebSocket data:", data);

      // ✅ ถ้ามี fingerprintID แต่ status ไม่ใช่ "success" ให้แจ้ง "ลงทะเบียนไม่สำเร็จ!"
      if (data.fingerprintID && data.status !== "success") {
        setAlert({
          open: true,
          message: "ลงทะเบียนไม่สำเร็จ! กรุณาลองใหม่",
          severity: "error",
        });
        setIsScanning(false);
        setOpenDialog(false);
        return;
      }

      // ✅ ลงทะเบียนสำเร็จ
      if (data.status === "success") {
        setAlert({
          open: true,
          message: `ลงทะเบียนสำเร็จ! Fingerprint ID: ${data.fingerprintID}`,
          severity: "success",
        });

        setMembers((prev) => prev.filter((member) => member.id !== data.memberId));

        setSelectedMemberId("");
        setIsScanning(false);
        setOpenDialog(false);
      } 
      


      // 🔥 ถ้าลงทะเบียนไม่สำเร็จ
      else if (data.status === "failed") {
        setAlert({
          open: true,
          message: "ลงทะเบียนไม่สำเร็จ! กรุณาลองอีกครั้ง",
          severity: "error",
        });

        setIsScanning(false);
        setOpenDialog(false);
      }
    };

    // 🔥 ตั้ง Timeout 5 วินาที ถ้าไม่มีการตอบกลับ
    scanTimeout = setTimeout(() => {
      setAlert({
        open: true,
        message: "ลงทะเบียนไม่สำเร็จ! ไม่มีการตอบกลับจากเซิร์ฟเวอร์",
        severity: "error",
      });

      setIsScanning(false);
      setOpenDialog(false);
    }, ); // ⏳ 5 วินาที

    return () => {
      clearTimeout(scanTimeout); // ❌ เคลียร์ Timeout เมื่อ Component ถูก unmount
      ws.close();
    };
}, []);

const customTheme = createTheme({
    typography: {
      fontFamily: '"Kanit", sans-serif',
    },
  });

const [deleteMembers, setDeleteMembers] = useState([]); // 🔹 รายชื่อสมาชิกที่ลงทะเบียนลายนิ้วมือแล้ว

// ✅ ดึงข้อมูลสมาชิกที่มีลายนิ้วมือ
const fetchDeleteMembers = async () => {
  try {
    const response = await axios.get("http://localhost:5000/members/registered");
    setDeleteMembers(response.data);
  } catch (error) {
    console.error("Error fetching registered members:", error);
  }
};

useEffect(() => {
  fetchDeleteMembers(); // 🔥 โหลดสมาชิกที่มีลายนิ้วมือเมื่อหน้าโหลด
}, []);

const handleSelectDeleteMember = (event) => {
  setSelectedDeleteId(event.target.value);
};

// ✅ ฟังก์ชันลบลายนิ้วมือ
const handleDeleteFingerprint = async () => {
  if (!selectedDeleteId) {
    setAlert({ open: true, message: "กรุณาเลือกสมาชิกก่อนลบลายนิ้วมือ!", severity: "warning" });
    return;
  }

  const confirmDelete = window.confirm(`คุณต้องการลบลายนิ้วมือของสมาชิก ID: ${selectedDeleteId} ใช่หรือไม่?`);
  if (!confirmDelete) return;

  try {
    // ✅ ใช้ `POST` request และส่ง `memberId` ผ่าน `body`
    const response = await axios.post(`http://localhost:5000/api/fingerprint/delete`, { memberId: selectedDeleteId });

    if (response.status === 200) {
      setAlert({ open: true, message: response.data.message, severity: "success" });

      // 🔥 อัปเดตรายชื่อสมาชิกที่มีลายนิ้วมือ
      setDeleteMembers((prev) => prev.filter((member) => member.id !== selectedDeleteId));
      setSelectedDeleteId("");
    } else {
      setAlert({ open: true, message: "ลบลายนิ้วมือไม่สำเร็จ!", severity: "error" });
    }
  } catch (error) {
    console.error("❌ Error deleting fingerprint:", error);
    setAlert({ open: true, message: "เกิดข้อผิดพลาดในการลบลายนิ้วมือ!", severity: "error" });
  }
};

  const handleSelectMember = (event) => {
    setSelectedMemberId(event.target.value);
  };


  const handleCancelScan = () => {
    setIsScanning(false);
    setOpenDialog(false);
  };
  
  const handleStartScan = async () => {
    if (!selectedMemberId) {
      setAlert({ open: true, message: 'กรุณาเลือกสมาชิกก่อนเริ่มการสแกน!', severity: 'warning' });
      return;
    }
  
    setIsScanning(true);
    setOpenDialog(true);
  
    try {
      console.log("เริ่มการสแกนสำหรับสมาชิก:", selectedMemberId);
  
      const response = await axios.post('http://localhost:5000/api/fingerprint/enroll', { memberId: selectedMemberId });
  
      if (response.data.status === "exists") {
        setAlert({ open: true, message: 'ลายนิ้วมือนี้มีอยู่แล้ว!', severity: 'warning' });
        handleCancelScan(); // ปิด Dialog ถ้ามีข้อมูลอยู่แล้ว
        return;
      }
  
    } catch (error) {
      console.error('Error during fingerprint scan:', error);
      setAlert({ open: true, message: 'เกิดข้อผิดพลาดในการสแกนลายนิ้วมือ!', severity: 'error' });
      handleCancelScan();
    }
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
    <Paper elevation={3} sx={{ p: 3, background:"linear-gradient(to right,rgba(27, 134, 187, 0.8),rgb(30, 135, 188))", borderRadius: "32px", width: "80%", margin: "0 auto" }}>
        <Typography
          variant="h5"
          sx={{
            color: "white",
            padding: "10px",
            fontWeight: "bold",
            borderRadius: "5px",
            textAlign: "left",
          }}
        >ลงทะเบียนลายนิ้วมือ
        </Typography>
    <Paper elevation={3} sx={{ p: 2,gap: 1, background: "rgba(223, 235, 241, 0.5))", borderRadius:"32px" }}>
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
      <Box sx={{display:"flex", justifyContent:"center", gap:2, mt:2}}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleStartScan}
        disabled={isScanning || members.length === 0}
      >
        {isScanning ? (
          <>
            <CircularProgress size={24} style={{ marginRight: 10, color: 'white' }} />
            กำลังสแกน...
          </>
        ) : (
          'เริ่มสแกนลายนิ้วมือ'
        )}
      </Button>
      </Box>
      </Paper>
      <Typography 
            variant="h5"
          sx={{
            color: "white",
            padding: "10px",
            fontWeight: "bold",
            borderRadius: "5px",
            textAlign: "left",
          }}>ลบลายนิ้วมือ</Typography>
    <Paper elevation={3} sx={{ p: 2,gap: 1, background: "rgba(223, 235, 241, 0.5))", borderRadius:"32px" }}>
    <FormControl fullWidth margin="normal">
    <InputLabel>เลือกสมาชิกที่ต้องการลบลายนิ้วมือ</InputLabel>
    <Select value={selectedDeleteId} onChange={handleSelectDeleteMember}>
        {deleteMembers.length > 0 ? (
        deleteMembers.map((member) => (
            <MenuItem key={member.id} value={member.id}>
            {`${member.id} - ${member.firstName} ${member.lastName}`}
            </MenuItem>
        ))
        ) : (
        <MenuItem disabled>ไม่มีสมาชิกที่ลงทะเบียนลายนิ้วมือ</MenuItem>
        )}
    </Select>
    </FormControl>
    <Box sx={{display:"flex", justifyContent:"center", gap:2, mt:2}}>
    <Button
    variant="contained"
    color="secondary"
    onClick={handleDeleteFingerprint}
    disabled={!selectedDeleteId}
    startIcon={<DeleteIcon />}
    >
    ลบลายนิ้วมือ
    </Button>
    </Box>
      <Dialog open={openDialog} maxWidth="xs" fullWidth>
      <DialogTitle align="center">กำลังสแกนลายนิ้วมือ</DialogTitle>
      <DialogContent style={{ textAlign: 'center', padding: '20px' }}>
        <CircularProgress size={50} />
        <p style={{ marginTop: '10px' }}>กรุณาวางนิ้วมือบนเครื่องสแกน...</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelScan} color="secondary">
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
    </Paper>

    <Snackbar
      open={alert.open}
      autoHideDuration={4000}
      onClose={() => setAlert({ open: false, message: '', severity: '' })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={alert.severity}>{alert.message}</Alert>
    </Snackbar>
    </Paper>
    </Container>
    </ThemeProvider>
  );
}

export default AddFinger;