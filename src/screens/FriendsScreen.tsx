import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User } from '../types';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

/**
 * 好友列表页面
 * 显示所有联系人
 */
export default function FriendsScreen() {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const users = await api.getUsers();
      // 过滤掉自己
      setFriends(users.filter(u => u.id !== currentUser?.id));
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 渲染单个好友项
   */
  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Chat', { userId: item.id, userName: item.name })}
    >
      {/* 头像 */}
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        {/* 昵称 */}
        <Text style={styles.name}>{item.name}</Text>
        {/* 简介 */}
        {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
      </View>
    </TouchableOpacity>
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
        data={friends}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        // 列表分隔线
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={loading}
        onRefresh={fetchFriends}
      />
    </View>
  );
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
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8, // 方形圆角头像，类似微信
    marginRight: 16,
    backgroundColor: '#F0F2F5',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: '#999',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#E5E5E5',
    marginLeft: 80, // 分隔线左侧留白
  },
});
