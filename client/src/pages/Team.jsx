
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  LayoutDashboard,
  Ticket,
  KanbanSquare,
  Settings,
  LogOut,
  UserPlus,
  Trash2,
  RefreshCw,
  Shield,
  Mail
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const Team = () => {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [owner, setOwner] = useState(null);
  const [members, setMembers] = useState([]);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('ticketmaster_token')}`
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/projects`, {
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load projects.');
      }

      const projectList = Array.isArray(data)
        ? data
        : data.projects || [];

      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProject((current) => {
          if (current && projectList.some((p) => p._id === current)) {
            return current;
          }

          return projectList[0]._id;
        });
      } else {
        setSelectedProject('');
        setOwner(null);
        setMembers([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (projectId) => {
    if (!projectId) return;

    try {
      setError('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/teams/${projectId}/members`,
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load team members.');
      }

      setOwner(data.owner);
      setMembers(data.members || []);
    } catch (err) {
      setOwner(null);
      setMembers([]);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMembers(selectedProject);
    }
  }, [selectedProject]);

  const addMember = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Enter the email address of the person you want to add.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/teams/${selectedProject}/members`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            email: email.trim(),
            role
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not add team member.');
      }

      setEmail('');
      setRole('developer');
      setMessage('Team member added successfully.');

      await loadMembers(selectedProject);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (memberId, newRole) => {
    try {
      setError('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/teams/${selectedProject}/members/${memberId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ role: newRole })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update role.');
      }

      setMessage('Member role updated successfully.');
      await loadMembers(selectedProject);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeMember = async (memberId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this member from the project?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/teams/${selectedProject}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: getHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not remove member.');
      }

      setMessage('Team member removed successfully.');
      await loadMembers(selectedProject);
    } catch (err) {
      setError(err.message);
    }
  };

  const isOwner =
    owner?._id && user?._id &&
    owner._id.toString() === user._id.toString();

  const getInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-violet-500" />
          <span className="text-lg font-bold">
            Ticket<span className="text-violet-500">Master</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <Link to="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link to="/tickets" className="hover:text-white">
            Issues
          </Link>
          <Link to="/board" className="hover:text-white">
            Board
          </Link>
          <Link to="/team" className="text-violet-400">
            Team
          </Link>
          <Link to="/settings" className="hover:text-white">
            Settings
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 hover:text-red-400"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
            <Users size={16} />
            Project collaboration
          </div>

          <h1 className="text-3xl font-bold">Team Management</h1>

          <p className="mt-2 text-zinc-400">
            Manage project members, assign roles, and collaborate with your team.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            Loading your projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#18181b] p-10 text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
            <h2 className="text-xl font-semibold">No projects found</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create a project before managing its team.
            </p>
            <Link
              to="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500"
            >
              <LayoutDashboard size={16} />
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-xl border border-white/10 bg-[#18181b] p-5">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Select project
              </label>

              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500 md:max-w-md"
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </section>

            {isOwner && (
              <section className="mb-6 rounded-xl border border-white/10 bg-[#18181b] p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold">Add team member</h2>
                    <p className="text-sm text-zinc-400">
                      Add someone who already has a TicketMaster account.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={addMember}
                  className="grid gap-4 md:grid-cols-[1fr_180px_auto]"
                >
                  <div>
                    <label className="mb-2 block text-sm text-zinc-400">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="teammate@example.com"
                      className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-400">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                    >
                      <option value="manager">Manager</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      {saving ? 'Adding...' : 'Add member'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#18181b]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <h2 className="font-semibold">Project members</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {members.length + (owner ? 1 : 0)} people in this project
                  </p>
                </div>

                <button
                  onClick={() => loadMembers(selectedProject)}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                  title="Refresh team"
                >
                  <RefreshCw size={17} />
                </button>
              </div>

              <div className="divide-y divide-white/10">
                {owner && (
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/20 font-semibold text-violet-300">
                        {getInitials(owner.name)}
                      </div>

                      <div>
                        <p className="font-medium">
                          {owner.name}
                          {isOwner && (
                            <span className="ml-2 text-xs text-zinc-500">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-zinc-400">
                          <Mail size={13} />
                          {owner.email}
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                      <Shield size={13} />
                      Project Owner
                    </span>
                  </div>
                )}

                {members.map((member) => {
                  const memberUser = member.user;

                  if (!memberUser) return null;

                  return (
                    <div
                      key={memberUser._id}
                      className="flex flex-wrap items-center justify-between gap-4 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 font-semibold text-blue-300">
                          {getInitials(memberUser.name)}
                        </div>

                        <div>
                          <p className="font-medium">{memberUser.name}</p>
                          <p className="flex items-center gap-1 text-sm text-zinc-400">
                            <Mail size={13} />
                            {memberUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {isOwner ? (
                          <>
                            <select
                              value={member.role}
                              onChange={(event) =>
                                changeRole(memberUser._id, event.target.value)
                              }
                              className="rounded-lg border border-white/10 bg-[#09090b] px-3 py-2 text-sm outline-none focus:border-violet-500"
                            >
                              <option value="manager">Manager</option>
                              <option value="developer">Developer</option>
                              <option value="viewer">Viewer</option>
                            </select>

                            <button
                              onClick={() => removeMember(memberUser._id)}
                              className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10"
                              title="Remove member"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs capitalize text-zinc-300">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!owner && members.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    No team members found.
                  </div>
                )}
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Manager',
                  description: 'Can manage and update project tickets.',
                  color: 'text-violet-400'
                },
                {
                  title: 'Developer',
                  description: 'Can create and update project tickets.',
                  color: 'text-blue-400'
                },
                {
                  title: 'Viewer',
                  description: 'Can view project information.',
                  color: 'text-zinc-300'
                }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-[#18181b] p-5"
                >
                  <h3 className={`font-semibold ${item.color}`}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Team;
