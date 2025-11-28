import React, { useState, useRef } from 'react';
import { imageAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const { user } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await imageAPI.processImage(formData);
      setResult(response.data.detection);
    } catch (err) {
      setError(err.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome, {user?.fullName}</h1>
          <p>Upload an image to detect deepfakes and regenerate authentic content</p>
        </div>

        <div className="upload-section">
          <div 
            className={`upload-area ${selectedFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            {!selectedFile ? (
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>Drop your image here</h3>
                <p>or click to browse files</p>
                <p className="upload-hint">Supports JPG, PNG, GIF up to 10MB</p>
              </div>
            ) : (
              <div className="file-preview">
                <img src={preview} alt="Preview" className="preview-image" />
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {selectedFile && (
            <div className="upload-actions">
              <button onClick={processImage} disabled={processing} className="process-btn">
                {processing ? 'Processing...' : 'Analyze Image'}
              </button>
              <button onClick={resetUpload} className="reset-btn">
                Choose Different Image
              </button>
            </div>
          )}
        </div>

        {processing && (
          <div className="processing-section">
            <LoadingSpinner />
            <p>Analyzing image for deepfake content...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <div className="error-message">{error}</div>
          </div>
        )}

        {result && (
          <div className="results-section">
            <div className="result-card">
              <div className="result-header">
                <h3>Analysis Results</h3>
                <div className={`status-badge ${result.isDeepfake ? 'deepfake' : 'authentic'}`}>
                  {result.isDeepfake ? '⚠️ Deepfake Detected' : '✅ Authentic Image'}
                </div>
              </div>

              <div className="result-details">
                <div className="confidence-meter">
                  <label>Confidence Level</label>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="confidence-text">{(result.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="processing-time">
                  <span>Processing Time: {result.processingTime}ms</span>
                </div>
              </div>

              {result.regeneratedImage && (
                <div className="regenerated-section">
                  <h4>🔄 Regenerated Authentic Image</h4>
                  <div className="image-comparison">
                    <div className="comparison-item">
                      <h5>Original (Deepfake)</h5>
                      <img src={preview} alt="Original" />
                    </div>
                    <div className="comparison-arrow">→</div>
                    <div className="comparison-item">
                      <h5>Regenerated (Authentic)</h5>
                      <img 
                        src={`http://localhost:5000${result.regeneratedImage}`} 
                        alt="Regenerated" 
                      />
                    </div>
                  </div>
                  <button 
                    className="download-btn"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `http://localhost:5000${result.regeneratedImage}`;
                      link.download = 'regenerated_image.jpg';
                      link.click();
                    }}
                  >
                    Download Regenerated Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="features-section">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Advanced Detection</h3>
              <p>Our AI model analyzes facial features, inconsistencies, and artifacts to identify deepfakes with high accuracy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Image Regeneration</h3>
              <p>When deepfakes are detected, our regeneration model creates an authentic version of the original person.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Real-time Processing</h3>
              <p>Get results in seconds with our optimized deep learning pipeline and efficient processing algorithms.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Secure & Private</h3>
              <p>Your images are processed securely and not stored permanently. Privacy and data protection are our priorities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
