import React, { useState, useRef } from 'react';
import { postsApi } from './api';
import type { Post } from '../../types';
import SimpleEditor from '../shared/SimpleEditor';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../profile/api';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';

const MAX_MEDIA_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/webm'];

function isLoggedIn() {
  return Boolean(localStorage.getItem('token'));
}

interface PostCreateProps {
  onPostCreated?: () => void;
}

const PostCreate: React.FC<PostCreateProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !ALLOWED_VIDEO_TYPES.includes(file.type)
    ) {
      setError('Only PNG, JPG, JPEG images or MP4, MOV, WEBM videos are allowed.');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE_MB * 1024 * 1024) {
      setError('File too large. Max 10MB allowed.');
      return;
    }
    setMediaFile(file);
    setError(null);
    setMediaPreview(URL.createObjectURL(file));
  };

  // Drag-and-drop support
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        !ALLOWED_IMAGE_TYPES.includes(file.type) &&
        !ALLOWED_VIDEO_TYPES.includes(file.type)
      ) {
        setError('Only PNG, JPG, JPEG images or MP4, MOV, WEBM videos are allowed.');
        return;
      }
      if (file.size > MAX_MEDIA_SIZE_MB * 1024 * 1024) {
        setError('File too large. Max 10MB allowed.');
        return;
      }
      setMediaFile(file);
      setError(null);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!isLoggedIn()) {
      setError('You must be logged in to create a post.');
      return;
    }
    if (!content && !mediaFile) {
      setError('Post must have text or media.');
      return;
    }
    setLoading(true);
    try {
      const res = await postsApi.createPost(
        content, 
        mediaFile || undefined, 
        category || undefined, 
        tags.length > 0 ? tags : undefined, 
        visibility
      );
      if (res.success) {
        setSuccess('Post created successfully!');
        setContent('');
        setCategory('');
        setTags([]);
        setVisibility('public');
        handleRemoveMedia();
        if (onPostCreated) onPostCreated();
        setTimeout(() => navigate('/posts'), 1000); // Redirect after short delay
      } else {
        setError(res.message || 'Failed to create post.');
      }
    } catch (err: any) {
      if (err && err.response) {
        try {
          const data = await err.response.json();
          setError(data.message || 'Failed to create post. Please check your connection or login status.');
        } catch {
          setError('Failed to create post. Please check your connection or login status.');
        }
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Failed to create post. Please check your connection or login status.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Avatar logic
  const avatarUrl = profile?.avatar
    ? (profile?.avatar.startsWith('http') ? profile.avatar : `http://localhost:5000${profile.avatar}`)
    : profileApi.getDefaultAvatar(profile?.name || user?.username || 'User');
  const displayName = profile?.name || user?.username || 'User';

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 relative">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Create a Post</h2>
        {/* User avatar and name */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-12 h-12 rounded-full border object-cover bg-gray-200"
          />
          <div>
            <div className="font-semibold text-gray-900 text-lg">{displayName}</div>
            <div className="text-xs text-gray-400">Share your thoughts with your network</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <SimpleEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Start a post..."
              className="mb-2"
            />
          </div>

          {/* Category and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Technology, Travel, Food"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Drag-and-drop media upload area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50 transition relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            aria-label="Upload image or video"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,video/mp4,video/mov,video/webm"
              onChange={handleMediaChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="flex items-center gap-2 text-blue-600">
              <FaImage className="text-2xl" />
              <FaVideo className="text-2xl" />
              <span className="font-medium">Add image or video (drag & drop or click)</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Max size: 10MB. Allowed: PNG, JPG, JPEG, MP4, MOV, WEBM.</div>
            {mediaPreview && (
              <div className="mt-4 w-full flex flex-col items-center gap-2 relative">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemoveMedia(); }}
                  className="absolute top-0 right-0 text-red-500 bg-white rounded-full shadow p-1 hover:bg-red-50"
                  aria-label="Remove media"
                >
                  <FaTimes />
                </button>
                {mediaFile && mediaFile.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded border" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded border" />
                )}
              </div>
            )}
          </div>
          {/* Feedback messages */}
          {error && <div className="text-red-600 text-sm font-medium animate-pulse">{error}</div>}
          {success && <div className="text-green-600 text-sm font-medium animate-fade-in">{success}</div>}
          {/* Post button at bottom right */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50"
              disabled={loading || !isLoggedIn() || (!content && !mediaFile)}
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Posting...</span>
              ) : 'Post'}
            </button>
          </div>
        </form>
        {/* Preview Section */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Live Preview</h3>
          <div className="border rounded-xl p-5 bg-gray-50 min-h-[80px]">
            <div
              className="prose max-w-none text-gray-800"
              style={{ color: '#1F2937' }}
              dangerouslySetInnerHTML={{ __html: content || '<span class="text-gray-400">Nothing to preview.</span>' }}
            />
            {mediaPreview && (
              <div className="mt-3">
                {mediaFile && mediaFile.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded border" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded border" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreate; 