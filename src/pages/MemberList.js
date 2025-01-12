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
} from '@mui/material';

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
  
  const durations = Array.from({ length: 12 }, (_, i) => i + 1); // รายเดือน (1-12 เดือน)
  const discountOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 10); // ส่วนลด 10% - 100%

  useEffect(() => {
    axios.get('http://localhost:5000/api/members').then((response) => {
      setMembers(response.data);
      setFilteredMembers(response.data); // ตั้งค่าเริ่มต้นสำหรับข้อมูลที่กรอง
    });

    axios.get('http://localhost:5000/api/payments').then((response) => {
      setPayments(response.data);
    });

    
  }, []);

  // ฟังก์ชันเช็คสถานะสมาชิก
  const getStatus = (member) => {
    const paymentExists = payments.some((payment) => payment.memberId === member.id);
    const currentDate = new Date();
    const endDate = new Date(member.endDate);

    // กรณี endDate หมดอายุแล้ว สถานะเป็น Inactive
    if (endDate < currentDate) {
      return 'Inactive';
    }

    // กรณี endDate ยังไม่หมดอายุ และมี Payment
    if (paymentExists && endDate >= currentDate) {
      return 'Active';
    }

    // Default: สถานะเป็น Inactive
    return 'Inactive';
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const results = members.filter(
      (member) =>
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        member.email.toLowerCase().includes(query)
    );
    setFilteredMembers(results);
  };

  const handleEdit = (member) => {
    setEditMember({ ...member, duration: '' }); // รีเซ็ต duration เป็นค่าว่าง
    setSelectedDiscount(0); // รีเซ็ตส่วนลด
    setError(''); // ล้างข้อความแจ้งเตือน
    setOpenEditDialog(true);
  };
  

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditMember(null);
    setSelectedDiscount(0);
    setError('');
  };

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) return '';
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
      points: prev.points + (duration ? duration * 10 : 0), // เพิ่มแต้มใหม่
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

  const handleDiscountChange = (e) => {
    const discount = parseInt(e.target.value, 10);
    const basePrice = editMember.duration * 900;
    const requiredPoints = discount * 10; // แต้มที่ต้องใช้ตามส่วนลด
    const discountAmount = (discount / 100) * basePrice;

    setEditMember((prev) => {
      if (prev.points < requiredPoints) {
        setError('Point ไม่พอ');
        setSelectedDiscount(0);
        return { ...prev, discountedPrice: basePrice }; // ราคากลับไปก่อนลด
      } else {
        setError('');
        setSelectedDiscount(discount);
        return {
          ...prev,
          discountedPrice: basePrice - discountAmount, // ราคาหลังลด
          points: prev.points - requiredPoints, // ตัดแต้ม
        };
      }
    });
  };

  const handleSaveEdit = async () => {
    try {
      // สร้างอ็อบเจ็กต์สมาชิกที่อัปเดต
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
        status: 'Inactive', // เปลี่ยนสถานะเป็น Inactive
        originalPrice: editMember.discountedPrice ? editMember.discountedPrice : editMember.price, // ใช้ discountedPrice ถ้ามีการใช้ส่วนลด
      };
  
      // ส่งข้อมูลที่อัปเดตไปยังเซิร์ฟเวอร์
      await axios.put(`http://localhost:5000/api/members/${editMember.id}`, updatedMember);
  
      // รีเฟรชตารางข้อมูลสมาชิก
      const response = await axios.get('http://localhost:5000/api/members');
      setMembers(response.data);
      setFilteredMembers(response.data);
  
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
      setOpenEditDialog(false);
      setEditMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };
  
  
  
  
  

  

  // ฟังก์ชันลบสมาชิก
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/members/${memberToDelete.id}`);
      setMembers((prev) => prev.filter((member) => member.id !== memberToDelete.id));
      setFilteredMembers((prev) => prev.filter((member) => member.id !== memberToDelete.id));
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
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


  return (
    <Container>
    <h2>Member List</h2>
   
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <TextField
          label="Search Member"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.firstName}</TableCell>
                <TableCell>{member.lastName}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.duration}</TableCell>
                <TableCell>{member.points}</TableCell>
                <TableCell>{new Date(member.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(member.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{getStatus(member)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenDeleteDialog(member)}
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Member</DialogTitle>
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
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary" disabled={!!error}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this member?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        <Button onClick={handlePreviousPage} disabled={currentPage === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * membersPerPage >= filteredMembers.length}
        >
          Next
        </Button>
      </div>

      <Snackbar open={alert} message="Member updated successfully" />
    </Container>
  );
}

export default MemberList;