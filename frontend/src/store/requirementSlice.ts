import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Requirement, RequirementCreate, RequirementUpdate } from '../types/requirement';
import { requirementService } from '../services/requirement';

interface RequirementState {
  requirements: Requirement[];
  currentRequirement: Requirement | null;
  loading: boolean;
  error: string | null;
}

const initialState: RequirementState = {
  requirements: [],
  currentRequirement: null,
  loading: false,
  error: null,
};

export const fetchRequirements = createAsyncThunk(
  'requirements/fetchAll',
  async (params?: { epicId?: string }) => {
    return await requirementService.getAll(params?.epicId);
  }
);

export const fetchRequirement = createAsyncThunk(
  'requirements/fetchOne',
  async (id: string) => {
    return await requirementService.getById(id);
  }
);

export const createRequirement = createAsyncThunk(
  'requirements/create',
  async (data: RequirementCreate) => {
    return await requirementService.create(data);
  }
);

export const updateRequirement = createAsyncThunk(
  'requirements/update',
  async ({ id, data }: { id: string; data: RequirementUpdate }) => {
    return await requirementService.update(id, data);
  }
);

export const deleteRequirement = createAsyncThunk(
  'requirements/delete',
  async (id: string) => {
    await requirementService.delete(id);
    return id;
  }
);

const requirementSlice = createSlice({
  name: 'requirements',
  initialState,
  reducers: {
    clearCurrentRequirement: (state) => {
      state.currentRequirement = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchRequirements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements = action.payload;
      })
      .addCase(fetchRequirements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch requirements';
      })
      // Fetch one
      .addCase(fetchRequirement.fulfilled, (state, action) => {
        state.currentRequirement = action.payload;
      })
      // Create
      .addCase(createRequirement.fulfilled, (state, action) => {
        state.requirements.push(action.payload);
      })
      // Update
      .addCase(updateRequirement.fulfilled, (state, action) => {
        const index = state.requirements.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requirements[index] = action.payload;
        }
        if (state.currentRequirement?.id === action.payload.id) {
          state.currentRequirement = action.payload;
        }
      })
      // Delete
      .addCase(deleteRequirement.fulfilled, (state, action) => {
        state.requirements = state.requirements.filter((r) => r.id !== action.payload);
        if (state.currentRequirement?.id === action.payload) {
          state.currentRequirement = null;
        }
      });
  },
});

export const { clearCurrentRequirement, clearError } = requirementSlice.actions;
export default requirementSlice.reducer;
