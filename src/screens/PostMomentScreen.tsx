import React, { useState, useLayoutEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 发朋友圈页面
 * 允许用户输入文字和（模拟）上传图片
 */
export default function PostMomentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  /**
   * 配置导航栏
   * 添加"取消"和"发布"按钮
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '发表动态',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 0 }}>
          <Text style={styles.headerButton}>取消</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
          onPress={handlePost} 
          style={[styles.postButton, (!content.trim() || loading) && styles.postButtonDisabled]}
          disabled={!content.trim() || loading}
        >
          {loading ? (
             <ActivityIndicator size="small" color="#fff" />
          ) : (
             <Text style={styles.postButtonText}>发表</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, content, loading]);

  /**
   * 处理发布逻辑
   */
  const handlePost = async () => {
    if (!content.trim() || !user) return;

    setLoading(true);
    try {
      await api.createMoment({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: content,
        // 模拟随机添加一张图片，如果内容包含"图"字
        images: content.includes('图') ? ['https://via.placeholder.com/300x200'] : [],
      });

      Alert.alert('成功', '动态发布成功', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('发布失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="这一刻的想法..."
          multiline={true}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          autoFocus={true}
          editable={!loading}
        />
      </View>

      {/* 模拟图片选择区域 */}
      <View style={styles.mediaContainer}>
        <TouchableOpacity style={styles.addImageButton}>
          <Ionicons name="add" size={40} color="#ccc" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.optionItem}>
        <View style={styles.optionLeft}>
          <Ionicons name="location-outline" size={24} color="#333" />
          <Text style={styles.optionText}>所在位置</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
      
      <View style={styles.optionItem}>
        <View style={styles.optionLeft}>
          <Ionicons name="person-add-outline" size={24} color="#333" />
          <Text style={styles.optionText}>提醒谁看</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
      
      <View style={styles.optionItem}>
        <View style={styles.optionLeft}>
          <Ionicons name="earth-outline" size={24} color="#333" />
          <Text style={styles.optionText}>谁可以看</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.optionValue}>公开</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  postButton: {
    backgroundColor: '#07C160', // 微信绿
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 0,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#E0E0E0', // 禁用灰
  },
  postButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrapper: {
    padding: 20,
    minHeight: 150,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    minHeight: 120,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  optionValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 5,
  },
});
