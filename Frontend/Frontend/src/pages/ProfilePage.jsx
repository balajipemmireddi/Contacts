import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import API from '../api/axios';

export default function ProfilePage() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/api/profile');
        setProfile(res.data);
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <p className="text-center mt-5">Loading profile…</p>;

  return (
    <div className="glass-card p-5" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2 className="mb-4 text-center" style={{ color: 'var(--accent)' }}>Your Profile</h2>
      <p><strong>First Name:</strong> {profile.firstName}</p>
      <p><strong>Last Name:</strong> {profile.lastName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      <p><strong>Joined:</strong> {new Date(profile.createdDate).toLocaleDateString()}</p>
    </div>
  );
}
