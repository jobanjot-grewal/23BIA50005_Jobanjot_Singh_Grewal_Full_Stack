import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text">Profile Settings</h1>
          <Link to="/" className="text-primary hover:underline text-sm font-medium">
            Back to Chat
          </Link>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-8 flex flex-col items-center border-b border-border">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-bold text-text">{user?.name}</h2>
            <p className="text-text-secondary">@{user?.username}</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-1">Email Address</h3>
              <p className="text-text font-medium">{user?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-1">Bio</h3>
              <p className="text-text">{user?.bio || 'No bio provided yet.'}</p>
            </div>
            
            <div className="pt-6 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors p-2 hover:bg-red-50 rounded-lg -ml-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
