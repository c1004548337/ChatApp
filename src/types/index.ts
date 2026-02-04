/**
 * 应用中的主要类型定义
 * 包含用户、消息、聊天会话、朋友圈动态等接口
 */

// 根导航堆栈参数列表
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { userId: string; userName: string; userAvatar?: string };
  PostMoment: undefined; // 新增：发朋友圈页面
};

// 认证堆栈参数列表
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// 主页面底部标签导航参数列表
export type MainTabParamList = {
  ChatList: undefined;
  Friends: undefined;
  Moments: undefined;
  Profile: undefined;
};

// 用户接口定义
export interface User {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  bio?: string;
  region?: string;
}

// 消息接口定义
export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; // Add receiverId
  text: string;
  timestamp: number;
}

// 聊天会话接口定义
export interface ChatSession {
  id: string;
  userId: string; // 聊天对象ID
  userName: string; // 聊天对象名称
  userAvatar: string; // 聊天对象头像
  lastMessage: string; // 最后一条消息内容
  lastMessageTime: number; // 最后一条消息时间
  unreadCount: number; // 未读消息数
}

// 朋友圈动态接口定义
export interface Moment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images?: string[]; // 图片列表
  timestamp: number;
  likes: number; // 点赞数
  comments: Comment[]; // 评论列表
}

// 评论接口定义
export interface Comment {
  id: string;
  userName: string;
  content: string;
}
