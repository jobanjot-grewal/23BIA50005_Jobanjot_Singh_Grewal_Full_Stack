import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Activity, ShieldBan, ShieldAlert } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [analyticsRes, usersRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users?limit=50')
        ]);
        
        setAnalytics(analyticsRes.data.data.analytics);
        setUsers(usersRes.data.data.users);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await api.put(`/admin/users/${userId}/unblock`);
      } else {
        await api.put(`/admin/users/${userId}/block`);
      }
      
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
    } catch (error) {
      console.error('Failed to toggle block status', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-text-secondary text-sm">Overview of platform metrics and user management</p>
          </div>
          <Link to="/" className="text-primary hover:underline text-sm font-medium bg-surface px-4 py-2 rounded-lg border border-border shadow-sm">
            Return to App
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-text">{analytics?.totalUsers || 0}</h3>
            </div>
          </div>
          
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Active (24h)</p>
              <h3 className="text-2xl font-bold text-text">{analytics?.activeUsers || 0}</h3>
            </div>
          </div>
          
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Messages</p>
              <h3 className="text-2xl font-bold text-text">{analytics?.totalMessages || 0}</h3>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Blocked Users</p>
              <h3 className="text-2xl font-bold text-text">{analytics?.blockedUsers || 0}</h3>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-text">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background text-text-secondary text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                          {u.avatar ? <img src={u.avatar} alt="" /> : u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-text text-sm">{u.name}</div>
                          <div className="text-xs text-text-secondary">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {u._id !== user._id && u.role !== 'admin' && (
                        <button
                          onClick={() => handleBlockToggle(u._id, u.isBlocked)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                            u.isBlocked 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <ShieldBan className="w-4 h-4" />
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
