import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/members/${id}`)
      .then((response) => {
        console.log('Fetched Member Data:', response.data); // Debugging
        setMember(response.data);
      })
      .catch((error) => {
        console.error('Error fetching member:', error);
      });
  }, [id]);
  

  const handleChange = (e) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    axios.put(`http://localhost:5000/api/members/${id}`, member).then(() => {
      navigate('/members'); // กลับไปที่หน้า Member List
    });
  };

  return (
    <Container>
      <h2>Edit Member</h2>
      <TextField
        name="firstName"
        label="First Name"
        value={member.firstName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="lastName"
        label="Last Name"
        value={member.lastName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="age"
        label="Age"
        value={member.age}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="phone"
        label="Phone"
        value={member.phone}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="email"
        label="Email"
        value={member.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Save Changes
      </Button>
    </Container>
  );
}

export default EditMember;
