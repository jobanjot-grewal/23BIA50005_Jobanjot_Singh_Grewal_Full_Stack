import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ conversationId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${conversationId}?page=${page}`);
      return { conversationId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await api.put(`/messages/${conversationId}/read`);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

const initialState = {
  messagesByConversation: {}, // { [conversationId]: { messages: [], total: 0, page: 1, isLoading: false } }
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { conversationId } = action.payload;
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = { messages: [], total: 0, page: 1, isLoading: false };
      }
      
      // Check if message already exists (prevent duplicates from socket + local state)
      const exists = state.messagesByConversation[conversationId].messages.find(
        (m) => m._id === action.payload._id
      );
      
      if (!exists) {
        state.messagesByConversation[conversationId].messages.push(action.payload);
      }
    },
    setMessagesRead: (state, action) => {
      const { conversationId, readByUserId } = action.payload;
      if (state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId].messages.forEach((msg) => {
          if (!msg.readBy.includes(readByUserId)) {
            msg.readBy.push(readByUserId);
            msg.status = 'read';
          }
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = { messages: [], total: 0, page: 1, isLoading: true };
        } else {
          state.messagesByConversation[conversationId].isLoading = true;
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, data } = action.payload;
        
        // If page 1, replace. If > 1, append (prepend actually since older)
        if (data.page === 1) {
          state.messagesByConversation[conversationId] = {
            messages: data.messages,
            total: data.total,
            page: data.page,
            isLoading: false
          };
        } else {
          state.messagesByConversation[conversationId].messages = [
            ...data.messages,
            ...state.messagesByConversation[conversationId].messages
          ];
          state.messagesByConversation[conversationId].page = data.page;
          state.messagesByConversation[conversationId].isLoading = false;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        if (state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId].isLoading = false;
        }
        state.error = action.payload;
      });
  },
});

export const { addMessage, setMessagesRead } = messagesSlice.actions;
export default messagesSlice.reducer;
