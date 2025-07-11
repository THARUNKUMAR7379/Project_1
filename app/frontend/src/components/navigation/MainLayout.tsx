import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './Navbar';

const MainLayout: React.FC = () => (
  <>
    <Outlet />
    <BottomNav />
  </>
);

export default MainLayout; 