import { api } from './api';
import type { Conversation, CreateMessageRequest, Message } from '../types/conversation';

export const conversationService = {
  // Get all conversations for a requirement
  getConversations: async (requirementId: string): Promise<Conversation[]> => {
    const response = await api.get(`/requirements/${requirementId}/conversations`);
    return response.data;
  },

  // Get a specific conversation
  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Send a new message
  sendMessage: async (conversationId: string, data: CreateMessageRequest): Promise<Message> => {
    const response = await api.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  // Create a new conversation
  createConversation: async (requirementId: string, title?: string): Promise<Conversation> => {
    const response = await api.post(`/requirements/${requirementId}/conversations`, { title });
    return response.data;
  },
};
