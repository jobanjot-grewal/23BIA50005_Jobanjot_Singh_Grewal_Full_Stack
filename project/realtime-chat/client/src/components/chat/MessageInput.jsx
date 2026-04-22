import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { getSocket } from '../../socket/socket';

const MessageInput = ({ conversationId }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTyping = (e) => {
    setText(e.target.value);
    
    const socket = getSocket();
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { conversationId });
    }, 2000);
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    inputRef.current?.focus();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        text: text.trim(),
        attachments: [], // We'll add file upload later
      });
      
      socket.emit('typing_stop', { conversationId });
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
    
    setText('');
    setShowEmojiPicker(false);
  };

  return (
    <form onSubmit={handleSend} className="p-3 bg-surface border-t border-border flex items-end gap-2 relative">
      <button 
        type="button" 
        className="p-3 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-background flex-shrink-0"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      <div className="flex-1 bg-background rounded-2xl flex items-end border border-transparent focus-within:border-border transition-colors">
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="iMessage"
          className="w-full bg-transparent max-h-32 min-h-[44px] py-3 px-4 resize-none outline-none text-text leading-tight custom-scrollbar"
          rows={1}
        />
        
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 text-text-secondary hover:text-primary transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-xl overflow-hidden border border-border">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                theme="light"
                searchDisabled
                skinTonesDisabled
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim()}
        className="p-3 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:hover:bg-primary flex-shrink-0"
      >
        <Send className="w-5 h-5 ml-0.5" />
      </button>
    </form>
  );
};

export default MessageInput;
