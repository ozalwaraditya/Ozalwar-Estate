import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRouter = () => {
  const currentUser = useSelector((state) => state.user.currentUser);

  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRouter;
