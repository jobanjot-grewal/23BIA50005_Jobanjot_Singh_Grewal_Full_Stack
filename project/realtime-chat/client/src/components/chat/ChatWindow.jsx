import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, markAsRead } from '../../features/messagesSlice';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { getSocket } from '../../socket/socket';

const ChatWindow = ({ onBack }) => {
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chats);
  const { messagesByConversation } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  const { onlineUsers } = useSelector((state) => state.users);
  const messagesEndRef = useRef(null);

  const [typingUsers, setTypingUsers] = useState(new Set());

  const conversationData = activeConversation ? messagesByConversation[activeConversation._id] : null;
  const messages = conversationData?.messages || [];
  const isLoading = conversationData?.isLoading || false;

  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchMessages({ conversationId: activeConversation._id }));
      dispatch(markAsRead(activeConversation._id));
      
      const socket = getSocket();
      if (socket) {
        socket.emit('mark_read', { conversationId: activeConversation._id });

        // Listen for typing locally within this window
        const handleTyping = ({ userId, conversationId, isTyping }) => {
          if (conversationId === activeConversation._id) {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (isTyping) newSet.add(userId);
              else newSet.delete(userId);
              return newSet;
            });
          }
        };

        socket.on('user_typing', handleTyping);
        return () => socket.off('user_typing', handleTyping);
      }
    }
  }, [activeConversation, dispatch]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (!activeConversation) return null;

  const isGroup = activeConversation.type === 'group';
  const getOtherParticipant = () => activeConversation.participants.find(p => p._id !== user._id);
  const otherUser = !isGroup ? getOtherParticipant() : null;
  const title = isGroup ? activeConversation.groupName : otherUser?.name;
  const avatar = isGroup ? activeConversation.groupAvatar : otherUser?.avatar;
  const isOnline = !isGroup && otherUser && onlineUsers.includes(otherUser._id);

  return (
    <div className="flex flex-col h-full bg-background relative z-0">
      {/* Header */}
      <div className="glass-effect absolute top-0 left-0 right-0 z-10 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative w-10 h-10 flex-shrink-0 cursor-pointer">
            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
              {avatar ? <img src={avatar} alt={title} className="w-full h-full object-cover" /> : title?.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-text">{title}</h2>
            <p className="text-xs text-text-secondary">
              {isGroup 
                ? `${activeConversation.participants.length} members` 
                : (isOnline ? 'Online' : 'Offline')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-primary">
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Info className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 custom-scrollbar flex flex-col">
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="mt-auto"></div> {/* Pushes content to bottom if short */}
            
            {/* Start of conversation indicator */}
            <div className="text-center my-6">
              <div className="inline-block px-3 py-1 bg-surface border border-border rounded-full text-xs text-text-secondary font-medium shadow-sm">
                Conversation started
              </div>
            </div>

            {messages.map((msg, index) => {
              const isOwn = msg.sender._id === user._id;
              const nextMsg = messages[index + 1];
              const prevMsg = messages[index - 1];
              
              // Group messages by sender for UI
              const showAvatar = !isOwn && (!nextMsg || nextMsg.sender._id !== msg.sender._id);
              const showName = isGroup && !isOwn && (!prevMsg || prevMsg.sender._id !== msg.sender._id);

              return (
                <MessageBubble 
                  key={msg._id} 
                  message={msg} 
                  isOwn={isOwn} 
                  showAvatar={showAvatar}
                  showName={showName}
                />
              );
            })}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex w-full mb-4 justify-start">
                <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 shadow-sm">
                  <div className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="z-10">
        <MessageInput conversationId={activeConversation._id} />
      </div>
    </div>
  );
};

export default ChatWindow;
