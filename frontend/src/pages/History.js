import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { imageAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const { user } = useAuth();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      console.log('🔄 Fetching detection history...');
      
      // Try to fetch from API first
      try {
        const response = await imageAPI.getHistory();
        console.log('✅ History API response:', response.data);
        setDetections(response.data.detections || []);
      } catch (apiError) {
        console.log('⚠️ History API not available, using user data');
        // Use detection history from user context as fallback
        setDetections(user?.detectionHistory || []);
      }
    } catch (error) {
      console.error('❌ History fetch error:', error);
      setError('Failed to load detection history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading detection history..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#212529' }}>Detection History</h1>
          <p style={{ color: '#6c757d' }}>View your previous deepfake detection results</p>
        </div>

        {/* Statistics Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#20b2aa', marginBottom: '8px' }}>
              {detections.length}
            </div>
            <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
              Total Analyses
            </div>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
              {detections.filter(d => d.isDeepfake).length}
            </div>
            <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
              Deepfakes Found
            </div>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '8px' }}>
              {detections.filter(d => !d.isDeepfake).length}
            </div>
            <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
              Authentic Images
            </div>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#20b2aa', marginBottom: '8px' }}>
              {detections.filter(d => d.regeneratedImage).length}
            </div>
            <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
              Regenerated
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {detections.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '24px', color: '#212529', marginBottom: '16px' }}>
                No detection history found
              </h3>
              <p style={{ color: '#6c757d', fontSize: '16px' }}>
                Upload some images on the dashboard to get started!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {detections.map((detection, index) => (
                <div key={detection._id || index} style={{
                  background: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: detection.isDeepfake 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : 'rgba(34, 197, 94, 0.1)',
                      color: detection.isDeepfake ? '#ef4444' : '#22c55e'
                    }}>
                      {detection.isDeepfake ? '⚠️ Deepfake' : '✅ Authentic'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6c757d' }}>
                      {new Date(detection.createdAt || detection.processedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {detection.originalImage && (
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={`http://localhost:5000${detection.originalImage}`} 
                        alt="Analyzed" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#212529',
                        marginBottom: '8px'
                      }}>
                        Confidence: {((detection.confidence || 0.5) * 100).toFixed(1)}%
                      </label>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e9ecef',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(detection.confidence || 0.5) * 100}%`,
                          background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>

                    {detection.processingTime && (
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '16px' }}>
                        Processing time: {detection.processingTime}ms
                      </div>
                    )}

                    {detection.regeneratedImage && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(32, 178, 170, 0.1)',
                        border: '1px solid #20b2aa',
                        borderRadius: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#20b2aa',
                          fontWeight: '500'
                        }}>
                          🔄 Regenerated version available
                        </span>
                        <button 
                          onClick={() => window.open(`http://localhost:5000${detection.regeneratedImage}`, '_blank')}
                          style={{
                            background: '#20b2aa',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
