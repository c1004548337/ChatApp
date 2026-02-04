import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // 1. Web 环境
  // if (Platform.OS === 'web') {
  //   return 'http://localhost:8080/api';
  // }

  // // 2. 获取运行时的宿主 IP (LAN IP)
  // // 在 Expo Go 开发环境中，hostUri 包含了电脑的局域网 IP
  // const debuggerHost = Constants.expoConfig?.hostUri;
  
  // if (debuggerHost) {
  //   const ip = debuggerHost.split(':')[0];
  //   return `http://${ip}:8080/api`;
  // }

  // // 3. 兜底策略
  // // Android 模拟器默认使用 10.0.2.2
  // if (Platform.OS === 'android') {
  //   return 'http://10.0.2.2:8080/api';
  // }

  // // iOS 模拟器默认使用 localhost
  // return 'http://localhost:8080/api';
  return 'https://chatbackend-production-a5ab.up.railway.app/api';
};

export const API_URL = getApiUrl();
