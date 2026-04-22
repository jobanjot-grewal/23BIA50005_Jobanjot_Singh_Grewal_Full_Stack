import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';
import { addMessage } from '../features/messagesSlice';
import { 
  updateConversationLastMessage, 
  updateUnreadCount 
} from '../features/chatsSlice';
import { 
  setOnlineUsers, 
  userOnline, 
  userOffline 
} from '../features/usersSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { activeConversation } = useSelector((state) => state.chats);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = connectSocket(token);

      // Presence
      socket.on('online_users', (userIds) => {
        dispatch(setOnlineUsers(userIds));
      });

      socket.on('user_online', ({ userId }) => {
        dispatch(userOnline({ userId }));
      });

      socket.on('user_offline', ({ userId }) => {
        dispatch(userOffline({ userId }));
      });

      // New Messages
      socket.on('new_message', (message) => {
        dispatch(addMessage(message));
        
        // Update chat list
        dispatch(updateConversationLastMessage({
          conversationId: message.conversationId,
          message
        }));

        // Handle unread count if we are not actively in that chat
        // (Active chat logic relies on activeConversation state, which we get from store)
        // Since we can't easily access the current state here without making it a dependency,
        // we'll let a separate effect or component handle marking as read when active.
      });

      socket.on('message_notification', ({ conversationId, message }) => {
        dispatch(updateConversationLastMessage({ conversationId, message }));
      });

      socket.on('messages_read', ({ conversationId, userId }) => {
        // Handle read receipts
        // Dispatch an action to update message statuses
      });

      socket.on('user_typing', ({ userId, conversationId, isTyping }) => {
        // Handle typing indicator (could dispatch to UI slice)
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
      });

      return () => {
        socket.off('online_users');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('new_message');
        socket.off('message_notification');
        socket.off('messages_read');
        socket.off('user_typing');
        socket.off('connect_error');
        disconnectSocket();
      };
    }
  }, [isAuthenticated, token, dispatch]);

  // Handle joining active conversation room
  useEffect(() => {
    const socket = getSocket();
    if (socket && activeConversation) {
      socket.emit('join_conversation', activeConversation._id);

      return () => {
        socket.emit('leave_conversation', activeConversation._id);
      };
    }
  }, [activeConversation]);

  return getSocket();
};
