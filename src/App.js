import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/Navbar';
import MemberList from './pages/MemberList';
import AddMember from './pages/AddMember';
import Payment from './pages/Payment';
import Summary from './pages/Summary';
import EditMember from './pages/EditMember';
import Home from './pages/Home';
import Login from './Login.js'
import Reports from './pages/Reports.js'

import Register from './Register.js'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
      
       <Route path="/Login"  element = {<Login/>} />
       <Route path="/Register"  element = {<Register/>} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/home" element={<Home />} />
        <Route path="/edit-member/:id" element={<EditMember />} />
        <Route path="/Reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;