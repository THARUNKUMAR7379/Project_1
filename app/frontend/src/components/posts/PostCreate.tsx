import React, { useState, useRef } from 'react';
import { postsApi } from './api';
import type { Post } from '../../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const res = await postsApi.createPost(content, mediaFile || undefined);
      if (res.success) {
        setSuccess('Post created successfully!');
        setContent('');
        handleRemoveMedia();
        if (onPostCreated) onPostCreated();
        setTimeout(() => navigate('/posts'), 1000); // Redirect after short delay
      } else {
        setError(res.message || 'Failed to create post.');
      }
    } catch (err: any) {
      // Try to extract error message from the response if available
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Post</h2>
        {!isLoggedIn() && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 text-sm">
            You must be logged in to create a post.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Post Content</label>
            <ReactQuill
              value={content}
              onChange={handleContentChange}
              placeholder="Write your post..."
              className="mb-2 bg-white rounded"
            />
            <p className="text-xs text-gray-400 mt-1">You can use formatting, links, and lists.</p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Media (optional)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,video/mp4,video/mov,video/webm"
              onChange={handleMediaChange}
              ref={fileInputRef}
              className="block mb-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mb-2">Max size: 10MB. Allowed: PNG, JPG, JPEG, MP4, MOV, WEBM.</p>
            {mediaPreview && (
              <div className="mb-2 flex flex-col items-start gap-2">
                {mediaFile && mediaFile.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded border" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded border" />
                )}
                <button type="button" onClick={handleRemoveMedia} className="text-red-500 text-xs underline">Remove</button>
              </div>
            )}
          </div>
          {error && <div className="text-red-600 text-sm font-medium animate-pulse">{error}</div>}
          {success && <div className="text-green-600 text-sm font-medium animate-fade-in">{success}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50"
            disabled={loading || !isLoggedIn()}
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Posting...</span>
            ) : 'Post'}
          </button>
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