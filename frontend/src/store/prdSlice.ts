import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { prdService } from '../services/prd';
import type { PRD, CreatePRDRequest, UpdatePRDRequest } from '../types/prd';

interface PRDState {
  currentPRD: PRD | null;
  loading: boolean;
  generating: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: PRDState = {
  currentPRD: null,
  loading: false,
  generating: false,
  saving: false,
  error: null,
};

export const fetchPRD = createAsyncThunk(
  'prd/fetchPRD',
  async (requirementId: string) => {
    return await prdService.getPRD(requirementId);
  }
);

export const createPRD = createAsyncThunk(
  'prd/createPRD',
  async ({ requirementId, data }: { requirementId: string; data: CreatePRDRequest }) => {
    return await prdService.createPRD(requirementId, data);
  }
);

export const updatePRD = createAsyncThunk(
  'prd/updatePRD',
  async ({ prdId, data }: { prdId: string; data: UpdatePRDRequest }) => {
    return await prdService.updatePRD(prdId, data);
  }
);

export const deletePRD = createAsyncThunk(
  'prd/deletePRD',
  async (prdId: string) => {
    await prdService.deletePRD(prdId);
    return prdId;
  }
);

export const generatePRD = createAsyncThunk(
  'prd/generatePRD',
  async ({ requirementId, prompt }: { requirementId: string; prompt: string }) => {
    return await prdService.generatePRD(requirementId, prompt);
  }
);

const prdSlice = createSlice({
  name: 'prd',
  initialState,
  reducers: {
    setCurrentPRD: (state, action: PayloadAction<PRD | null>) => {
      state.currentPRD = action.payload;
    },
    updatePRDContent: (state, action: PayloadAction<{ key: keyof PRD; value: any }>) => {
      if (state.currentPRD) {
        state.currentPRD[action.payload.key] = action.payload.value;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPRD
      .addCase(fetchPRD.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPRD.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPRD = action.payload;
      })
      .addCase(fetchPRD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch PRD';
      })
      // createPRD
      .addCase(createPRD.fulfilled, (state, action) => {
        state.currentPRD = action.payload;
      })
      .addCase(createPRD.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create PRD';
      })
      // updatePRD
      .addCase(updatePRD.pending, (state) => {
        state.saving = true;
      })
      .addCase(updatePRD.fulfilled, (state, action) => {
        state.saving = false;
        state.currentPRD = action.payload;
      })
      .addCase(updatePRD.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to update PRD';
      })
      // deletePRD
      .addCase(deletePRD.fulfilled, (state) => {
        state.currentPRD = null;
      })
      .addCase(deletePRD.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete PRD';
      })
      // generatePRD
      .addCase(generatePRD.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generatePRD.fulfilled, (state, action) => {
        state.generating = false;
        state.currentPRD = action.payload;
      })
      .addCase(generatePRD.rejected, (state, action) => {
        state.generating = false;
        state.error = action.error.message || 'Failed to generate PRD';
      });
  },
});

export const { setCurrentPRD, updatePRDContent, clearError } = prdSlice.actions;
export default prdSlice.reducer;
