import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { validateEmail } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await authAPI.forgotPassword(formData.email);
      setSuccess('Reset code sent to your email');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess('Password reset successfully! You can now login.');
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {step === 'email' && (
          <>
            <div className="auth-header">
              <h1>Forgot Password</h1>
              <p>Enter your email to receive a reset code</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <button type="submit" className="auth-btn">
                Send Reset Code
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="auth-header">
              <h1>Enter Reset Code</h1>
              <p>Check your email for the 6-digit code</p>
            </div>

            <form onSubmit={handleResetSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Reset Code</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                />
              </div>

              <button type="submit" className="auth-btn">
                Reset Password
              </button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been reset successfully.</p>
            <Link to="/login" className="auth-btn">
              Go to Login
            </Link>
          </div>
        )}

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
