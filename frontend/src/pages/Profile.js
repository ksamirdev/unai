import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { userAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching profile data...');
      
      // Use user data from AuthContext as fallback
      setProfileData({
        fullName: user.fullName || 'User',
        email: user.email || 'No email',
        profileImage: user.profileImage || null,
        createdAt: user.createdAt || new Date()
      });

      // Try to fetch additional data from API
      try {
        const response = await userAPI.getProfile();
        console.log('✅ Profile API response:', response.data);
        setProfileData(response.data.user);
      } catch (apiError) {
        console.log('⚠️ Profile API not available, using auth data');
      }

      // Try to fetch stats
      try {
        const statsResponse = await userAPI.getStats();
        console.log('✅ Stats API response:', statsResponse.data);
        setStats(statsResponse.data.stats);
      } catch (statsError) {
        console.log('⚠️ Stats API not available, using defaults');
        setStats({
          totalDetections: user.detectionHistory?.length || 0,
          deepfakesDetected: user.detectionHistory?.filter(d => d.isDeepfake).length || 0,
          authenticImages: user.detectionHistory?.filter(d => !d.isDeepfake).length || 0,
          averageConfidence: 0
        });
      }

    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchProfileData}>Retry</button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page-container">
        <h1>Profile</h1>
        <p>No profile data available. Please login again.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '40px 20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#212529' }}>My Profile</h1>
          <p style={{ color: '#6c757d' }}>Manage your UnAI account settings</p>
        </div>

        {/* Profile Image Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {profileData.profileImage ? (
            <img 
              src={`http://localhost:5000${profileData.profileImage}`} 
              alt="Profile" 
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '4px solid #20b2aa',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '4px solid #20b2aa',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: '700',
              color: '#20b2aa',
              margin: '0 auto'
            }}>
              {profileData.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              Full Name
            </label>
            <div style={{
              padding: '12px 16px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              {profileData.fullName || 'Not set'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              Email Address
            </label>
            <div style={{
              padding: '12px 16px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{profileData.email}</span>
              <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '500' }}>✅ Verified</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              Member Since
            </label>
            <div style={{
              padding: '12px 16px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              {new Date(profileData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '32px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
            Account Statistics
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#20b2aa', marginBottom: '8px' }}>
                {stats?.totalDetections || 0}
              </div>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Images Analyzed
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#20b2aa', marginBottom: '8px' }}>
                {stats?.deepfakesDetected || 0}
              </div>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Deepfakes Detected
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#20b2aa', marginBottom: '8px' }}>
                {stats?.authenticImages || 0}
              </div>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Authentic Images
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
