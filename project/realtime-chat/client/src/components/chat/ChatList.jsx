import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, setActiveConversation } from '../../features/chatsSlice';
import { Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios'; // For searching users directly or use userSlice

const ChatList = ({ onSelectChat }) => {
  const dispatch = useDispatch();
  const { conversations, activeConversation, isLoading } = useSelector((state) => state.chats);
  const { user } = useSelector((state) => state.auth);
  const { onlineUsers } = useSelector((state) => state.users);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Handle local user search for new chat
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setIsSearching(true);
          const res = await api.get(`/users/search?q=${searchQuery}`);
          setSearchResults(res.data.data.users);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectConversation = (conversation) => {
    dispatch(setActiveConversation(conversation));
    setSearchQuery('');
    setSearchResults([]);
    if (onSelectChat) onSelectChat(); // For mobile close sidebar
  };

  const handleStartNewChat = async (participantId) => {
    try {
      const res = await api.post('/conversations', { participantId, type: 'direct' });
      dispatch(fetchConversations()); // Refresh list
      dispatch(setActiveConversation(res.data.data.conversation));
      setSearchQuery('');
      setSearchResults([]);
      if (onSelectChat) onSelectChat();
    } catch (error) {
      console.error('Failed to start chat', error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const getOtherParticipant = (participants) => {
    return participants.find((p) => p._id !== user._id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary/60" />
          </div>
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full pl-9 pr-4 py-2 bg-background hover:bg-surface-hover rounded-xl text-sm transition-colors border border-transparent focus:border-border focus:bg-surface outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && conversations.length === 0 ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : searchQuery.length >= 2 ? (
          // Search Results
          <div>
            <h3 className="text-xs font-semibold text-text-secondary px-3 py-2 uppercase tracking-wider">
              Search Results
            </h3>
            {isSearching ? (
               <div className="text-center text-sm text-text-secondary p-4">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleStartNewChat(u._id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-background cursor-pointer transition-colors"
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {u.avatar ? <img src={u.avatar} alt={u.name} /> : u.name.charAt(0).toUpperCase()}
                    </div>
                    {onlineUsers.includes(u._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{u.name}</h4>
                    <p className="text-sm text-text-secondary">@{u.username}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-text-secondary p-4">No users found</div>
            )}
          </div>
        ) : (
          // Conversation List
          conversations.map((conv) => {
            const isGroup = conv.type === 'group';
            const otherUser = !isGroup ? getOtherParticipant(conv.participants) : null;
            const title = isGroup ? conv.groupName : otherUser?.name;
            const avatar = isGroup ? conv.groupAvatar : otherUser?.avatar;
            const isActive = activeConversation?._id === conv._id;
            const isOnline = !isGroup && otherUser && onlineUsers.includes(otherUser._id);
            const unreadCount = conv.unreadCounts?.[user._id] || 0;

            return (
              <div
                key={conv._id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isActive ? 'bg-primary/10' : 'hover:bg-background'
                }`}
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      title?.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-text truncate pr-2">{title}</h4>
                    <span className="text-xs text-text-secondary flex-shrink-0">
                      {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-text-secondary truncate pr-2">
                      {conv.lastMessage ? (
                        conv.lastMessage.text || 'Sent an attachment'
                      ) : (
                        'New conversation'
                      )}
                    </p>
                    {unreadCount > 0 && !isActive && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
