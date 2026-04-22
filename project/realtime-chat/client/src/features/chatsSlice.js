import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchConversations = createAsyncThunk(
  'chats/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/conversations');
      return response.data.data.conversations;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chats/createConversation',
  async (participantId, { rejectWithValue }) => {
    try {
      const response = await api.post('/conversations', { participantId });
      return response.data.data.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

const initialState = {
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null,
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find((c) => c._id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        // Move to top
        state.conversations = [
          conversation,
          ...state.conversations.filter((c) => c._id !== conversationId),
        ];
      }
    },
    updateUnreadCount: (state, action) => {
      const { conversationId, userId, count } = action.payload;
      const conversation = state.conversations.find((c) => c._id === conversationId);
      if (conversation) {
        if (!conversation.unreadCounts) conversation.unreadCounts = {};
        conversation.unreadCounts[userId] = count;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        // If it already exists, it will just return the existing one.
        // We ensure it's at the top if it's new.
        const exists = state.conversations.find((c) => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.activeConversation = action.payload;
      });
  },
});

export const { setActiveConversation, updateConversationLastMessage, updateUnreadCount } = chatsSlice.actions;
export default chatsSlice.reducer;
