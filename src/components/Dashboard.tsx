import { useState, useEffect } from 'react';
import { Users, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/axios';

interface DashboardStats {
  totalUsers: number;
  todayMessages: number;
  monthMessages: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const user = useAuthStore((state) => state.user);
  const recentActivity: any[] = [];
  const quickStats: any[] = [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get<DashboardStats>('/dashboard-stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 pt-20 lg:pt-8 lg:p-8">
      {/* The pt-20 on mobile ensures the title is below the fixed hamburger menu button */}
      <div className="mb-8">
        {/* Responsive text size for the main heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, <span className="font-semibold text-sky-600">{user ? user.username : '...'}</span>! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <Link to="/users" className="block hover:scale-105 transition-transform duration-300">
          <div className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-2xl p-6 text-white shadow-lg h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-1">Total Users</h3>
            <p className="text-4xl font-bold">{stats ? stats.totalUsers : ''}</p>
          </div>
        </Link>

        {/* Today Messages */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-medium opacity-90 mb-1">Today Messages</h3>
          <p className="text-4xl font-bold">{stats ? stats.todayMessages : '...'}</p>
        </div>

        {/* Month Messages */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-medium opacity-90 mb-1">Month Messages</h3>
          <p className="text-4xl font-bold">{stats ? stats.monthMessages : '...'}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <p className="text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {quickStats.length === 0 && (
              <p className="text-gray-500">No quick stats available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
