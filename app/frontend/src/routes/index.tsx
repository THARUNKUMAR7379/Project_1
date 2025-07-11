import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ForgotPassword from '../components/auth/ForgotPassword';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostsPage from '../components/posts/PostsPage';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import NotFound from '../components/NotFound';
import MainLayout from '../components/navigation/MainLayout';
import HomePage from '../components/home/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    element: <MainLayout />, // All main app pages use this layout
    children: [
      { path: '/profile', element: <ProfileView /> },
      { path: '/edit-profile', element: <ProfileEdit /> },
      { path: '/posts/create', element: <PostCreate /> },
      { path: '/posts', element: <PostsPage /> },
      { path: '/feed', element: <PostsPage /> },
      { path: '/jobs', element: <JobList /> },
      { path: '/messages', element: <MessageList /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]); 