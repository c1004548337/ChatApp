# ChatApp Development Documentation

## 1. Project Overview
This is a mobile chat application built with **React Native** and **Expo**. It demonstrates a complete flow including authentication, chat functionality, friend list, social feed (Moments), and user profile management.

## 2. Features
- **Authentication**: Login and Registration screens with input validation.
- **Chat**: Real-time style chat interface with message bubbles, timestamp, and input field.
- **Friends List**: Display list of friends with avatars and bio.
- **Moments (Social Feed)**: A social feed similar to WeChat Moments/Instagram, showing posts with text, images, likes, and comments.
- **Profile**: User profile display with logout functionality.
- **Navigation**: Tab-based main navigation combined with Stack navigation for specific flows.

## 3. Technology Stack
- **Framework**: React Native (Expo SDK)
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **Icons**: @expo/vector-icons (Ionicons)
- **UI Components**: Native Components (View, Text, FlatList, etc.) with StyleSheet.

## 4. Project Structure
```
ChatApp/
├── App.tsx                 # Application Entry Point
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript Configuration
└── src/
    ├── components/         # Reusable UI Components
    ├── data/               # Mock Data (Users, Chats, Messages)
    ├── navigation/         # Navigation Configuration
    │   └── AppNavigator.tsx
    ├── screens/            # Screen Components
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── ChatListScreen.tsx
    │   ├── ChatScreen.tsx
    │   ├── FriendsScreen.tsx
    │   ├── MomentsScreen.tsx
    │   └── ProfileScreen.tsx
    └── types/              # TypeScript Definitions
        └── index.ts
```

## 5. Setup & Installation

### Prerequisites
- Node.js (LTS recommended)
- npm or yarn

### Steps
1. Navigate to the project directory:
   ```bash
   cd ChatApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Run on device/emulator:
   - Press `i` for iOS Simulator.
   - Press `a` for Android Emulator.
   - Scan QR code with Expo Go app on physical device.

## 6. Implementation Details

### Navigation
- **RootStack**: Manages the top-level navigation between Auth, Main, and Chat screens.
- **AuthStack**: Handles Login and Register screens.
- **MainTab**: A Bottom Tab Navigator for the main app sections (Chats, Friends, Moments, Profile).

### Data Management
- **Mock Data**: Located in `src/data/mockData.ts`, providing realistic sample data for immediate testing without a backend.
- **State**: Uses React `useState` for local UI state (e.g., input fields, appending new messages).

### Screens
- **Login/Register**: Uses `KeyboardAvoidingView` for better UX on mobile.
- **ChatScreen**: Implements an inverted `FlatList` for correct message ordering and auto-scroll behavior.
- **MomentsScreen**: Displays rich content cards with flexible layout for images and comments.

## 7. Future Improvements
- Integrate a real backend (Firebase or custom REST/GraphQL API).
- Add real-time WebSocket connection for chat.
- Implement persistent storage (AsyncStorage) for session management.
- Add image uploading functionality.
