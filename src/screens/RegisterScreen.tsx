import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { api } from '../services/api';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

/**
 * 注册页面组件
 * 处理新用户注册逻辑
 */
export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  // 状态管理
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 处理注册逻辑
   */
  const handleRegister = async () => {
    // 基础验证
    if (!name || !phone || !password || !confirmPassword) {
      Alert.alert('错误', '请填写所有必填项');
      return;
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('错误', '请输入有效的11位手机号码');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致，请重新输入');
      return;
    }

    setLoading(true);
    try {
      // 显式传递所有字段，防止后端反序列化问题
      await api.register({ 
        name, 
        phone, 
        password,
        avatar: null,
        bio: null
      });
      
      Alert.alert(
        '注册成功',
        '您的账号已创建成功，请登录使用',
        [{ text: '立即登录', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = '注册失败，请稍后重试';
      
      if (error.message.includes('已被注册') || error.message.includes('400')) {
        errorMessage = '该手机号已被注册，请直接登录';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = '网络连接失败，请检查网络设置';
      }

      Alert.alert('注册失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.formContainer}>
        <Text style={styles.title}>创建账号</Text>
        <Text style={styles.subtitle}>加入我们，开启畅聊之旅</Text>
        
        {/* 昵称输入 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>昵称</Text>
          <TextInput
            style={styles.input}
            placeholder="您的名字"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        {/* 手机号输入 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>手机号</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入您的手机号"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="phone-pad"
            maxLength={11}
            editable={!loading}
          />
        </View>

        {/* 密码输入 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            placeholder="设置密码"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            editable={!loading}
          />
        </View>

        {/* 确认密码 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>确认密码</Text>
          <TextInput
            style={styles.input}
            placeholder="再次输入密码"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            editable={!loading}
          />
        </View>

        {/* 注册按钮 */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>立即注册</Text>
          )}
        </TouchableOpacity>

        {/* 返回登录 */}
        <TouchableOpacity 
          style={styles.linkContainer} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.linkText}>已有账号？<Text style={styles.linkHighlight}>去登录</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F0F2F5',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#2E78B7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2E78B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4E3',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#2E78B7',
    fontWeight: 'bold',
  },
});
