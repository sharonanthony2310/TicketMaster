
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Ticket,
  ArrowLeft,
  MessageCircle,
  Send,
  CalendarDays,
  User,
  AlertCircle,
  LoaderCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const TicketDetails = () => {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('ticketmaster_token')}`
  };

  const loadTicket = async () => {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not load ticket.');
    }

    setTicket(data.ticket || data);
  };

  const loadComments = async () => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not load comments.');
    }

    setComments(Array.isArray(data) ? data : data.comments || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadTicket(),
        loadComments()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const submitComment = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      setError('Please enter a comment.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch(`${API_URL}/comments/${id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          body: commentText.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not post comment.');
      }

      setCommentText('');
      setMessage('Comment posted successfully.');

      await loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const statusStyles = {
    todo: 'bg-gray-500/10 text-gray-300',
    'in-progress': 'bg-violet-500/10 text-violet-300',
    done: 'bg-emerald-500/10 text-emerald-300'
  };

  const priorityStyles = {
    low: 'text-gray-300',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-5 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <Ticket className="text-violet-400" size={22} />
          <span className="font-bold text-lg">
            Ticket<span className="text-violet-400">Master</span>
          </span>
        </Link>

        <Link
          to="/tickets"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Issues
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <LoaderCircle className="animate-spin" size={20} />
            Loading ticket...
          </div>
        ) : error && !ticket ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            <AlertCircle className="mb-2" size={20} />
            {error}
          </div>
        ) : ticket ? (
          <>
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">
                Workspace / Issues / Ticket Details
              </p>

              <h1 className="text-3xl font-bold">
                {ticket.title}
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                {ticket.project?.name || 'Project'}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <section className="rounded-xl border border-white/10 bg-[#121216] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs capitalize text-violet-300">
                    {ticket.type}
                  </span>

                  <span className={`rounded-full px-3 py-1 text-xs ${statusStyles[ticket.status] || ''}`}>
                    {ticket.status === 'in-progress'
                      ? 'In Progress'
                      : ticket.status === 'todo'
                        ? 'To Do'
                        : 'Done'}
                  </span>

                  <span className={`text-xs font-medium capitalize ${priorityStyles[ticket.priority] || ''}`}>
                    {ticket.priority} priority
                  </span>
                </div>
              </div>

              <div className="py-6">
                <h2 className="mb-3 font-semibold">Description</h2>

                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-400">
                  {ticket.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs text-gray-500">Reported by</p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User size={16} className="text-violet-400" />
                    {ticket.reporter?.name || 'Unknown'}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500">Assigned to</p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User size={16} className="text-violet-400" />
                    {ticket.assignee?.name || 'Unassigned'}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500">Due date</p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CalendarDays size={16} className="text-violet-400" />
                    {ticket.dueDate
                      ? new Date(ticket.dueDate).toLocaleDateString('en-IN')
                      : 'No due date'}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-300">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-white/10 bg-[#121216]">
              <div className="flex items-center gap-3 border-b border-white/10 p-5">
                <MessageCircle className="text-violet-400" size={20} />
                <div>
                  <h2 className="font-semibold">Discussion</h2>
                  <p className="text-xs text-gray-500">
                    {comments.length} comments
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-5">
                {comments.length === 0 ? (
                  <div className="py-8 text-center">
                    <MessageCircle className="mx-auto mb-3 text-gray-600" size={30} />
                    <p className="text-sm text-gray-400">
                      No comments yet.
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Start the discussion by adding the first comment.
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300">
                        {getInitials(comment.user?.name)}
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-white/5 bg-[#18181b] p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {comment.user?.name || 'Unknown user'}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={submitComment}
                className="border-t border-white/10 p-5"
              >
                <label className="mb-3 block text-sm font-medium">
                  Add a comment
                </label>

                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Share an update or ask a question..."
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">
                    {commentText.length}/2000 characters
                  </span>

                  <button
                    type="submit"
                    disabled={saving || !commentText.trim()}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={15} />
                    {saving ? 'Posting...' : 'Post comment'}
                  </button>
                </div>
              </form>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default TicketDetails;
