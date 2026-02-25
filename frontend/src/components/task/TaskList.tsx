import React, { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import type { Task, TaskFilters, TaskSortOptions } from '../../types/task';

interface TaskListProps {
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

export const TaskList: React.FC<TaskListProps> = ({
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
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sort, setSort] = useState<TaskSortOptions>({ field: 'created_at', order: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'created_at':
        case 'updated_at':
        case 'due_date':
          const dateA = a[sort.field] ? new Date(a[sort.field]!).getTime() : 0;
          const dateB = b[sort.field] ? new Date(b[sort.field]!).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        default:
          comparison = 0;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, filters, sort, searchQuery]);

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

  const toggleFilter = (filterType: keyof TaskFilters, value: string) => {
    setFilters((prev) => {
      if (prev[filterType] === value) {
        const newFilters = { ...prev };
        delete newFilters[filterType];
        return newFilters;
      }
      return { ...prev, [filterType]: value };
    });
  };

  const cycleSort = (field: TaskSortOptions['field']) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'asc' };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tasks ({filteredAndSortedTasks.length})
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

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {(['todo', 'in_progress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => toggleFilter('status', status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filters.status === status
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Priority Filters */}
          <div className="flex flex-wrap gap-2">
            {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => toggleFilter('priority', priority)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filters.priority === priority
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {priority.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort by:</span>
          {[
            { field: 'created_at' as const, label: 'Created' },
            { field: 'updated_at' as const, label: 'Updated' },
            { field: 'due_date' as const, label: 'Due Date' },
            { field: 'priority' as const, label: 'Priority' },
          ].map((option) => (
            <button
              key={option.field}
              onClick={() => cycleSort(option.field)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sort.field === option.field
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
              {sort.field === option.field && (
                <span className="ml-1">{sort.order === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || filters.status || filters.priority
              ? 'Try adjusting your filters or search query'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              workspaceId={workspaceId}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
