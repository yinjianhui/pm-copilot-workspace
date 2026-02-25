import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import type { Task, TaskStatus } from '../../types/task';

interface TaskBoardProps {
  workspaceId: string;
  tasks: Task[];
  loading?: boolean;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onPriorityChange?: (taskId: string, newPriority: Task['priority']) => void;
  onCreateTask?: (data: any) => void;
  onUpdateTask?: (taskId: string, data: any) => void;
  onDeleteTask?: (taskId: string) => void;
  epicId?: string;
  requirementId?: string;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { status: 'done', label: 'Done', color: 'bg-green-500' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  workspaceId,
  tasks,
  loading = false,
  onStatusChange,
  onPriorityChange,
  onCreateTask,
  onUpdateTask,
  epicId,
  requirementId,
  // onDeleteTask, // Available for future use
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    // Sort by position within each column
    for (const status of ['todo', 'in_progress', 'done'] as const) {
      grouped[status].sort((a, b) => (a.position || 0) - (b.position || 0));
    }

    return grouped;
  }, [tasks]);

  const handleCreateTask = (data: any) => {
    onCreateTask?.(data);
    setShowCreateForm(false);
  };

  const handleUpdateTask = (data: any) => {
    if (editingTask) {
      onUpdateTask?.(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === status) return;

    const dropTarget = e.currentTarget as HTMLElement;
    dropTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const dropTarget = e.currentTarget as HTMLElement;
    dropTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const dropTarget = e.currentTarget as HTMLElement;
    dropTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');

    if (draggedTask && draggedTask.status !== status) {
      onStatusChange?.(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalTasks = tasks.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Task Board ({totalTasks})
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              workspaceId={workspaceId}
              epicId={epicId}
              requirementId={requirementId}
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              workspaceId={workspaceId}
              task={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-h-[500px]">
          {COLUMNS.map((column) => {
            const columnTasks = tasksByStatus[column.status];
            const taskCount = columnTasks.length;

            return (
              <div
                key={column.status}
                className={`flex-1 min-w-[300px] max-w-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col transition-colors ${
                  draggedTask ? 'border-2 border-dashed border-transparent' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {column.label}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                      {taskCount}
                    </span>
                  </div>
                </div>

                {/* Column Tasks */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <p className="text-sm">No tasks</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-grab active:cursor-grabbing transition-opacity ${
                          draggedTask?.id === task.id ? 'opacity-50' : ''
                        }`}
                      >
                        <TaskCard
                          task={task}
                          workspaceId={workspaceId}
                          onStatusChange={onStatusChange}
                          onPriorityChange={onPriorityChange}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};
