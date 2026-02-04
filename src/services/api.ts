import { API_URL } from '../config';
import { User, Message, Moment, ChatSession } from '../types';

/**
 * 通用 Fetch 封装
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  // Handle empty response for 204 No Content etc.
  if (response.status === 204) {
      return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
      // If response is not JSON (e.g. simple string), return text
      // but here we expect JSON mostly.
      console.warn('Response was not JSON', e);
      return {} as T; 
  }
}

export const api = {
  // Auth
  login: (data: any) => request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  register: (data: any) => request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Users
  getUsers: () => request<User[]>('/users'),
  updateUser: (id: string, data: Partial<User>) => request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Messages
  getMessages: (userId1: string, userId2: string) => 
    request<Message[]>(`/messages?userId1=${userId1}&userId2=${userId2}`),
  
  sendMessage: (message: Partial<Message>) => request<Message>('/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  }),
  
  getConversations: async (userId: string) => {
    const sessions = await request<any[]>(`/conversations?userId=${userId}`);
    return sessions.map(item => ({
      ...item,
      id: item.userId,
    })) as ChatSession[];
  },

  markMessagesRead: (userId: string, otherUserId: string) => request<void>(`/messages/read?userId=${userId}&otherUserId=${otherUserId}`, {
    method: 'PUT',
  }),

  // Moments
  getMoments: () => request<Moment[]>('/moments'),
  createMoment: (moment: Partial<Moment>) => request<Moment>('/moments', {
    method: 'POST',
    body: JSON.stringify(moment),
  }),
  deleteMoment: (id: string) => request<void>(`/moments/${id}`, {
    method: 'DELETE',
  }),

  // File Upload
  uploadFile: async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', { uri, name: filename, type } as any);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  },
};
