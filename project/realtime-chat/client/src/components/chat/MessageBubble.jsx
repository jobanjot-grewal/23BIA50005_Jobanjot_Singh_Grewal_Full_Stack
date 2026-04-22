import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn, showAvatar, showName }) => {
  const time = format(new Date(message.createdAt), 'h:mm a');
  
  // Simple read receipt logic (if readBy has more than just the sender)
  const isRead = message.status === 'read' || message.readBy.length > 1;
  const isDelivered = message.status === 'delivered' || message.status === 'read';

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] md:max-w-[60%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar Placeholder */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary font-bold overflow-hidden">
            {showAvatar ? (
              message.sender?.avatar ? (
                <img src={message.sender.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                message.sender?.name?.charAt(0).toUpperCase()
              )
            ) : null}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && showName && (
            <span className="text-xs text-text-secondary ml-1 mb-1">{message.sender?.name}</span>
          )}
          
          <div 
            className={`relative px-4 py-2.5 text-[15px] leading-relaxed shadow-sm
              ${isOwn 
                ? 'bg-primary text-white rounded-2xl rounded-br-sm' 
                : 'bg-surface border border-border text-text rounded-2xl rounded-bl-sm'
              }
            `}
          >
            {/* Message Text */}
            {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
            
            {/* Attachments (Placeholder logic) */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((file, idx) => (
                  <div key={idx} className="rounded border border-white/20 bg-black/10 p-2 text-sm">
                    📎 {file.filename}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Timestamp & Status */}
          <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[10px] text-text-secondary">{time}</span>
            {isOwn && (
              <span className={isRead ? 'text-primary' : 'text-text-secondary/50'}>
                {isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
