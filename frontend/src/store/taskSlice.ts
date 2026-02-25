import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task, TaskCreate, TaskUpdate, TaskFilters, TaskSortOptions } from '../types/task';
import { taskService } from '../services/task';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  sort: TaskSortOptions;
  viewMode: 'list' | 'board';
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {},
  sort: { field: 'position', order: 'asc' },
  viewMode: 'board',
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params: { workspaceId: string; filters?: TaskFilters; sort?: TaskSortOptions }) => {
    return await taskService.getAll(
      params.workspaceId,
      params.filters,
      params.sort
    );
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchOne',
  async (params: { workspaceId: string; taskId: string }) => {
    return await taskService.getById(params.workspaceId, params.taskId);
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (params: { workspaceId: string; data: TaskCreate }) => {
    return await taskService.create(params.workspaceId, params.data);
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (params: { workspaceId: string; taskId: string; data: TaskUpdate }) => {
    return await taskService.update(params.workspaceId, params.taskId, params.data);
  }
);

export const patchTask = createAsyncThunk(
  'tasks/patch',
  async (params: { workspaceId: string; taskId: string; data: Partial<TaskUpdate> }) => {
    return await taskService.patch(params.workspaceId, params.taskId, params.data);
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async (params: { workspaceId: string; taskId: string; status: Task['status'] }) => {
    return await taskService.updateStatus(params.workspaceId, params.taskId, params.status);
  }
);

export const updateTaskPriority = createAsyncThunk(
  'tasks/updatePriority',
  async (params: { workspaceId: string; taskId: string; priority: Task['priority'] }) => {
    return await taskService.updatePriority(params.workspaceId, params.taskId, params.priority);
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (params: { workspaceId: string; taskId: string }) => {
    await taskService.delete(params.workspaceId, params.taskId);
    return params.taskId;
  }
);

export const bulkUpdateTaskStatus = createAsyncThunk(
  'tasks/bulkUpdateStatus',
  async (params: { workspaceId: string; taskIds: string[]; status: Task['status'] }) => {
    return await taskService.bulkUpdateStatus(
      params.workspaceId,
      params.taskIds,
      params.status
    );
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    reorderTasks: (state, action) => {
      const { sourceStatus, destinationStatus, sourceIndex, destinationIndex } = action.payload;
      const tasksToMove = state.tasks.filter(t => t.status === sourceStatus);
      const [movedTask] = tasksToMove.splice(sourceIndex, 1);

      if (movedTask) {
        movedTask.status = destinationStatus;
        tasksToMove.splice(destinationIndex, 0, movedTask);

        // Update positions
        state.tasks = state.tasks.filter(t => t.status !== sourceStatus && t.status !== destinationStatus);
        state.tasks.push(...tasksToMove.map((t, i) => ({ ...t, position: i })));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Fetch one
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch task';
      })
      // Create
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Patch
      .addCase(patchTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Update status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Update priority
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Bulk update status
      .addCase(bulkUpdateTaskStatus.fulfilled, (state, action) => {
        action.payload.forEach((updatedTask) => {
          const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
          if (state.currentTask?.id === updatedTask.id) {
            state.currentTask = updatedTask;
          }
        });
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      });
  },
});

export const {
  clearCurrentTask,
  clearError,
  setFilters,
  clearFilters,
  setSort,
  setViewMode,
  reorderTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
