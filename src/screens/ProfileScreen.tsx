import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 个人中心页面
 * 展示当前登录用户信息和设置选项
 */
export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploading, setUploading] = useState(false);

  /**
   * 处理退出登录
   */
  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出当前账号吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '退出', 
          style: 'destructive',
          onPress: () => {
            setUser(null);
            // 重置路由栈回到登录页
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        },
      ]
    );
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }
    
    if (!user) return;

    try {
      const updatedUser = await api.updateUser(user.id, { ...user, name: newName });
      setUser(updatedUser);
      setModalVisible(false);
      Alert.alert('成功', '昵称修改成功');
    } catch (error) {
      Alert.alert('失败', '修改失败，请稍后重试');
    }
  };

  const openEditModal = () => {
    setNewName(user?.name || '');
    setModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('需要权限', '需要访问相册权限以修改头像');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && user) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const response = await api.uploadFile(uri);
      if (response.url) {
        // Update user avatar
        const updatedUser = await api.updateUser(user.id, { ...user, avatar: response.url });
        setUser(updatedUser);
        Alert.alert('成功', '头像修改成功');
      }
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('失败', '头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      {/* 头部信息卡片 */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            {uploading ? (
              <View style={[styles.avatar, styles.centered]}>
                <ActivityIndicator size="small" color="#666" />
              </View>
            ) : (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={openEditModal}>
            <View style={styles.infoText}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.name}>{user.name}</Text>
              </View>
              <View style={styles.idRow}>
                <Text style={styles.idText}>微信号: {user.id}</Text>
              </View>
              {user.bio && <Text style={styles.bio} numberOfLines={1}>{user.bio}</Text>}
            </View>
          </TouchableOpacity>
          <View style={styles.headerRight}>
             <Ionicons name="qr-code-outline" size={20} color="#666" style={{ marginRight: 12 }} />
             <Ionicons name="chevron-forward" size={16} color="#B2B2B2" />
          </View>
        </View>
      </View>

      {/* 功能菜单列表 */}
      <View style={styles.section}>
        <MenuItem icon="notifications-outline" title="消息通知" />
        <MenuItem icon="shield-checkmark-outline" title="隐私" />
        <MenuItem icon="settings-outline" title="通用" />
      </View>

      <View style={styles.section}>
         <MenuItem icon="help-circle-outline" title="帮助与反馈" />
         <MenuItem icon="information-circle-outline" title="关于畅聊" />
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>

      {/* 修改昵称弹窗 (保持不变) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改昵称</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="请输入新昵称"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleUpdateName}
              >
                <Text style={styles.confirmButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const MenuItem = ({ icon, title }: { icon: any, title: string }) => (
  <TouchableOpacity style={styles.row}>
    <Ionicons name={icon} size={22} color="#333" />
    <Text style={styles.rowText}>{title}</Text>
    <Ionicons name="chevron-forward" size={16} color="#B2B2B2" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // 微信背景灰
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 8, // 方形圆角
    marginRight: 16,
    backgroundColor: '#eee',
  },
  infoText: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  idText: {
    fontSize: 15,
    color: '#333',
  },
  bio: {
    fontSize: 14,
    color: '#999',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  rowText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 30,
  },
  logoutText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  confirmButton: {
    backgroundColor: '#07C160', // 微信绿
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
