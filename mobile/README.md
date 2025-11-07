# Brahmin Soulmate Connect - Mobile App

This directory contains the React Native mobile application for Brahmin Soulmate Connect.

## Setup Instructions

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Initialize React Native Project**
```bash
cd mobile
npx react-native init BrahminSoulmateConnect --template react-native-template-typescript
cd BrahminSoulmateConnect
```

2. **Install Dependencies**
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @supabase/supabase-js
npm install react-native-async-storage
npm install react-native-vector-icons
npm install react-native-image-picker
npm install react-native-push-notification
npm install @react-native-community/netinfo
npm install react-native-webrtc # For video calling
npm install react-native-agora # Alternative for video calling
```

3. **iOS Setup** (macOS only)
```bash
cd ios && pod install && cd ..
```

4. **Android Setup**
- Open `android/app/src/main/AndroidManifest.xml`
- Add required permissions (see below)

## Project Structure

```
mobile/BrahminSoulmateConnect/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components
│   │   ├── profile/        # Profile-related components
│   │   ├── messaging/      # Chat components
│   │   └── matching/       # Matching components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── profile/       # Profile screens
│   │   ├── messaging/     # Chat screens
│   │   ├── matching/      # Matching screens
│   │   └── settings/      # Settings screens
│   ├── navigation/         # Navigation configuration
│   ├── services/          # API and business logic
│   │   ├── api.ts         # API client
│   │   ├── auth.ts        # Authentication service
│   │   ├── messaging.ts   # Messaging service
│   │   └── notifications.ts # Push notifications
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── constants/         # App constants
├── assets/                # Images, fonts, etc.
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
└── package.json
```

## Key Features to Implement

### 1. Authentication
- Login/Register screens
- OTP verification
- Biometric authentication
- Social login integration

### 2. Profile Management
- Profile creation wizard
- Photo upload and management
- Profile editing
- Privacy settings

### 3. Matching System
- Swipe-based matching interface
- Advanced filters
- Match recommendations
- Interest management

### 4. Messaging
- Real-time chat
- Media sharing
- Voice messages
- Video calling integration

### 5. Push Notifications
- New message notifications
- Match notifications
- Interest notifications
- System notifications

### 6. Offline Support
- Offline message queue
- Profile caching
- Sync when online

## Configuration Files

### 1. Environment Configuration
Create `src/config/environment.ts`:

```typescript
export const config = {
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  },
  api: {
    baseUrl: 'YOUR_API_BASE_URL',
  },
  features: {
    videoCall: true,
    voiceCall: true,
    pushNotifications: true,
  }
};
```

### 2. Navigation Setup
Create `src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuth } from '../hooks/useAuth';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3. API Service
Create `src/services/api.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';

const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export class ApiService {
  // Profile methods
  async getProfiles(filters = {}) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .match(filters);
    
    if (error) throw error;
    return data;
  }

  // Messaging methods
  async sendMessage(receiverId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        receiver_id: receiverId,
        content,
        sender_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToMessages(userId: string, callback: (message: any) => void) {
    return supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

export const apiService = new ApiService();
```

## Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## iOS Configuration

Add to `ios/BrahminSoulmateConnect/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take profile photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select profile photos</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for voice messages and video calls</string>
```

## Development Commands

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build:android
npm run build:ios
```

## Testing

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## Deployment

### Android
1. Generate signed APK
2. Upload to Google Play Console
3. Configure app signing

### iOS
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

## Key Considerations

### Performance
- Implement lazy loading for images
- Use FlatList for large lists
- Optimize bundle size
- Implement proper caching

### Security
- Implement certificate pinning
- Secure storage for sensitive data
- Proper authentication handling
- Input validation

### User Experience
- Smooth animations
- Proper loading states
- Offline functionality
- Push notification handling

### Platform-Specific Features
- iOS: Face ID/Touch ID integration
- Android: Fingerprint authentication
- Platform-specific UI components
- Native navigation patterns

## Next Steps

1. Set up the React Native project
2. Implement authentication flow
3. Create core UI components
4. Implement navigation
5. Add real-time messaging
6. Integrate push notifications
7. Add video calling functionality
8. Implement offline support
9. Add analytics tracking
10. Prepare for app store submission

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [React Navigation](https://reactnavigation.org/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)