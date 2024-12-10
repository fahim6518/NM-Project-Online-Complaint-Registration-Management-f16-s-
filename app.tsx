import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Complaint {
  _id: string;
  userId: string;
  complaintText: string;
  status: string;
}

const App: React.FC = () => {
  const [complaintText, setComplaintText] = useState('');
  const [userId, setUserId] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Fetch complaints from the backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:5000/complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
    fetchComplaints();
  }, []);

  // Handle form submission to create a complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/complaints', {
        userId,
        complaintText,
      });
      setComplaints((prevComplaints) => [...prevComplaints, response.data]);
      setComplaintText('');
      setUserId('');
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  };

  return (
    <div>
      <h1>Complaint Registration System</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">User ID:</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="complaintText">Complaint:</label>
          <textarea
            id="complaintText"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Complaint</button>
      </form>

      <h2>Complaints List</h2>
      <ul>
        {complaints.map((complaint) => (
          <li key={complaint._id}>
            <p>User ID: {complaint.userId}</p>
            <p>Complaint: {complaint.complaintText}</p>
            <p>Status: {complaint.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
