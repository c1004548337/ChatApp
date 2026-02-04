import React, { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { ChatSession } from '../types';
import { api } from '../services/api';
import { useUser } from './UserContext';
import * as Notifications from 'expo-notifications';
import { navigationRef } from '../navigation/RootNavigation';

interface ChatContextType {
  conversations: ChatSession[];
  loading: boolean;
  refreshChats: () => Promise<void>;
  hasUnread: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const previousConversationsRef = useRef<ChatSession[]>([]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const sessions = await api.getConversations(user.id);
      
      // Check for new messages and notify
      checkNewMessages(previousConversationsRef.current, sessions);
      
      setConversations(sessions);
      previousConversationsRef.current = sessions;
    } catch (error) {
      console.error('Failed to fetch chats', error);
    }
  };

  const checkNewMessages = async (prev: ChatSession[], current: ChatSession[]) => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    const currentRouteName = currentRoute?.name as string | undefined;
    const currentParams = currentRoute?.params as { userId?: string } | undefined;

    for (const currSession of current) {
      const prevSession = prev.find(p => p.id === currSession.id);
      
      // Check if this is a new message (unread count increased or new session with unread)
      // Note: Backend logic for unreadCount might be simple, so we also check lastMessageTime
      const isNewMessage = (!prevSession && currSession.unreadCount > 0) || 
                           (prevSession && currSession.lastMessageTime > prevSession.lastMessageTime && currSession.unreadCount > 0);

      if (isNewMessage) {
        let shouldNotify = false;

        if (currentRouteName === 'ChatList') {
           // User is viewing the list, do not notify
           shouldNotify = false;
        } else if (currentRouteName === 'Chat' && currentParams?.userId === currSession.userId) {
           // User is chatting with this person, do not notify
           shouldNotify = false;
        } else {
           // Notify in other cases (Moments, Profile, Friends, or Chat with other user)
           shouldNotify = true;
        }

        if (shouldNotify) {
          await sendNotification(currSession.userId, currSession.userName, currSession.lastMessage);
        }
      }
    }
  };

  const sendNotification = async (userId: string, title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { userId, userName: title }
      },
      trigger: null,
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (user) {
      fetchConversations();
      intervalId = setInterval(fetchConversations, 5000);
    } else {
      setConversations([]);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  const hasUnread = conversations.some(c => c.unreadCount > 0);

  return (
    <ChatContext.Provider value={{ conversations, loading, refreshChats: fetchConversations, hasUnread }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
