import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { conversationService } from '../services/conversation';
import type { Conversation, CreateMessageRequest, Message } from '../types/conversation';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  sendingMessage: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'conversations/fetchConversations',
  async (requirementId: string) => {
    return await conversationService.getConversations(requirementId);
  }
);

export const fetchMessages = createAsyncThunk(
  'conversations/fetchMessages',
  async (conversationId: string) => {
    return await conversationService.getMessages(conversationId);
  }
);

export const sendMessage = createAsyncThunk(
  'conversations/sendMessage',
  async ({ conversationId, data }: { conversationId: string; data: CreateMessageRequest }) => {
    return await conversationService.sendMessage(conversationId, data);
  }
);

export const createConversation = createAsyncThunk(
  'conversations/createConversation',
  async ({ requirementId, title }: { requirementId: string; title?: string }) => {
    return await conversationService.createConversation(requirementId, title);
  }
);

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // createConversation
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.push(action.payload);
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create conversation';
      });
  },
});

export const { setCurrentConversation, clearMessages, clearError } = conversationSlice.actions;
export default conversationSlice.reducer;
