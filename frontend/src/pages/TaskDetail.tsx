import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { TaskForm } from '../components/task/TaskForm';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTask, updateTaskStatus, updateTaskPriority, deleteTask } from '../store/taskSlice';
import type { Task } from '../types/task';

export const TaskDetail: React.FC = () => {
  const { workspaceId, taskId } = useParams<{ workspaceId: string; taskId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { currentTask, loading, error } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (workspaceId && taskId) {
      dispatch(fetchTask({ workspaceId, taskId }));
    }
  }, [workspaceId, taskId, dispatch]);

  const handleStatusChange = (newStatus: Task['status']) => {
    if (workspaceId && taskId) {
      dispatch(updateTaskStatus({ workspaceId, taskId, status: newStatus }));
    }
  };

  const handlePriorityChange = (newPriority: Task['priority']) => {
    if (workspaceId && taskId) {
      dispatch(updateTaskPriority({ workspaceId, taskId, priority: newPriority }));
    }
  };

  const handleDelete = () => {
    if (workspaceId && taskId) {
      dispatch(deleteTask({ workspaceId, taskId }));
      navigate(`/workspace/${workspaceId}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <svg
              className="w-16 h-16 mx-auto text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate(`/workspace/${workspaceId}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Task Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The task you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate(`/workspace/${workspaceId}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TaskForm
          workspaceId={workspaceId!}
          task={currentTask}
          onSubmit={(_data) => {
            // Handle update (would need updateTask thunk)
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/workspace/${workspaceId}`)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{currentTask.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(currentTask.priority)}`}
                >
                  {currentTask.priority.toUpperCase()} PRIORITY
                </span>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentTask.status)}`}
                >
                  {getStatusLabel(currentTask.status)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {currentTask.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {currentTask.description}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Status Change */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <div className="flex rounded-md shadow-sm" role="group">
                  {(['todo', 'in_progress', 'done'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1.5 text-xs font-medium border ${
                        currentTask.status === status
                          ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      } ${
                        status === 'todo' ? 'rounded-l-md' : ''
                      } ${
                        status === 'done' ? 'rounded-r-md' : ''
                      } ${
                        status !== 'todo' && status !== 'done' ? 'border-l-0' : ''
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Change */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                <div className="flex rounded-md shadow-sm" role="group">
                  {(['low', 'medium', 'high', 'critical'] as const).map((priority, index) => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className={`px-2 py-1.5 text-xs font-medium border ${
                        currentTask.priority === priority
                          ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:border-orange-500 dark:text-orange-400'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      } ${
                        index === 0 ? 'rounded-l-md' : ''
                      } ${
                        index === 3 ? 'rounded-r-md' : ''
                      } ${
                        index !== 0 ? 'border-l-0' : ''
                      }`}
                    >
                      {priority.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="text-gray-900 dark:text-white mt-1">
                  {new Date(currentTask.created_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="text-gray-900 dark:text-white mt-1">
                  {new Date(currentTask.updated_at).toLocaleString()}
                </dd>
              </div>
              {currentTask.due_date && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Due Date</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">
                    {new Date(currentTask.due_date).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {currentTask.assignee_id && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Assignee</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">
                    {currentTask.assignee_id}
                  </dd>
                </div>
              )}
              {currentTask.tags && currentTask.tags.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 dark:text-gray-400">Tags</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {currentTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* IDs */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              References
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Task ID</dt>
                <dd className="text-gray-900 dark:text-white mt-1 font-mono text-xs">
                  {currentTask.id}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Workspace ID</dt>
                <dd className="text-gray-900 dark:text-white mt-1 font-mono text-xs">
                  {currentTask.workspace_id}
                </dd>
              </div>
              {currentTask.epic_id && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Epic ID</dt>
                  <dd className="text-gray-900 dark:text-white mt-1 font-mono text-xs">
                    {currentTask.epic_id}
                  </dd>
                </div>
              )}
              {currentTask.requirement_id && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Requirement ID</dt>
                  <dd className="text-gray-900 dark:text-white mt-1 font-mono text-xs">
                    {currentTask.requirement_id}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Delete Task?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
