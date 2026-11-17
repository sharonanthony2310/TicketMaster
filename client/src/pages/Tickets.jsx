
import { useEffect, useState } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  AlertCircle,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

import { Link } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
  title: '',
  description: '',
  type: 'bug',
  priority: 'medium',
  status: 'todo',
  project: '',
  assignee: '',
  dueDate: ''
};

const priorityStyles = {
  low: 'text-gray-400 bg-gray-500/10',
  medium: 'text-blue-400 bg-blue-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  critical: 'text-red-400 bg-red-500/10'
};

const statusStyles = {
  todo: 'text-gray-400 bg-gray-500/10',
  'in-progress': 'text-violet-400 bg-violet-500/10',
  done: 'text-emerald-400 bg-emerald-500/10'
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const selectedProject = projects.find(
    project => project._id === formData.project
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectResponse, ticketResponse] = await Promise.all([
        api.getProjects(),
        api.getTickets()
      ]);

      setProjects(projectResponse.projects);
      setTickets(ticketResponse.tickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTicket(null);

    setFormData({
      ...initialForm,
      project: projectFilter || projects[0]?._id || ''
    });

    setShowModal(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);

    setFormData({
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      project: ticket.project?._id || '',
      assignee: ticket.assignee?._id || '',
      dueDate: ticket.dueDate
        ? new Date(ticket.dueDate).toISOString().slice(0, 10)
        : ''
    });

    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(previous => ({
      ...previous,
      [name]: value,
      ...(name === 'project' ? { assignee: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...formData,
        assignee: formData.assignee || null,
        dueDate: formData.dueDate || null
      };

      if (editingTicket) {
        await api.updateTicket(editingTicket._id, payload);
      } else {
        await api.createTicket(payload);
      }

      setShowModal(false);
      setEditingTicket(null);
      setFormData(initialForm);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ticket) => {
    const confirmed = window.confirm(
      `Delete "${ticket.title}"?`
    );

    if (!confirmed) return;

    try {
      setError('');
      await api.deleteTicket(ticket._id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter || ticket.status === statusFilter;

    const matchesPriority =
      !priorityFilter || ticket.priority === priorityFilter;

    const matchesProject =
      !projectFilter || ticket.project?._id === projectFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesProject
    );
  });

  const formatStatus = (status) => {
    const labels = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      done: 'Done'
    };

    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-3">
          <Ticket className="text-violet-400" size={22} />

          <span className="font-bold text-lg">
            Ticket<span className="text-violet-400">Master</span>
          </span>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Workspace / Issues
            </p>

            <h1 className="text-3xl font-bold">
              Issues & Tickets
            </h1>

            <p className="text-gray-400 text-sm mt-2">
              Track bugs, tasks and feature requests.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            disabled={projects.length === 0}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-3 rounded-lg text-sm font-medium"
          >
            <Plus size={18} />
            Create ticket
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-[#09090b] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="bg-[#09090b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 outline-none"
            >
              <option value="">All projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#09090b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 outline-none"
            >
              <option value="">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-[#09090b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 outline-none"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold">All tickets</h2>

            <span className="text-xs text-gray-500">
              {filteredTickets.length} results
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <LoaderCircle className="animate-spin" size={20} />
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20 px-5">
              <Ticket size={35} className="text-violet-400 mx-auto mb-4" />

              <h3 className="font-semibold text-lg">
                No tickets found
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Create a ticket or change your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[950px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500 uppercase">
                    <th className="px-5 py-4 font-medium">Ticket</th>
                    <th className="px-5 py-4 font-medium">Project</th>
                    <th className="px-5 py-4 font-medium">Type</th>
                    <th className="px-5 py-4 font-medium">Priority</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Assignee</th>
                    <th className="px-5 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr
                      key={ticket._id}
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="font-medium text-sm hover:text-violet-400"
                        >
                          {ticket.title}
                        </Link>

                        <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {ticket.description}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-400">
                        {ticket.project?.name}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-300 capitalize">
                          {ticket.type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${priorityStyles[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyles[ticket.status]}`}>
                          {formatStatus(ticket.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-400">
                        {ticket.assignee?.name || 'Unassigned'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tickets/${ticket._id}`}
                            title="View details and comments"
                            className="p-2 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-white/5"
                          >
                            <MessageCircle size={16} />
                          </Link>

                          <button
                            onClick={() => openEditModal(ticket)}
                            title="Edit ticket"
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(ticket)}
                            title="Delete ticket"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#15151b] border border-white/10 rounded-2xl p-6 my-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingTicket ? 'Edit ticket' : 'Create a ticket'}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Provide details about the issue.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Ticket title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Login button not responding"
                  maxLength={150}
                  required
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue or task..."
                  maxLength={3000}
                  rows={4}
                  required
                  className="w-full resize-none bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Project
                  </label>

                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    required
                    disabled={Boolean(editingTicket)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-60"
                  >
                    <option value="">Select project</option>

                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Issue type
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none"
                  >
                    <option value="bug">Bug</option>
                    <option value="task">Task</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Assignee
                  </label>

                  <select
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none"
                  >
                    <option value="">Unassigned</option>

                    {selectedProject?.members?.map(member => (
                      <option
                        key={member.user._id}
                        value={member.user._id}
                      >
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Due date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium rounded-lg"
                >
                  {saving
                    ? 'Saving...'
                    : editingTicket
                      ? 'Save changes'
                      : 'Create ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
