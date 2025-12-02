import { useState } from 'react';
import apiClient from '../api/axios';
import { Send } from 'lucide-react';

interface AddMessageFormProps {
  onMessageAdded: () => void; 
}

export const AddMessageForm = ({ onMessageAdded }: AddMessageFormProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post('/messages/', { message });
      setSuccess('Message sent successfully!');
      setMessage('');
      onMessageAdded(); 
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Send a New Message</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition mb-4"
          rows={3}
        />
        <button type="submit" disabled={isLoading} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-sky-300 disabled:cursor-not-allowed">
          <Send className="w-5 h-5" />
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
      </form>
    </div>
  );
};