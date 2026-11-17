
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  LayoutDashboard,
  FolderKanban,
  Settings,
  Plus,
  Search,
  LogOut,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Folder,
  Users,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationBell from '../components/NotificationBell';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.getProjects();
      setProjects(response.projects || []);
    } catch (err) {
      setError(err.message || 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name,
      description: project.description || ''
    });

    setShowModal(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingProject) {
        await api.updateProject(editingProject._id, formData);
      } else {
        await api.createProject(formData);
      }

      closeModal();
      await fetchProjects();
    } catch (err) {
      setError(err.message || 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await api.deleteProject(projectId);

      setProjects((previous) =>
        previous.filter((project) => project._id !== projectId)
      );

      setActiveMenu(null);
    } catch (err) {
      setError(err.message || 'Unable to delete project.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalMembers = projects.reduce(
    (total, project) => total + (project.members?.length || 0),
    0
  );

  const activeProjects = projects.filter(
    (project) => project.status === 'active'
  ).length;

  const navigationLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/tickets',
      label: 'Issues',
      icon: Ticket
    },
    {
      to: '/board',
      label: 'Board',
      icon: FolderKanban
    },
    {
      to: '/team',
      label: 'Team',
      icon: Users
    },
    {
      to: '/analytics',
      label: 'Analytics',
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0c0c0f] p-5 md:flex">

          {/* TicketMaster Branding */}
          <Link to="/dashboard" className="mb-10 flex items-center gap-3">
            <Ticket className="text-violet-400" size={25} />

            <span className="text-lg font-bold">
              Ticket<span className="text-violet-400">Master</span>
            </span>
          </Link>

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigationLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === '/dashboard';

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-violet-600/15 font-medium text-violet-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Preferences
            </p>

            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>

          {/* User Profile */}
          <div className="mt-auto border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20 font-semibold text-violet-400">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user?.name || 'User'}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">

          {/* Header */}
          <header className="border-b border-white/10 px-5 py-5 md:px-8">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3 md:hidden">
                <Ticket className="text-violet-400" size={23} />

                <span className="text-lg font-bold">
                  Ticket<span className="text-violet-400">Master</span>
                </span>
              </div>

              <div className="hidden md:block">
                <h2 className="text-xl font-semibold">Dashboard</h2>

                <p className="text-sm text-gray-500">
                  Manage your projects and issues
                </p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                {/* Notification Bell */}
                <NotificationBell />

                <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-violet-600/20 font-semibold text-violet-400 md:flex">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 md:hidden"
                  title="Logout"
                >
                  <LogOut size={19} />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="mt-5 flex gap-5 overflow-x-auto pb-1 md:hidden">
              {navigationLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex shrink-0 items-center gap-2 text-sm ${
                      item.to === '/dashboard'
                        ? 'font-medium text-violet-400'
                        : 'text-gray-400'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}

              <Link
                to="/settings"
                className="flex shrink-0 items-center gap-2 text-sm text-gray-400"
              >
                <Settings size={16} />
                Settings
              </Link>
            </nav>
          </header>

          <div className="p-5 md:p-8">

            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold md:text-3xl">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Here's what's happening in your workspace.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span>{error}</span>

                <button onClick={() => setError('')}>
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Statistics */}
            <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Total Projects
                  </span>

                  <Folder className="text-violet-400" size={20} />
                </div>

                <p className="text-3xl font-bold">{projects.length}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Projects in your workspace
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Active Projects
                  </span>

                  <CheckCircle2 className="text-emerald-400" size={20} />
                </div>

                <p className="text-3xl font-bold">{activeProjects}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Currently active
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:col-span-2 xl:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Project Memberships
                  </span>

                  <Users className="text-blue-400" size={20} />
                </div>

                <p className="text-3xl font-bold">{totalMembers}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Total member entries across projects
                </p>
              </div>

            </div>

            {/* Projects */}
            <section>
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold">Your Projects</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create and manage your projects
                  </p>
                </div>

                <button
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500"
                >
                  <Plus size={18} />
                  Create Project
                </button>
              </div>

              <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#111114] px-4 py-3">
                <Search size={18} className="text-gray-500" />

                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                />
              </div>

              {loading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#111114] px-5 py-14 text-center">
                  <Folder
                    size={30}
                    className="mx-auto mb-4 text-violet-400"
                  />

                  <h3 className="text-lg font-semibold">
                    {search ? 'No matching projects' : 'No projects yet'}
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                    {search
                      ? 'Try searching with a different project name.'
                      : 'Create your first project to start organizing and tracking issues.'}
                  </p>

                  {!search && (
                    <button
                      onClick={openCreateModal}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500"
                    >
                      <Plus size={17} />
                      Create your first project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <div
                      key={project._id}
                      className="group relative rounded-2xl border border-white/10 bg-[#111114] p-5 transition hover:border-violet-500/40"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                          <FolderKanban size={21} />
                        </div>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === project._id
                                  ? null
                                  : project._id
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
                          >
                            <MoreVertical size={19} />
                          </button>

                          {activeMenu === project._id && (
                            <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-white/10 bg-[#1a1a20] p-1 shadow-xl">
                              <button
                                onClick={() => openEditModal(project)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                              >
                                <Pencil size={15} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(project._id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold">
                        {project.name}
                      </h3>

                      <p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">
                        {project.description || 'No description provided.'}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users size={15} />
                          {project.members?.length || 0} members
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            project.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {project.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151519] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingProject ? 'Edit Project' : 'Create Project'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingProject
                    ? 'Update your project details.'
                    : 'Add a new project to your workspace.'}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Project Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Website Redesign"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c0f] px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value
                    })
                  }
                  placeholder="What is this project about?"
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0c0c0f] px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingProject
                      ? 'Save Changes'
                      : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
