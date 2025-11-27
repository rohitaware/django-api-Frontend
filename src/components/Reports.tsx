import { useState } from 'react';
import { Search, Download, Filter, Trash2 } from 'lucide-react';
import apiClient from '../api/axios';
import { AddMessageForm } from './AddMessageForm';

interface ReportData {
  id: number;
  date: string;
  message: string;
  user: string;
}

interface PaginatedReportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReportData[];
}

export const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);

  const handleSearch = async (page = 1) => {
    setIsLoading(true);
    setShowResults(true);
    setCurrentPage(page);
    try {
      // The backend endpoint is still /messages/, but we present it as "Reports" on the frontend.
      const response = await apiClient.get<PaginatedReportResponse>('/messages/', {
        params: {
          page,
          ...(fromDate && { from_date: fromDate }),
          ...(toDate && { to_date: toDate }),
        },
      });
      setReportData(response.data.results);
      setTotalResults(response.data.count);
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    // Optional: Ask for confirmation
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    try {
      await apiClient.delete(`/messages/${messageId}/`);
      // Remove the message from the local state to update the UI instantly
      setReportData((prevData) => prevData.filter((report) => report.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      // You could show an error toast here
      alert('You do not have permission to delete this message.');
    }
  };

  return (
    <div className="p-4 pt-20 lg:pt-8 lg:p-8">
      
      <AddMessageForm onMessageAdded={() => handleSearch(currentPage)} />

      <div className="mb-8">
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-2">Search and analyze your data</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-bold text-gray-900">Filter Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleSearch(1)}
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-sky-300 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {showResults && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading data...</td></tr>
                ) : reportData.length > 0 ? (
                  reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{row.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 transition" title="Delete message">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No results found. Perform a search to see data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{reportData.length}</span> of <span className="font-semibold text-gray-900">{totalResults}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSearch(currentPage - 1)}
                disabled={!prevPageUrl || isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleSearch(currentPage + 1)}
                disabled={!nextPageUrl || isLoading}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};