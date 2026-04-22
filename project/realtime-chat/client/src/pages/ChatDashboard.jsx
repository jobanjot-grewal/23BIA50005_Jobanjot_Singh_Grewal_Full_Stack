import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MessageSquare, Settings } from 'lucide-react';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { setActiveConversation } from '../features/chatsSlice';

const ChatDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { activeConversation } = useSelector((state) => state.chats);
  const dispatch = useDispatch();

  const handleBackToList = () => {
    dispatch(setActiveConversation(null));
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar - ChatList */}
      <div className={`
        ${activeConversation ? 'hidden md:flex' : 'flex'} 
        w-full md:w-80 lg:w-96 bg-surface border-r border-border flex-col h-full z-10 flex-shrink-0 transition-all duration-300
      `}>
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="You" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-bold text-text">Messages</h1>
          </div>
          <Link to="/profile" className="p-2 hover:bg-background rounded-full transition-colors text-text-secondary">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>

      {/* Main Chat Area - ChatWindow */}
      <div className={`
        ${!activeConversation ? 'hidden md:flex' : 'flex'} 
        flex-1 flex-col h-full bg-background relative
      `}>
        {activeConversation ? (
          <ChatWindow onBack={handleBackToList} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary bg-surface/50">
            <div className="w-24 h-24 bg-surface rounded-full shadow-sm flex items-center justify-center mb-6 border border-border">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2 tracking-tight">Your Messages</h2>
            <p className="max-w-md text-center text-text-secondary">
              Send private photos and messages to a friend or group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;
