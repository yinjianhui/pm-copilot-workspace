import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { TaskList } from '../components/task/TaskList';
import { TaskBoard } from '../components/task/TaskBoard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTasks,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
  setViewMode,
} from '../store/taskSlice';
import type { Task, TaskCreate, TaskUpdate } from '../types/task';

export const TaskManagement: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { tasks, loading, viewMode } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchTasks({ workspaceId }));
    }
  }, [workspaceId, dispatch]);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'list' || view === 'board') {
      dispatch(setViewMode(view));
    }
  }, [searchParams, dispatch]);

  const handleViewChange = (view: 'list' | 'board') => {
    setSearchParams({ view });
  };

  const handleCreateTask = (data: TaskCreate) => {
    if (workspaceId) {
      dispatch(createTask({ workspaceId, data }));
    }
  };

  const handleUpdateTask = (taskId: string, data: TaskUpdate) => {
    if (workspaceId) {
      dispatch(updateTask({ workspaceId, taskId, data }));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (workspaceId) {
      dispatch(
        patchTask({
          workspaceId,
          taskId,
          data: { status: newStatus },
        })
      );
    }
  };

  const handlePriorityChange = (taskId: string, newPriority: Task['priority']) => {
    if (workspaceId) {
      dispatch(
        patchTask({
          workspaceId,
          taskId,
          data: { priority: newPriority },
        })
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (workspaceId) {
      dispatch(deleteTask({ workspaceId, taskId }));
    }
  };

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Workspace ID is required</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleViewChange('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              List View
            </span>
          </button>
          <button
            onClick={() => handleViewChange('board')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'board'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              Board View
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <TaskList
          workspaceId={workspaceId}
          tasks={tasks}
          loading={loading}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <div className="h-[calc(100vh-200px)]">
          <TaskBoard
            workspaceId={workspaceId}
            tasks={tasks}
            loading={loading}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      )}
    </div>
  );
};
