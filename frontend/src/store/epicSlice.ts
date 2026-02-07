import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { epicService } from '../services/epic';
import type { Epic, CreateEpicRequest, UpdateEpicRequest } from '../types/epic';

interface EpicState {
  epics: Epic[];
  currentEpic: Epic | null;
  loading: boolean;
  error: string | null;
}

const initialState: EpicState = {
  epics: [],
  currentEpic: null,
  loading: false,
  error: null,
};

export const fetchEpics = createAsyncThunk(
  'epics/fetchEpics',
  async (workspaceId: string) => {
    return await epicService.getEpicsByWorkspace(workspaceId);
  }
);

export const createEpic = createAsyncThunk(
  'epics/createEpic',
  async ({ workspaceId, data }: { workspaceId: string; data: CreateEpicRequest }) => {
    return await epicService.createEpic(workspaceId, data);
  }
);

export const updateEpic = createAsyncThunk(
  'epics/updateEpic',
  async ({ epicId, data }: { epicId: string; data: UpdateEpicRequest }) => {
    return await epicService.updateEpic(epicId, data);
  }
);

export const deleteEpic = createAsyncThunk(
  'epics/deleteEpic',
  async (epicId: string) => {
    await epicService.deleteEpic(epicId);
    return epicId;
  }
);

const epicSlice = createSlice({
  name: 'epics',
  initialState,
  reducers: {
    setCurrentEpic: (state, action: PayloadAction<Epic | null>) => {
      state.currentEpic = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEpics
      .addCase(fetchEpics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEpics.fulfilled, (state, action) => {
        state.loading = false;
        state.epics = action.payload;
      })
      .addCase(fetchEpics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch epics';
      })
      // createEpic
      .addCase(createEpic.fulfilled, (state, action) => {
        state.epics.push(action.payload);
      })
      .addCase(createEpic.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create epic';
      })
      // updateEpic
      .addCase(updateEpic.fulfilled, (state, action) => {
        const index = state.epics.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.epics[index] = action.payload;
        }
        if (state.currentEpic?.id === action.payload.id) {
          state.currentEpic = action.payload;
        }
      })
      .addCase(updateEpic.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update epic';
      })
      // deleteEpic
      .addCase(deleteEpic.fulfilled, (state, action) => {
        state.epics = state.epics.filter((e) => e.id !== action.payload);
        if (state.currentEpic?.id === action.payload) {
          state.currentEpic = null;
        }
      })
      .addCase(deleteEpic.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete epic';
      });
  },
});

export const { setCurrentEpic, clearError } = epicSlice.actions;
export default epicSlice.reducer;
