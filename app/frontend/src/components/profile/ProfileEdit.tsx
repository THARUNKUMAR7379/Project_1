import React, { useState, useRef } from 'react';
import { mockProfile, mockUser } from './mockProfileData';
import { FaEnvelope, FaPhone, FaUserEdit, FaUpload } from 'react-icons/fa';
import type { Profile } from '../../types';

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const ProfileEdit: React.FC = () => {
  const [form, setForm] = useState({
    name: mockUser.name,
    email: mockUser.email,
    location: mockProfile.location,
    bio: mockProfile.bio,
    skills: mockProfile.skills.join(', '),
    phone: '',
    avatar: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle'|'success'|'error'>('idle');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time validation
  const validate = (field: string, value: string) => {
    let err = '';
    if (field === 'name' && !value.trim()) err = 'Name is required.';
    if (field === 'email' && !validateEmail(value)) err = 'Invalid email.';
    if (field === 'skills' && !value.trim()) err = 'At least one skill required.';
    setErrors((prev: any) => ({ ...prev, [field]: err }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    validate(name, value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(10);
      reader.onprogress = () => setUploadProgress(60);
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
        setUploadProgress(100);
      };
      reader.onerror = () => setUploadProgress(0);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(10);
      reader.onprogress = () => setUploadProgress(60);
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
        setUploadProgress(100);
      };
      reader.onerror = () => setUploadProgress(0);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    // Simulate async submit
    setTimeout(() => {
      if (!form.name || !validateEmail(form.email) || !form.skills) {
        setSubmitStatus('error');
        setSubmitting(false);
        return;
      }
      setSubmitStatus('success');
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="max-w-3xl mx-auto p-4 font-sans">
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10" 
              style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><FaUserEdit className="text-cyan-400" /> Edit Profile</h2>
          {/* Avatar Upload */}
          <div className="mb-6 flex flex-col md:flex-row items-center gap-6">
            <div
              className="w-28 h-28 rounded-full border-4 border-cyan-400/30 shadow-lg bg-gradient-to-tr from-cyan-200 to-blue-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              title="Click or drag to upload"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.name}`} alt="avatar" className="w-full h-full object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
              <div className="absolute bottom-0 left-0 w-full bg-black/70 text-cyan-400 text-xs py-1 flex items-center justify-center gap-1"><FaUpload /> Upload</div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center text-cyan-400 text-xs">Uploading... {uploadProgress}%</div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-white">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={() => setTouched((prev: any) => ({ ...prev, name: true }))}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${errors.name && touched.name ? 'border-pink-500' : 'border-white/20'}`}
                  placeholder="Your name"
                />
                {errors.name && touched.name && <div className="text-pink-400 text-xs mt-1">{errors.name}</div>}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-white">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => setTouched((prev: any) => ({ ...prev, email: true }))}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${errors.email && touched.email ? 'border-pink-500' : 'border-white/20'}`}
                  placeholder="Email address"
                />
                {errors.email && touched.email && <div className="text-pink-400 text-xs mt-1">{errors.email}</div>}
              </div>
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-white">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="City, Country"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-white">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-white">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white min-h-[60px]"
              placeholder="Tell us about yourself"
            />
          </div>
          {/* Skills */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-white">Skills *</label>
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              onBlur={() => setTouched((prev: any) => ({ ...prev, skills: true }))}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${errors.skills && touched.skills ? 'border-pink-500' : 'border-white/20'}`}
              placeholder="Comma separated (e.g. React, Node.js)"
            />
            {errors.skills && touched.skills && <div className="text-pink-400 text-xs mt-1">{errors.skills}</div>}
          </div>
          {/* Submit Status */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg text-green-400 text-center">
              Profile updated successfully!
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-4 p-3 bg-pink-500/20 border border-pink-400/30 rounded-lg text-pink-400 text-center">
              Please fix the errors above.
            </div>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 