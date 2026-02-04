import { User, ChatSession, Moment, Message } from '../types';

/**
 * 模拟数据文件
 * 用于在没有后端服务时展示UI效果
 */

// 当前登录用户
export const CURRENT_USER: User = {
  id: 'u1',
  name: '陈大明',
  avatar: 'https://ui-avatars.com/api/?name=Da+Ming&background=0D8ABC&color=fff',
  bio: 'React Native 开发者',
  region: '中国深圳',
};

// 好友列表
export const FRIENDS: User[] = [
  {
    id: 'u2',
    name: '李小红',
    avatar: 'https://ui-avatars.com/api/?name=Xiao+Hong&background=FF5722&color=fff',
    bio: '喜欢旅游和摄影',
  },
  {
    id: 'u3',
    name: '王大力',
    avatar: 'https://ui-avatars.com/api/?name=Da+Li&background=4CAF50&color=fff',
    bio: '科技发烧友',
  },
  {
    id: 'u4',
    name: '张伟',
    avatar: 'https://ui-avatars.com/api/?name=Zhang+Wei&background=9C27B0&color=fff',
    bio: '全栈工程师',
  },
  {
    id: 'u5',
    name: '刘芳',
    avatar: 'https://ui-avatars.com/api/?name=Liu+Fang&background=E91E63&color=fff',
    bio: '美食博主',
  },
];

// 聊天会话列表
export const CHAT_SESSIONS: ChatSession[] = [
  {
    id: 's1',
    userId: 'u2',
    userName: '李小红',
    userAvatar: 'https://ui-avatars.com/api/?name=Xiao+Hong&background=FF5722&color=fff',
    lastMessage: '明天我们几点出发？',
    lastMessageTime: Date.now() - 1000 * 60 * 5, // 5分钟前
    unreadCount: 2,
  },
  {
    id: 's2',
    userId: 'u3',
    userName: '王大力',
    userAvatar: 'https://ui-avatars.com/api/?name=Da+Li&background=4CAF50&color=fff',
    lastMessage: '你看过最新的 Expo 更新文档了吗？',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    unreadCount: 0,
  },
];

// 朋友圈数据
export const MOMENTS: Moment[] = [
  {
    id: 'm1',
    userId: 'u2',
    userName: '李小红',
    userAvatar: 'https://ui-avatars.com/api/?name=Xiao+Hong&background=FF5722&color=fff',
    content: '今天天气真好，跑了10公里！🏃‍♀️ 感觉棒极了！',
    timestamp: Date.now() - 1000 * 60 * 30,
    likes: 12,
    comments: [
      { id: 'c1', userName: '王大力', content: '太厉害了！' },
    ],
  },
  {
    id: 'm2',
    userId: 'u3',
    userName: '王大力',
    userAvatar: 'https://ui-avatars.com/api/?name=Da+Li&background=4CAF50&color=fff',
    content: '通宵写代码... #程序员的日常 💻',
    images: ['https://via.placeholder.com/300x200'],
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    likes: 5,
    comments: [],
  },
];

// 模拟聊天记录
export const MOCK_MESSAGES: Record<string, Message[]> = {
  'u2': [
    { id: 'msg1', senderId: 'u2', text: '嗨，大明！', timestamp: Date.now() - 1000 * 60 * 60 },
    { id: 'msg2', senderId: 'u1', text: '嗨 小红，最近怎么样？', timestamp: Date.now() - 1000 * 60 * 59 },
    { id: 'msg3', senderId: 'u2', text: '挺好的。明天我们几点出发？', timestamp: Date.now() - 1000 * 60 * 5 },
  ],
  'u3': [
    { id: 'msg1', senderId: 'u3', text: '你看过最新的 Expo 更新文档了吗？', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
  ],
};
