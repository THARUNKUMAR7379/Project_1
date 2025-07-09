import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from './api';
import { FaEdit, FaSignOutAlt, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaStar, FaCalendarAlt, FaUpload } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import type { Profile } from '../../types';
// @ts-expect-error: If 'react-hot-toast' types are missing, this is a runtime import only.
import toast from 'react-hot-toast';

const ProfileView: React.FC = () => {
  const { user, profile, logout, profileLoading, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(profile?.banner || '');
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Banner upload logic
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG/PNG images allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max file size is 5MB.');
      return;
    }
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'banner');
      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        setBannerPreview(data.url);
        await updateProfile({ banner: data.url });
        await refreshProfile();
        toast.success('Banner updated!');
        } else {
        toast.error(data.message || 'Banner upload failed.');
      }
    } catch (err) {
      toast.error('Banner upload failed.');
    } finally {
      setBannerUploading(false);
    }
  };

  const onBannerDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Create a DataTransfer to simulate a file input event
      const dt = new DataTransfer();
      dt.items.add(file);
      const input = document.createElement('input');
      input.type = 'file';
      input.files = dt.files;
      const event = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleBannerChange(event);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onBannerDrop, accept: { 'image/jpeg': [], 'image/png': [] } });

  const getAvatarUrl = () => profile?.avatar || profileApi.getDefaultAvatar(profile?.name || user?.username || 'User');
  const getBannerUrl = () => bannerPreview || profile?.banner || '/default-banner.jpg';
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Prok – Professional Network</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/edit-profile')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              <FaEdit /> Edit Profile
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
              <FaSignOutAlt /> Logout
            </button>
          </div>
                  </div>
                </div>
      {/* Banner with upload */}
      <div className="relative group" {...getRootProps()}>
        <img src={getBannerUrl()} alt="Banner" className="w-full h-48 object-cover transition-opacity duration-200" style={{ opacity: bannerUploading ? 0.5 : 1 }} />
        <input type="file" accept="image/*" ref={bannerInputRef} className="hidden" onChange={handleBannerChange} {...getInputProps()} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <div className="flex flex-col items-center">
            <FaUpload className="text-2xl text-cyan-300 mb-1" />
            <span className="text-cyan-200 text-sm">{bannerUploading ? 'Uploading...' : 'Change Banner'}</span>
                  </div>
                  </div>
                </div>
      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
          <div>
            <img src={getAvatarUrl()} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-gray-900 object-cover bg-gray-700 -mt-24 mb-4" />
            <h1 className="text-3xl font-bold">{profile?.name || user.username}</h1>
            <p className="text-xl text-gray-300">{profile?.title || 'Professional'}</p>
            {profile?.location && <div className="flex items-center text-gray-400"><FaMapMarkerAlt className="mr-2" />{profile.location}</div>}
          </div>
              </div>
        {/* About */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaStar className="text-yellow-500" />About</h2>
          <p className="text-gray-300">{profile?.bio || 'No bio available.'}</p>
                </div>
        {/* Experience */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaBriefcase className="text-blue-500" />Experience</h2>
          {profile?.experiences?.length ? profile.experiences.map((exp, i) => (
            <div key={i} className="mb-4 border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-blue-400">{exp.company}</p>
              <p className="text-gray-400 text-sm flex items-center gap-2"><FaCalendarAlt className="text-xs" />{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
              {exp.description && <p className="text-gray-300 mt-2">{exp.description}</p>}
              </div>
          )) : <p className="text-gray-400">No experience added yet.</p>}
              </div>
        {/* Education */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaGraduationCap className="text-green-500" />Education</h2>
          {profile?.education?.length ? profile.education.map((edu, i) => (
            <div key={i} className="mb-4 border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold">{edu.school}</h3>
              <p className="text-green-400">{edu.degree} in {edu.field}</p>
              <p className="text-gray-400 text-sm flex items-center gap-2"><FaCalendarAlt className="text-xs" />{formatDate(edu.start_date)} - {formatDate(edu.end_date)}</p>
            </div>
          )) : <p className="text-gray-400">No education added yet.</p>}
                  </div>
        {/* Skills */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          {profile?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">{skill}</span>
              ))}
            </div>
          ) : <p className="text-gray-400">No skills added yet.</p>}
          </div>
        {/* Recent Activity Placeholder */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-gray-400">No recent activity yet. (Coming soon!)</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 