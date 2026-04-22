import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import uiReducer from '../features/uiSlice';
import usersReducer from '../features/usersSlice';
import chatsReducer from '../features/chatsSlice';
import messagesReducer from '../features/messagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    users: usersReducer,
    chats: chatsReducer,
    messages: messagesReducer,
  },
});
