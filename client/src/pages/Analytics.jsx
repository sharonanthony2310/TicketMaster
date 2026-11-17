
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  ArrowLeft,
  FolderKanban,
  CircleCheck,
  Clock3,
  ListTodo,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import api from '../services/api';

const STATUS_COLORS = ['#71717a', '#8b5cf6', '#10b981'];
const PRIORITY_COLORS = ['#71717a', '#3b82f6', '#f97316', '#ef4444'];

const Analytics = () => {
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectResponse, ticketResponse] = await Promise.all([
        api.getProjects(),
        api.getTickets()
      ]);

      setProjects(projectResponse.projects || []);
      setTickets(ticketResponse.tickets || []);
    } catch (err) {
      setError(err.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalProjects = projects.length;
  const totalTickets = tickets.length;

  const todoTickets = tickets.filter(
    ticket => ticket.status === 'todo'
  ).length;

  const inProgressTickets = tickets.filter(
    ticket => ticket.status === 'in-progress'
  ).length;

  const completedTickets = tickets.filter(
    ticket => ticket.status === 'done'
  ).length;

  const criticalTickets = tickets.filter(
    ticket => ticket.priority === 'critical'
  ).length;

  const statusData = [
    { name: 'To Do', value: todoTickets },
    { name: 'In Progress', value: inProgressTickets },
    { name: 'Done', value: completedTickets }
  ];

  const priorityData = [
    {
      name: 'Low',
      value: tickets.filter(ticket => ticket.priority === 'low').length
    },
    {
      name: 'Medium',
      value: tickets.filter(ticket => ticket.priority === 'medium').length
    },
    {
      name: 'High',
      value: tickets.filter(ticket => ticket.priority === 'high').length
    },
    {
      name: 'Critical',
      value: criticalTickets
    }
  ];

  const projectData = projects.map(project => {
    const projectTickets = tickets.filter(
      ticket => ticket.project?._id === project._id
    );

    return {
      name: project.name.length > 16
        ? `${project.name.slice(0, 16)}...`
        : project.name,
      total: projectTickets.length,
      completed: projectTickets.filter(
        ticket => ticket.status === 'done'
      ).length
    };
  });

  const completionRate = totalTickets > 0
    ? Math.round((completedTickets / totalTickets) * 100)
    : 0;

  const StatCard = ({ title, value, description, icon: Icon }) => (
    <div className="rounded-xl border border-white/10 bg-[#121216] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon className="text-violet-400" size={20} />
      </div>

      <h2 className="text-3xl font-bold">{value}</h2>

      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <Ticket className="text-violet-400" size={22} />
          <span className="text-lg font-bold">
            Ticket<span className="text-violet-400">Master</span>
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-violet-400">
              Workspace / Analytics
            </p>

            <h1 className="text-3xl font-bold">
              Project Analytics
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Understand project progress and ticket distribution.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh data
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading analytics...
          </div>
        ) : (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Projects"
                value={totalProjects}
                description="Projects you can access"
                icon={FolderKanban}
              />

              <StatCard
                title="Total Tickets"
                value={totalTickets}
                description="Tickets across your projects"
                icon={Ticket}
              />

              <StatCard
                title="In Progress"
                value={inProgressTickets}
                description="Tickets currently being worked on"
                icon={Clock3}
              />

              <StatCard
                title="Completed"
                value={completedTickets}
                description="Tickets marked as done"
                icon={CircleCheck}
              />
            </section>

            <section className="mb-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-[#121216] p-5 lg:col-span-2">
                <h2 className="font-semibold">Ticket status overview</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Distribution of tickets by current status.
                </p>

                <div className="mt-5 h-72">
                  {totalTickets === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No ticket data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="48%"
                          outerRadius={95}
                          innerRadius={55}
                          paddingAngle={4}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={STATUS_COLORS[index]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#121216] p-5">
                <h2 className="font-semibold">Completion rate</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Percentage of tickets completed.
                </p>

                <div className="flex h-72 flex-col items-center justify-center">
                  <div
                    className="flex h-40 w-40 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#8b5cf6 ${completionRate}%, #27272a ${completionRate}% 100%)`
                    }}
                  >
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#121216]">
                      <div className="text-center">
                        <p className="text-3xl font-bold">
                          {completionRate}%
                        </p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-gray-400">
                    {completedTickets} of {totalTickets} tickets completed
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#121216] p-5">
                <h2 className="font-semibold">Priority distribution</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Number of tickets in each priority level.
                </p>

                <div className="mt-5 h-72">
                  {totalTickets === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No priority data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="48%"
                          outerRadius={95}
                          paddingAngle={4}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PRIORITY_COLORS[index]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#121216] p-5">
                <h2 className="font-semibold">Project performance</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Total and completed tickets per project.
                </p>

                <div className="mt-5 h-72">
                  {projectData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No project data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={projectData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                      >
                        <CartesianGrid
                          stroke="#27272a"
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#71717a"
                          tick={{ fontSize: 11 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          stroke="#71717a"
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />

                        <Legend />

                        <Bar
                          dataKey="total"
                          name="Total tickets"
                          fill="#8b5cf6"
                          radius={[5, 5, 0, 0]}
                        />

                        <Bar
                          dataKey="completed"
                          name="Completed"
                          fill="#10b981"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#121216] p-5">
              <h2 className="font-semibold">Ticket summary</h2>

              <p className="mt-1 text-sm text-gray-500">
                Current ticket counts by status.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-400">
                    <ListTodo size={17} />
                    <span className="text-sm">To Do</span>
                  </div>
                  <p className="text-2xl font-bold">{todoTickets}</p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-violet-400">
                    <Clock3 size={17} />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold">{inProgressTickets}</p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-emerald-400">
                    <CircleCheck size={17} />
                    <span className="text-sm">Done</span>
                  </div>
                  <p className="text-2xl font-bold">{completedTickets}</p>
                </div>
              </div>

              <p className="mt-5 text-sm text-gray-500">
                Critical priority tickets: {criticalTickets}
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
