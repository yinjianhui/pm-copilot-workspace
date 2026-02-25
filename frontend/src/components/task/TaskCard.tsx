import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  workspaceId: string;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onPriorityChange?: (taskId: string, newPriority: Task['priority']) => void;
  showActions?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  workspaceId,
  onStatusChange,
  onPriorityChange,
  showActions = true,
}) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'done':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', className: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600 dark:text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, className: 'text-gray-600 dark:text-gray-400' };
    } else {
      return { text: date.toLocaleDateString(), className: 'text-gray-500 dark:text-gray-500' };
    }
  };

  const dueDate = formatDate(task.due_date);

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      const statusFlow: Record<string, string> = {
        todo: 'in_progress',
        in_progress: 'done',
        done: 'todo',
      };
      onStatusChange(task.id, statusFlow[task.status] as Task['status']);
    }
  };

  const handlePriorityChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPriorityChange) {
      const priorityFlow: Record<string, string> = {
        low: 'medium',
        medium: 'high',
        high: 'critical',
        critical: 'low',
      };
      onPriorityChange(task.id, priorityFlow[task.priority] as Task['priority']);
    }
  };

  return (
    <Card
      hover
      onClick={() => navigate(`/workspace/${workspaceId}/task/${task.id}`)}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{task.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(task.priority)}`}
                onClick={handlePriorityChange}
                title="Click to change priority"
              >
                {task.priority.toUpperCase()}
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
              >
                {getStatusLabel(task.status)}
              </span>
            </div>
          </div>
          {showActions && onStatusChange && (
            <button
              onClick={handleStatusChange}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Click to advance status"
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {dueDate && (
              <span className={`flex items-center ${dueDate.className}`}>
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {dueDate.text}
              </span>
            )}
            {task.assignee_id && (
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {task.assignee_id}
              </span>
            )}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
