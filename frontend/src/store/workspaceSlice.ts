import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, WorkspaceCreate, WorkspaceUpdate } from '../types/workspace';
import { workspaceService } from '../services/workspace';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};

export const fetchWorkspaces = createAsyncThunk(
  'workspaces/fetchAll',
  async () => {
    return await workspaceService.getAll();
  }
);

export const fetchWorkspace = createAsyncThunk(
  'workspaces/fetchOne',
  async (id: string) => {
    return await workspaceService.getById(id);
  }
);

export const createWorkspace = createAsyncThunk(
  'workspaces/create',
  async (data: WorkspaceCreate) => {
    return await workspaceService.create(data);
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspaces/update',
  async ({ id, data }: { id: string; data: WorkspaceUpdate }) => {
    return await workspaceService.update(id, data);
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspaces/delete',
  async (id: string) => {
    await workspaceService.delete(id);
    return id;
  }
);

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workspaces';
      })
      // Fetch one
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      })
      // Create
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.push(action.payload);
      })
      // Update
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        const index = state.workspaces.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        }
        if (state.currentWorkspace?.id === action.payload.id) {
          state.currentWorkspace = action.payload;
        }
      })
      // Delete
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
        if (state.currentWorkspace?.id === action.payload) {
          state.currentWorkspace = null;
        }
      });
  },
});

export const { clearCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
