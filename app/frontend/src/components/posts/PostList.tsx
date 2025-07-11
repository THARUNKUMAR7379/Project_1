import React, { useEffect, useState } from 'react';
import { postsApi } from './api';
import type { Post } from '../../types';

interface PostListProps {
  refreshKey?: number;
}

// Placeholder avatar generator
function getAvatarUrl(userId: number) {
  // You can replace this with a real avatar service or user profile data
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`;
}

const PostList: React.FC<PostListProps> = ({ refreshKey }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await postsApi.getPosts();
        if (res.success && Array.isArray(res.posts)) {
          setPosts(res.posts);
        } else if (Array.isArray(res)) {
          setPosts(res);
        } else {
          setError(res.message || 'Failed to load posts.');
        }
      } catch (err) {
        setError('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [refreshKey]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-6">
        {loading && <div className="text-gray-500">Loading posts...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="text-gray-400">No posts yet.</div>
        )}
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition group relative"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={getAvatarUrl(post.user_id)}
                alt="User avatar"
                className="w-10 h-10 rounded-full border border-gray-300 bg-gray-100"
              />
              <div>
                <div className="font-semibold text-gray-800">User #{post.user_id}</div>
                <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div
              className="prose max-w-none mb-3 text-gray-800"
              style={{ color: '#1F2937' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.media_url && post.media_type === 'image' && (
              <img
                src={`http://localhost:5000${post.media_url}`}
                alt="Post media"
                className="max-h-64 rounded-xl border mb-3"
                style={{ maxWidth: '100%' }}
              />
            )}
            {post.media_url && post.media_type === 'video' && (
              <video
                src={`http://localhost:5000${post.media_url}`}
                controls
                className="max-h-64 rounded-xl border mb-3"
                style={{ maxWidth: '100%' }}
              />
            )}
            {idx < posts.length - 1 && (
              <div className="absolute left-6 right-6 bottom-0 h-px bg-gray-100 group-hover:bg-gray-200 transition" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList; 