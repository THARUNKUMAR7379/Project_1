import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileView from '../profile/ProfileView';
import PostCreate from '../posts/PostCreate';
import PostList from '../posts/PostList';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row justify-center gap-6 p-4">
      {/* Left Sidebar: Profile */}
      <aside className="hidden md:block md:w-1/4 lg:w-1/5">
        <div className="sticky top-6">
          <ProfileView />
        </div>
      </aside>

      {/* Center: Feed */}
      <main className="w-full md:w-2/4 lg:w-2/5 flex flex-col gap-6">
        <PostCreate />
        <PostList />
      </main>

      {/* Right Sidebar: Placeholder for news/stats */}
      <aside className="hidden lg:block lg:w-1/5">
        <div className="sticky top-6 bg-white rounded-xl shadow p-4 border border-gray-200 min-h-[200px]">
          {/* Add widgets like news, stats, suggestions here */}
          <div className="text-gray-400 text-center">Widgets coming soon...</div>
        </div>
      </aside>
    </div>
  );
};

export default HomePage; 