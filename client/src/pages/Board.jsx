
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  LayoutDashboard,
  Ticket,
  Plus,
  CalendarDays,
  AlertCircle,
  Circle,
  Clock,
  CheckCircle2
} from 'lucide-react';

import api from '../services/api';

const columns = [
  { id: 'todo', title: 'To Do', icon: Circle },
  { id: 'in-progress', title: 'In Progress', icon: Clock },
  { id: 'done', title: 'Done', icon: CheckCircle2 }
];

const priorityStyles = {
  low: 'bg-blue-500/10 text-blue-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-red-500/10 text-red-400'
};

function TicketCard({ ticket }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: ticket._id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-xl border border-white/10 bg-[#18181d] p-4 transition hover:border-violet-500/40 active:cursor-grabbing"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {ticket.type?.toUpperCase() || 'TASK'}
        </span>

        <span
          className={`rounded-full px-2 py-1 text-xs ${
            priorityStyles[ticket.priority] ||
            'bg-gray-500/10 text-gray-400'
          }`}
        >
          {ticket.priority || 'medium'}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-100">
        {ticket.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
        {ticket.description || 'No description provided.'}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Ticket size={13} />
          <span>{ticket.reporter?.name || 'Reporter'}</span>
        </div>

        {ticket.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarDays size={13} />
            {new Date(ticket.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

function BoardColumn({ column, tickets }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  });

  const Icon = column.icon;

  return (
    <div className="flex min-h-[450px] flex-col rounded-2xl border border-white/10 bg-[#101014]">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Icon
            size={17}
            className={
              column.id === 'todo'
                ? 'text-gray-400'
                : column.id === 'in-progress'
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
            }
          />

          <h2 className="text-sm font-semibold">{column.title}</h2>

          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-400">
            {tickets.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-3 p-3 transition ${
          isOver ? 'bg-violet-500/10' : ''
        }`}
      >
        {tickets.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-gray-600">
            Drop tickets here
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))
        )}
      </div>
    </div>
  );
}

const Board = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingTicket, setSavingTicket] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await api.getProjects();
        const projectList = response.projects || [];

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProject(projectList[0]._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Unable to load projects.');
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const loadTickets = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.getTickets({
          projectId: selectedProject
        });

        setTickets(response.tickets || []);
      } catch (err) {
        setError(err.message || 'Unable to load tickets.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [selectedProject]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const draggedTicket = tickets.find(
      (ticket) => ticket._id === active.id
    );

    if (!draggedTicket) return;

    let newStatus = columns.some((column) => column.id === over.id)
      ? over.id
      : tickets.find((ticket) => ticket._id === over.id)?.status;

    if (!newStatus || newStatus === draggedTicket.status) return;

    const previousTickets = [...tickets];

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket._id === active.id
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );

    try {
      setSavingTicket(true);
      setError('');

      await api.updateTicket(active.id, {
        status: newStatus
      });
    } catch (err) {
      setTickets(previousTickets);
      setError(err.message || 'Unable to update ticket status.');
    } finally {
      setSavingTicket(false);
    }
  };

  const getTicketsForColumn = (status) =>
    tickets.filter((ticket) => ticket.status === status);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0c0c0f] px-5 py-5 md:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <LayoutDashboard size={19} className="text-violet-400" />
                <h1 className="text-xl font-bold">Kanban Board</h1>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Track your project progress
              </p>
            </div>
          </div>

          <Link
            to="/tickets"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
          >
            <Ticket size={16} />
            <span className="hidden sm:inline">All Issues</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-5 md:p-8">

        {/* Project Selector */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Project Board</h2>
            <p className="mt-1 text-sm text-gray-500">
              Drag and drop tickets to update their status.
            </p>
          </div>

          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="min-w-52 rounded-xl border border-white/10 bg-[#151519] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {savingTicket && (
          <p className="mb-4 text-xs text-violet-400">
            Saving ticket status...
          </p>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a project before using the Kanban board.
            </p>
            <Link
              to="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500"
            >
              <Plus size={16} />
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tickets={getTicketsForColumn(column.id)}
                />
              ))}
            </div>
          </DndContext>
        )}

      </main>
    </div>
  );
};

export default Board;
