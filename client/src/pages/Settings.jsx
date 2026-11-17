
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  LayoutDashboard,
  FolderKanban,
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Monitor,
  LogOut,
  Save,
  Lock,
  Users,
  BarChart3
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setProfileMessage('');
    setProfileError('');

    try {
      setProfileLoading(true);

      await api.updateProfile({
        name: profile.name,
        email: profile.email
      });

      setProfileMessage('Profile updated successfully.');

      window.location.reload();
    } catch (err) {
      setProfileError(err.message || 'Unable to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (password.newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });

      setPasswordMessage(
        response.message || 'Password changed successfully.'
      );

      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(err.message || 'Unable to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

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

      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <Ticket className="text-violet-400" size={22} />

          <span className="text-lg font-bold">
            Ticket<span className="text-violet-400">Master</span>
          </span>
        </Link>

        <span className="text-sm text-gray-500">
          Account Settings
        </span>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 md:grid-cols-[230px_1fr] md:px-8">

        {/* Sidebar */}
        <aside>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigationLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-xl bg-violet-600/15 px-4 py-3 text-sm font-medium text-violet-400"
            >
              <SettingsIcon size={18} />
              Settings
            </Link>
          </nav>

          {/* User Profile */}
          <div className="mt-8 border-t border-white/10 pt-5">
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

        {/* Settings Content */}
        <main>
          <div className="mb-8">
            <p className="mb-2 text-sm text-gray-500">
              Workspace / Settings
            </p>

            <h1 className="text-3xl font-bold">Settings</h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your account and application preferences.
            </p>
          </div>

          {/* Profile Settings */}
          <section className="mb-6 rounded-2xl border border-white/10 bg-[#111114] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                <User size={21} />
              </div>

              <div>
                <h2 className="font-semibold">Profile Information</h2>

                <p className="text-xs text-gray-500">
                  Update your personal account details.
                </p>
              </div>
            </div>

            {profileMessage && (
              <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
              >
                <Save size={17} />
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>

          {/* Password Settings */}
          <section className="mb-6 rounded-2xl border border-white/10 bg-[#111114] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="font-semibold">Change Password</h2>

                <p className="text-xs text-gray-500">
                  Update your account password securely.
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Current Password
                </label>

                <input
                  type="password"
                  value={password.currentPassword}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      currentPassword: e.target.value
                    })
                  }
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  New Password
                </label>

                <input
                  type="password"
                  value={password.newPassword}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      newPassword: e.target.value
                    })
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={password.confirmPassword}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      confirmPassword: e.target.value
                    })
                  }
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
              >
                <Lock size={17} />
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </section>

          {/* Appearance */}
          <section className="mb-6 rounded-2xl border border-white/10 bg-[#111114] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                <Monitor size={21} />
              </div>

              <div>
                <h2 className="font-semibold">Appearance</h2>

                <p className="text-xs text-gray-500">
                  Application display preferences.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#09090b] p-4">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>

                <p className="mt-1 text-xs text-gray-500">
                  TicketMaster currently uses a dark interface.
                </p>
              </div>

              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
                Enabled
              </span>
            </div>
          </section>

          {/* App Information */}
          <section className="rounded-2xl border border-white/10 bg-[#111114] p-6">
            <h2 className="mb-4 font-semibold">
              Application Information
            </h2>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Application</span>
              <span className="text-gray-300">TicketMaster</span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">Version</span>
              <span className="text-gray-300">1.0.0</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Settings;
