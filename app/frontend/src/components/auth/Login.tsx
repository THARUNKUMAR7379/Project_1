import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ identifier?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errs: { identifier?: string; password?: string } = {};
    if (!form.identifier) errs.identifier = 'Required';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ identifier: true, password: true });
    setApiError('');
    setSuccess('');
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.identifier, // backend expects email
            password: form.password
          })
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          setSuccess('Login successful!');
          setApiError('');
          // Optionally redirect or update UI here
        } else {
          setApiError(data.message || 'Login failed');
        }
      } catch (err) {
        setApiError('Network error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/10 relative"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifier (username/email) */}
          <div className="relative">
            <input
              type="text"
              name="identifier"
              id="identifier"
              autoComplete="username"
              value={form.identifier}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.identifier && touched.identifier ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="identifier" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.identifier ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Email
            </label>
            {errors.identifier && touched.identifier && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.identifier}</span>
            )}
          </div>
          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.password && touched.password ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="password" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.password ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Password
            </label>
            {errors.password && touched.password && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.password}</span>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {apiError && <div className="text-pink-400 text-center mt-2">{apiError}</div>}
          {success && <div className="text-green-400 text-center mt-2">{success}</div>}
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 