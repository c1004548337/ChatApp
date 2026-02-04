import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Moment } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 朋友圈页面
 * 展示好友动态
 */
export default function MomentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();

  useEffect(() => {
    fetchMoments();
  }, []);

  // 监听焦点变化，刷新数据（例如发完朋友圈回来）
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMoments();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMoments = async () => {
    try {
      const data = await api.getMoments();
      setMoments(data);
    } catch (error) {
      console.error('Failed to fetch moments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMoment = (momentId: string) => {
    Alert.alert(
      '删除动态',
      '确定要删除这条动态吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteMoment(momentId);
              setMoments(prev => prev.filter(m => m.id !== momentId));
            } catch (error) {
              Alert.alert('错误', '删除失败，请稍后重试');
            }
          }
        }
      ]
    );
  };

  /**
   * 设置导航栏右侧按钮
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 10 }}
          onPress={() => navigation.navigate('PostMoment')}
        >
          <Ionicons name="camera-outline" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  /**
   * 渲染单条动态
   */
  const renderItem = ({ item }: { item: Moment }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* 头像 */}
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          {/* 用户名 */}
          <Text style={styles.name}>{item.userName}</Text>
          {/* 动态内容 */}
          {item.content ? <Text style={styles.content}>{item.content}</Text> : null}
        </View>
      </View>

      {/* 图片网格 - 调整到头像右侧下方或者作为内容的一部分 */}
      {/* 微信风格：内容和图片在头像右侧。目前布局比较简单，为了效果更好，我们把图片移到内容下方，并缩进 */}
      <View style={{ marginLeft: 50 }}> 
        {item.images && item.images.length > 0 && (
          <View style={styles.imageContainer}>
            {item.images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.postImage} />
            ))}
          </View>
        )}
        
        <View style={styles.footerRow}>
           <Text style={styles.time}>
             {formatTime(item.timestamp)}
           </Text>
           {/* 删除按钮 */}
           {currentUser?.id === item.userId && (
             <TouchableOpacity onPress={() => handleDeleteMoment(item.id)}>
               <Text style={styles.deleteText}>删除</Text>
             </TouchableOpacity>
           )}
           <View style={{ flex: 1 }} />
           {/* 点赞/评论 按钮 (简化版，微信是点击弹出小窗，这里直接放两个图标) */}
           <TouchableOpacity style={styles.actionButton}>
             <Ionicons name="heart-outline" size={18} color="#576b95" />
             {item.likes > 0 && <Text style={styles.actionText}>{item.likes}</Text>}
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionButton}>
             <Ionicons name="chatbubble-outline" size={18} color="#576b95" />
           </TouchableOpacity>
        </View>

        {/* 评论区 */}
        {(item.likes > 0 || (item.comments && item.comments.length > 0)) && (
          <View style={styles.commentsSection}>
             {/* 点赞列表 (Mock) */}
             {item.likes > 0 && (
                <View style={styles.likesRow}>
                   <Ionicons name="heart-outline" size={14} color="#576b95" style={{ marginTop: 2, marginRight: 4 }} />
                   <Text style={styles.likeUsers}>UserA, UserB</Text>
                </View>
             )}
             
             {/* 分割线 */}
             {item.likes > 0 && item.comments && item.comments.length > 0 && (
                <View style={styles.commentSeparator} />
             )}

            {item.comments && item.comments.map(comment => (
              <TouchableOpacity key={comment.id} activeOpacity={0.7}>
                <View style={styles.commentRow}>
                  <Text style={styles.commentUser}>{comment.userName}</Text>
                  <Text style={styles.commentContent}>: {comment.content}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2e78b7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={moments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={fetchMoments}
      />
    </View>
  );
}

function formatTime(timestamp: number) {
    // 简单实现
    const date = new Date(timestamp);
    const now = new Date();
    // ... logic
    return date.toLocaleString(); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 朋友圈背景通常是白色的，除非有顶部大图
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#576b95', // 微信昵称蓝
    marginBottom: 4,
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  postImage: {
    width: (width - 100) / 3, // 调整大小
    height: (width - 100) / 3,
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: '#eee',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  time: {
    fontSize: 12,
    color: '#B2B2B2',
    marginRight: 10,
  },
  deleteText: {
    fontSize: 12,
    color: '#576b95',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 4,
  },
  actionText: {
    marginLeft: 2,
    color: '#576b95',
    fontSize: 12,
  },
  commentsSection: {
    backgroundColor: '#F7F7F7',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  likeUsers: {
    fontSize: 13,
    color: '#576b95',
    fontWeight: '500',
  },
  commentSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5E5',
    marginVertical: 4,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  commentUser: {
    fontWeight: '600',
    color: '#576b95',
    fontSize: 14,
  },
  commentContent: {
    color: '#333',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
