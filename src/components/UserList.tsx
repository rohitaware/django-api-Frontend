import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import apiClient from '../api/axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface PaginatedUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setCurrentPage(page);
    try {
      const response = await apiClient.get<PaginatedUserResponse>('/users/', {
        params: { page },
      });
      setUsers(response.data.results);
      setTotalResults(response.data.count);
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  return (
    <div className="p-4 pt-20 lg:pt-8 lg:p-8">
      {/* The pt-20 on mobile ensures the title is below the fixed hamburger menu button */}
      <div className="mb-8">
        {/* Responsive text size for the main heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-2">Browse and manage system users.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
          <Users className="w-6 h-6 text-sky-500" />
          <h2 className="text-xl font-bold text-gray-900">All Users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={3} className="text-center py-10">Loading...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${user.first_name} ${user.last_name}`.trim() || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{users.length}</span> of <span className="font-semibold text-gray-900">{totalResults}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(currentPage - 1)}
              disabled={!prevPageUrl || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchUsers(currentPage + 1)}
              disabled={!nextPageUrl || isLoading}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};