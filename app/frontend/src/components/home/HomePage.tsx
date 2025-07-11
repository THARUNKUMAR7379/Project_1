import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => (
  <div className="max-w-2xl mx-auto p-8 flex flex-col items-center gap-8">
    <h1 className="text-3xl font-bold text-cyan-600 mb-6">Welcome to ProNet!</h1>
    <div className="flex flex-col gap-4 w-full">
      <Link to="/posts/create" className="block bg-blue-600 text-white px-6 py-4 rounded-lg text-xl font-semibold text-center shadow hover:bg-blue-700 transition">Create Post</Link>
      <Link to="/profile" className="block bg-cyan-600 text-white px-6 py-4 rounded-lg text-xl font-semibold text-center shadow hover:bg-cyan-700 transition">Profile</Link>
      <Link to="/posts" className="block bg-green-600 text-white px-6 py-4 rounded-lg text-xl font-semibold text-center shadow hover:bg-green-700 transition">View Posts (Feed)</Link>
    </div>
  </div>
);

export default HomePage; 