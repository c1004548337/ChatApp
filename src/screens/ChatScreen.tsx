import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Keyboard, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, Message } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { useChat } from '../context/ChatContext';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️'];

/**
 * 聊天详情页面
 * 包含消息列表和输入框
 */
export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { userId, userName } = route.params;
  // Use userAvatar from context or api if possible, but route.params is the source of truth for now.
  // We can fetch user details to get the latest avatar.
  const { user: currentUser } = useUser();
  const { refreshChats } = useChat();
  
  // 消息列表状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUserAvatar, setTargetUserAvatar] = useState<string | undefined>(route.params.userAvatar);
  // 输入框状态
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    fetchMessages();
    fetchTargetUser();

    // 简单轮询，实际应使用 WebSocket
    const interval = setInterval(() => {
        fetchMessages();
        fetchTargetUser(); // Poll user info too to update avatar
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, currentUser]);

  const fetchTargetUser = async () => {
      // In a real app, we would have an api.getUser(userId)
      // Since we don't, we can rely on getConversations if we are in the list
      // But here we might need to add getUser to api.
      // For now, let's assume getConversations returns the latest info and we can find it there
      try {
          if (!currentUser) return;
          const sessions = await api.getConversations(currentUser.id);
          const session = sessions.find(s => s.userId === userId);
          if (session && session.userAvatar !== targetUserAvatar) {
              setTargetUserAvatar(session.userAvatar);
          }
      } catch (e) {
          console.log('Failed to fetch target user info');
      }
  };

  // 监听键盘事件，当键盘弹出时隐藏表情面板
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setShowEmoji(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  async function fetchMessages() {
    if (!currentUser) return;
    try {
      const data = await api.getMessages(currentUser.id, userId);
      // 后端返回的是正序，前端倒序显示需要反转
      setMessages([...data].reverse());
      
      // 标记为已读并刷新全局状态
      await api.markMessagesRead(currentUser.id, userId);
      refreshChats();
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  }

  // 监听路由参数变化，更新导航栏
  React.useLayoutEffect(() => {
    navigation.setOptions({ 
      title: userName,
      headerBackTitleVisible: false,
    });
  }, [userName, navigation]);

  /**
   * 发送消息
   */
  const sendMessage = async () => {
    if (inputText.trim() && currentUser) {
      setSending(true);
      try {
        const newMessage = await api.sendMessage({
          senderId: currentUser.id,
          receiverId: userId,
          text: inputText,
        });
        
        // 添加新消息到列表头部
        setMessages(prev => [newMessage, ...prev]);
        setInputText('');
      } catch (error) {
        console.error('Failed to send message', error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const toggleEmoji = () => {
    if (showEmoji) {
      // Switch to keyboard
      // We need to focus the input to bring up the keyboard
      // But we can't easily do that ref here without more code, 
      // simple toggle: just hide emoji, and user taps input manually or we try to focus.
      // Better: just hide emoji.
      setShowEmoji(false);
    } else {
      // Hide keyboard first
      Keyboard.dismiss();
      // Small delay to allow keyboard to hide before showing emoji to avoid flickering layout
      setTimeout(() => setShowEmoji(true), 100);
    }
  };

  /**
   * 渲染单条消息
   */
  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    // 判断是否是我发送的消息
    const isMe = item.senderId === currentUser?.id;
    
    // 简单的时间显示逻辑：第一条消息，或者与上一条消息间隔超过5分钟显示时间
    let showTime = false;
    if (index === messages.length - 1) { // 倒序的最后一条是第一条消息
      showTime = true;
    } else {
      const prevMessage = messages[index + 1];
      if (prevMessage && item.timestamp - prevMessage.timestamp > 5 * 60 * 1000) {
        showTime = true;
      }
    }

    return (
      <View>
        {showTime && (
          <View style={styles.timeContainer}>
            <Text style={styles.systemTimeText}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
          {!isMe && (
             <View style={styles.avatarPlaceholder}>
               {targetUserAvatar ? (
                 <Image source={{ uri: targetUserAvatar }} style={styles.avatar} />
               ) : (
                 <Ionicons name="person-circle" size={36} color="#ccc" />
               )}
             </View>
          )}
          
          {/* 消息气泡 */}
          <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
              {item.text}
            </Text>
          </View>
          
          {isMe && (
            // 我的头像占位
            <View style={styles.avatarPlaceholder}>
               <Image source={{ uri: currentUser?.avatar }} style={styles.avatar} />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2e78b7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted={true} // 倒序显示，底部开始
          contentContainerStyle={styles.listContent}
        />
        
        {/* 底部输入栏 */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
             <Ionicons name="add-circle-outline" size={30} color="#7F7F7F" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder=""
            multiline={true}
            editable={!sending}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            onFocus={() => setShowEmoji(false)} // Focus input hides emoji
          />
          <TouchableOpacity style={styles.iconButton} onPress={toggleEmoji}>
              <Ionicons name={showEmoji ? "keypad-outline" : "happy-outline"} size={30} color="#7F7F7F" />
           </TouchableOpacity>
          {inputText.trim() ? (
             <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={sending}>
               {sending ? (
                 <ActivityIndicator size="small" color="#fff" />
               ) : (
                 <Text style={styles.sendButtonText}>发送</Text>
               )}
             </TouchableOpacity>
          ) : null}
        </View>

        {/* 表情面板 */}
        {showEmoji && (
          <View style={styles.emojiContainer}>
            <FlatList
              data={EMOJIS}
              keyExtractor={(item, index) => index.toString()}
              numColumns={8}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.emojiItem} onPress={() => handleEmojiSelect(item)}>
                  <Text style={styles.emojiText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEDED', // 微信背景灰
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemTimeText: {
    fontSize: 12,
    color: '#B2B2B2',
    backgroundColor: '#DADADA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 6,
    minHeight: 40,
    justifyContent: 'center',
  },
  myMessageBubble: {
    backgroundColor: '#95EC69', // 微信绿
    marginRight: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  myMessageText: {
    color: '#000',
  },
  theirMessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F7F7F7',
    alignItems: 'flex-end', // 对齐底部
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  iconButton: {
    padding: 4,
    marginBottom: 2,
    marginHorizontal: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
    maxHeight: 100,
    marginHorizontal: 8,
    fontSize: 16,
    marginBottom: 4, // 视觉微调
  },
  sendButton: {
    backgroundColor: '#95EC69',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendButtonText: {
    color: '#000', // 微信发送按钮文字是黑色
    fontSize: 14,
    fontWeight: '500',
  },
  emojiContainer: {
    height: 250,
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  emojiItem: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  emojiText: {
    fontSize: 24,
  },
});
