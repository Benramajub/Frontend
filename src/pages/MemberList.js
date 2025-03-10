import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPageIcon from '@mui/icons-material/ContactPage';

function MemberList() {
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const membersPerPage = 10; // จำนวนสมาชิกต่อหน้า
  const [currentPage, setCurrentPage] = useState(0); // สำหรับการแบ่งหน้า
// ✨ เพิ่ม state สำหรับ Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const durations = Array.from({ length: 12 }, (_, i) => i + 1); // รายเดือน (1-12 เดือน)
  const discountOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 10); // ส่วนลด 10% - 100%
  const [dailymembers, setDailyMembers] = useState([]); // 🌟 เพิ่ม state สำหรับสมาชิกรายวัน
  const [viewMode, setViewMode] = useState('monthly'); // 🌟 เพิ่ม state ควบคุมหน้า
  const [dailyPage, setDailyPage] = useState(0); // 🌟 หน้าของสมาชิกรายวัน
  const [filteredDailyMembers, setFilteredDailyMembers] = useState([]); // 🌟 เพิ่ม state สำหรับค้นหาสมาชิกรายวัน
  const [dailySearchQuery, setDailySearchQuery] = useState(''); // 🌟 แยก state ค้นหาสมาชิกรายวัน
 
  useEffect(() => {
    axios.get('http://localhost:5000/api/members').then((response) => {
      const updatedMembers = response.data.map((member) => ({
        ...member,
        status: getStatus(member), // คำนวณสถานะใหม่
      }));
  
      setMembers(updatedMembers);
      setFilteredMembers(updatedMembers);
  
      // อัปเดตสถานะไปยังฐานข้อมูล
      updatedMembers.forEach((member) => {
        updateMemberStatus(member.id, member.status);
      });
    });
  
    axios.get('http://localhost:5000/api/payments').then((response) => {
      setPayments(response.data);
    });
  
    axios.get('http://localhost:5000/api/dailymembers').then((response) => {
      setDailyMembers(response.data);
      setFilteredDailyMembers(response.data);
    });
  }, []);
  
  // ฟังก์ชันอัปเดตสถานะสมาชิกในฐานข้อมูล
  const updateMemberStatus = async (id, status) => {
    console.log(`🔄 Updating status for member ${id}: ${status}`); // Debug log
  
    try {
      const response = await axios.put(`http://localhost:5000/api/members/${id}/status`, { status });
      console.log(`✅ Server Response:`, response.data);
    } catch (error) {
      console.error(`❌ Error updating status for member ${id}:`, error.response?.data || error.message);
    }
  };

  // ฟังก์ชันเช็คสถานะสมาชิก
  const getStatus = (member) => {
    const paymentExists = payments.some((payment) => payment.memberId === member.id);
    const currentDate = new Date();
    const endDate = new Date(member.endDate);
  
    console.log(`🔍 Checking status for member ${member.id}: EndDate=${member.endDate}, Payment=${paymentExists}`);
  
    if (endDate < currentDate) return 'Inactive';
    if (paymentExists && endDate >= currentDate) return 'Active';
    return 'Inactive';
  };
  
  const handleEdit = (member) => {
    setEditMember({
      ...member,
      duration: '', // รีเซ็ต duration เป็นค่าว่าง
      basePoints: member.points, // ✅ เก็บค่า points เดิมไว้เป็นฐาน
    });
    setSelectedDiscount(0); // รีเซ็ตส่วนลด
    setError(''); // ล้างข้อความแจ้งเตือน
    setOpenEditDialog(true);
  };
  
  const customTheme = createTheme({
    typography: {
      fontFamily: '"Kanit", sans-serif',
    },
  });

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditMember(null);
    setSelectedDiscount(0);
    setError('');
  };

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration || isNaN(duration)) return '';
    const startDateObj = new Date(startDate);
    startDateObj.setMonth(startDateObj.getMonth() + parseInt(duration, 10));
    return startDateObj.toISOString().split('T')[0];
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'duration') {
      const duration = value === '' ? '' : parseInt(value, 10); // ตรวจสอบค่าว่าง
      const basePrice = duration ? duration * 900 : 0; // ราคาเต็ม
      const discountAmount = (selectedDiscount / 100) * basePrice;
  
      setEditMember((prev) => ({
        ...prev,
        duration,
        price: basePrice,
        discountedPrice: basePrice - discountAmount, // ราคาหลังลด
        points: prev.basePoints + (duration ? duration * 10 : 0), // ✅ ใช้ค่าเก่าจากฐาน + duration ใหม่
        endDate: duration ? calculateEndDate(prev.startDate, duration) : '', // คำนวณ endDate
      }));
    } else if (name === 'startDate') {
      const newEndDate = calculateEndDate(value, editMember.duration);
      setEditMember((prev) => ({
        ...prev,
        startDate: value,
        endDate: newEndDate,
      }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
        // 🌟 ถ้าไม่มีค่าค้นหา รีเซ็ตข้อมูลทั้งหมด
        if (viewMode === 'monthly') {
            setFilteredMembers(members);
        } else {
            setFilteredDailyMembers(dailymembers);
        }
        return;
    }

    try {
        let response;
        if (viewMode === 'monthly') {
            // 🔍 ค้นหาสมาชิกรายเดือน
            response = await axios.get(`http://localhost:5000/api/member/search?q=${searchQuery}`);
            setFilteredMembers(response.data);
        } else {
            // 🔍 ค้นหาสมาชิกรายวัน
            response = await axios.get(`http://localhost:5000/api/dailymembers/search?q=${searchQuery}`);
            setFilteredDailyMembers(response.data);
        }
    } catch (error) {
        console.error("❌ Error fetching search results:", error);
        if (viewMode === 'monthly') {
            setFilteredMembers([]);
        } else {
            setFilteredDailyMembers([]);
        }
    }
};

  const handleDiscountChange = (e) => {
    const discount = parseInt(e.target.value, 10);
    const basePrice = editMember.duration * 900;
    const requiredPoints = discount * 10;
    const discountAmount = (discount / 100) * basePrice;

    if (editMember.points < requiredPoints) {
        setSnackbar({ open: true, message: ' แต้มไม่พอสำหรับส่วนลดนี้!', severity: 'warning' });
        setSelectedDiscount(0);
        return;
    }

    setSelectedDiscount(discount);
    setEditMember((prev) => ({
      ...prev,
      discountedPrice: basePrice - discountAmount,
      points: prev.points - requiredPoints,
    }));
};

const handleSaveEdit = async () => {
  try {
      const updatedMember = {
          id: editMember.id,
          firstName: editMember.firstName,
          lastName: editMember.lastName,
          phone: editMember.phone,
          email: editMember.email,
          points: editMember.points,
          duration: editMember.duration,
          startDate: editMember.startDate,
          endDate: editMember.endDate,
          status: 'Inactive',
          originalPrice: editMember.discountedPrice ? editMember.discountedPrice : editMember.price,
      };

      if (editMember.age !== undefined) {
          updatedMember.age = editMember.age;
      }

      await axios.put(`http://localhost:5000/api/members/${editMember.id}`, updatedMember);

      const response = await axios.get('http://localhost:5000/api/members');
      setMembers(response.data);
      setFilteredMembers(response.data);

      setSnackbar({ open: true, message: ' ข้อมูลถูกอัปเดตเรียบร้อย!', severity: 'success' });
      setOpenEditDialog(false);
      setEditMember(null);
  } catch (error) {
      console.error('Error updating member:', error);
  }
};
  
  useEffect(() => {
    if (currentPage * membersPerPage >= filteredMembers.length) {
      setCurrentPage(0); // รีเซ็ตเป็นหน้าแรกถ้าหน้าปัจจุบันไม่มีข้อมูล
    }
  }, [filteredMembers]);
  
  // ฟังก์ชันลบสมาชิก
  const handleDelete = async () => {
    try {
        await axios.delete(`http://localhost:5000/api/members/${memberToDelete.id}`);
        setMembers((prev) => prev.filter((member) => member.id !== memberToDelete.id));
        setFilteredMembers((prev) => prev.filter((member) => member.id !== memberToDelete.id));

        setSnackbar({ open: true, message: ' ลบสมาชิกสำเร็จ!', severity: 'error' });
        setOpenDeleteDialog(false);
        setMemberToDelete(null);
    } catch (error) {
        console.error('Error deleting member:', error);
    }
};

  const handleOpenDeleteDialog = (member) => {
    setMemberToDelete(member);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMemberToDelete(null);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * membersPerPage < filteredMembers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedMembers = filteredMembers.slice(
    currentPage * membersPerPage,
    (currentPage + 1) * membersPerPage
  );

const paginatedDailyMembers = dailymembers.slice(
    dailyPage * membersPerPage,
    (dailyPage + 1) * membersPerPage
  );

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
      >จัดการข้อมูล
      </Typography>
    <Paper elevation={3} sx={{ p: 2, background: "rgba(223, 235, 241, 0.5))", borderRadius:"32px" }}>
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <Button
        variant={viewMode === 'monthly' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => setViewMode('monthly')}
      >
        สมาชิกรายเดือน
      </Button>
      <Button
        variant={viewMode === 'daily' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => setViewMode('daily')}
      >
        สมาชิกรายวัน
      </Button>
    </div>
{/* 🌟 ช่องค้นหาที่ใช้ร่วมกัน */}
<div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
    <TextField
        label={viewMode === 'monthly' ? "Search Monthly Member" : "Search Daily Member"}
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
    />
    <Button variant="contained" color="secondary" onClick={handleSearch} sx={{ borderRadius:"16px" }}>
        Search
    </Button>
</div>

      {/* 🌟 ตารางสมาชิกรายเดือน */}
      {viewMode === 'monthly' && (
        <>
      
          <TableContainer component={Paper}>
            <Table sx={{ border: "2px solid gray" }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell rowSpan={2} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers
                  .slice(currentPage * membersPerPage, (currentPage + 1) * membersPerPage)
                  .map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.firstName}</TableCell>
                      <TableCell>{member.lastName}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.duration}</TableCell>
                      <TableCell>{member.points}</TableCell>
                      <TableCell>{new Date(member.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                      <TableCell>{new Date(member.endDate).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                      <TableCell>{getStatus(member)}</TableCell>
                      <TableCell>
                      <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleEdit(member)}
                    style={{ marginLeft: '10px' }}
                    startIcon={<ContactPageIcon/>}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleOpenDeleteDialog(member)}
                    style={{ marginLeft: '10px' }}
                    startIcon={<DeleteIcon/>}
                  >
                    Delete
                  </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* 🌟 ตารางสมาชิกรายวัน */}
            {/* 🌟 ตารางสมาชิกรายวัน */}
            {viewMode === 'daily' && (
        <>
    

          <TableContainer component={Paper}>
            <Table sx={{ border: "2px solid gray" }}>
              <TableHead>
                <TableRow>
                  
                  <TableCell>Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Uses Remaining</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {filteredDailyMembers.slice(dailyPage * membersPerPage, (dailyPage + 1) * membersPerPage)
                  .map((member) => (
    <TableRow key={member.id}>
      
      <TableCell>{member.name}</TableCell>
      <TableCell>{member.amount}</TableCell>
      <TableCell>{member.code}</TableCell>
      <TableCell>{member.uses_remaining}</TableCell>
      <TableCell>{new Date(member.date).toLocaleDateString()}</TableCell>
    </TableRow>
  ))}
</TableBody>

            </Table>
          </TableContainer>
        </>
      )}


      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>เเก้ไขข้อมูลสมาชิก</DialogTitle>
        <DialogContent>
          {editMember && (
            <>
            <TextField
          label="First Name"
          value={editMember.firstName || ''}
          disabled
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          value={editMember.lastName || ''}
          disabled
          fullWidth
          margin="normal"
        />
        <TextField
          label="Points"
          value={editMember.points || 0}
          disabled
          fullWidth
          margin="normal"
        />
              <TextField
                label="Start Date"
                name="startDate"
                value={editMember.startDate || ''}
                onChange={handleFieldChange}
                type="date"
                fullWidth
                margin="normal"
              />
              <TextField
          label="Duration (months)"
          name="duration"
          value={editMember.duration || ''} // ใช้ค่าว่าง
          onChange={handleFieldChange}
          select
          fullWidth
          margin="normal"
        >
                {durations.map((duration) => (
                  <MenuItem key={duration} value={duration}>
                    {duration}
                  </MenuItem>
                ))}
              </TextField>
        
              <TextField
                label="Discount (%)"
                value={selectedDiscount}
                onChange={handleDiscountChange}
                select
                fullWidth
                margin="normal"
              >
                {discountOptions.map((discount) => (
                  <MenuItem key={discount} value={discount}>
                    {discount}%
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price"
                value={editMember.price || 0}
                disabled
                fullWidth
                margin="normal"
              />
              <TextField
                label="Discounted Price"
                value={editMember.discountedPrice || 0}
                disabled
                fullWidth
                margin="normal"
              />
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained" >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
        <DialogContent>
          <p>คุณเเน่ใจหรือไม่ ต้องการลบสมาชิกนี้?</p>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleCloseDeleteDialog} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🌟 ปุ่มเปลี่ยนหน้า (ใช้ได้ทั้งสองหน้า) */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <Button
          onClick={() => {
            if (viewMode === 'monthly') setCurrentPage((prev) => Math.max(prev - 1, 0));
            else setDailyPage((prev) => Math.max(prev - 1, 0));
          }}
          disabled={viewMode === 'monthly' ? currentPage === 0 : dailyPage === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (viewMode === 'monthly') setCurrentPage((prev) => prev + 1);
            else setDailyPage((prev) => prev + 1);
          }}
          disabled={
            viewMode === 'monthly'
              ? (currentPage + 1) * membersPerPage >= filteredMembers.length
              : (dailyPage + 1) * membersPerPage >= dailymembers.length
          }
        >
          Next
        </Button>
      </div>
      
  <Snackbar
    open={snackbar.open}
   autoHideDuration={3000}
    onClose={() => setSnackbar({ ...snackbar, open: false })}
   anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
  <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
    {snackbar.message}
  </Alert>
  </Snackbar>
  </Paper>
  </Paper>
  </Container>
  </ThemeProvider>
    
  );
}

export default MemberList;