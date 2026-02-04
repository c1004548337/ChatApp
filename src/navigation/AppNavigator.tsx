import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform, View } from 'react-native';
import { ChatProvider, useChat } from '../context/ChatContext';
import { navigationRef } from './RootNavigation';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatListScreen from '../screens/ChatListScreen';
import FriendsScreen from '../screens/FriendsScreen';
import MomentsScreen from '../screens/MomentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import PostMomentScreen from '../screens/PostMomentScreen';

// Configure Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * 认证流程导航
 * 包含登录和注册页面
 */
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

/**
 * 主界面 Tab 导航
 * 包含消息、好友、朋友圈、个人中心
 */
function MainNavigator() {
  const { hasUnread } = useChat();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 自定义 Tab 图标
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'ChatList') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Moments') {
            iconName = focused ? 'aperture' : 'aperture-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'ChatList' && hasUnread && (
                <View
                  style={{
                    position: 'absolute',
                    right: -2,
                    top: -2,
                    backgroundColor: 'red',
                    borderRadius: 4,
                    width: 8,
                    height: 8,
                  }}
                />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#2e78b7', // 选中颜色
        tabBarInactiveTintColor: 'gray',  // 未选中颜色
      })}
    >
      <Tab.Screen 
        name="ChatList" 
        component={ChatListScreen} 
        options={{ title: '消息', headerShown: true }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen} 
        options={{ title: '通讯录', headerShown: true }}
      />
      <Tab.Screen 
        name="Moments" 
        component={MomentsScreen} 
        options={{ title: '朋友圈', headerShown: true }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '我', headerShown: true }}
      />
    </Tab.Navigator>
  );
}

/**
 * 应用根导航配置
 */
export default function AppNavigator() {
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Notification Response Listener
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && typeof data.userId === 'string' && typeof data.userName === 'string') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('Chat', { userId: data.userId, userName: data.userName });
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <ChatProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* 初始显示认证流程 */}
          {/* TODO: 添加启动页逻辑，检查本地 Token 决定跳转 Auth 还是 Main */}
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={MainNavigator} />
          
          {/* 聊天详情页 */}
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ headerShown: true, title: '聊天' }}
          />
          
          {/* 发朋友圈页面 */}
          <Stack.Screen 
            name="PostMoment" 
            component={PostMomentScreen} 
            options={{ headerShown: true, title: '发表动态' }}
          />
        </Stack.Navigator>
      </ChatProvider>
    </NavigationContainer>
  );
}
