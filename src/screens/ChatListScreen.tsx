import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChatSession } from '../types';
import { useChat } from '../context/ChatContext';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 消息列表页面
 * 显示所有进行的聊天会话
 */
export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { conversations: chatSessions, loading: contextLoading, refreshChats } = useChat();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshChats();
    setRefreshing(false);
  };

  /**
   * 渲染单个聊天会话项
   */
  const renderItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Chat', { userId: item.userId, userName: item.userName, userAvatar: item.userAvatar })}
    >
      {/* 用户头像 */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        {item.unreadCount > 0 && (
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          {/* 用户名称 */}
          <Text style={styles.name} numberOfLines={1}>{item.userName}</Text>
          {/* 最后一条消息时间 */}
          <Text style={styles.time}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        
        <View style={styles.messageContainer}>
          {/* 最后一条消息内容预览 */}
          <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chatSessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        // 列表为空时的展示
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>暂无消息</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// 简单的时间格式化函数
function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginLeft: 88, // 保持与内容对齐
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 8, // 方形圆角更像微信
    backgroundColor: '#F0F2F5',
  },
  avatarBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FA5151',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  avatarBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    color: '#191919',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#B2B2B2',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#B2B2B2',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 150,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
});
