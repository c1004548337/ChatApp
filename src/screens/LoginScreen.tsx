import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

// 定义导航属性类型，合并认证堆栈和根堆栈
type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

/**
 * 登录页面组件
 * 处理用户登录逻辑，包含账号密码输入和简单的验证
 */
export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setUser } = useUser();
  
  // 使用 React Hook 管理输入状态
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 处理登录按钮点击事件
   */
  const handleLogin = async () => {
    // 简单的非空验证
    if (!phone.trim() || !password.trim()) {
      Alert.alert('提示', '请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      const user = await api.login({ phone, password });
      setUser(user);
      // 登录成功，使用 replace 替换当前路由，防止用户返回到登录页
      navigation.replace('Main');
    } catch (error: any) {
      let errorMessage = '登录失败，请稍后重试';
      if (error.message.includes('401') || error.message.includes('错误')) {
        errorMessage = '手机号或密码错误，请检查后重试';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = '网络连接失败，请检查网络设置';
      }
      
      Alert.alert('登录失败', errorMessage);
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
        {/* 应用标题 */}
        <Text style={styles.title}>畅聊</Text>
        <Text style={styles.subtitle}>欢迎回来，请登录您的账号</Text>
        
        {/* 账号输入框 */}
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

        {/* 密码输入框 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入您的密码"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true} // 隐藏密码内容
            editable={!loading}
          />
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>登录</Text>
          )}
        </TouchableOpacity>

        {/* 注册跳转链接 */}
        <TouchableOpacity 
          style={styles.linkContainer} 
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={styles.linkText}>还没有账号？<Text style={styles.linkHighlight}>立即注册</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // 更柔和的背景色
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    // 添加阴影效果增加立体感
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8, // Android 阴影
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E78B7',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F0F2F5',
    padding: 16,
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
    marginTop: 24,
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
