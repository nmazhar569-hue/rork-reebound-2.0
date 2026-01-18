import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { AuthUser } from '@/types';

const AUTH_STORAGE_KEY = 'limbrise_auth';
const GUEST_ID_KEY = 'limbrise_guest_id';

const GOOGLE_CLIENT_ID_WEB = '__GOOGLE_CLIENT_ID__';

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestId, setGuestId] = useState<string>('');
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    initializeAuth();
    checkAppleAuthAvailability();
  }, []);

  const checkAppleAuthAvailability = async () => {
    if (Platform.OS === 'ios') {
      const available = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(available);
      console.log('[Auth] Apple auth available:', available);
    }
  };

  const initializeAuth = async () => {
    try {
      console.log('[Auth] Initializing authentication...');
      
      const [authData, storedGuestId] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(GUEST_ID_KEY),
      ]);

      if (authData) {
        const parsedUser = JSON.parse(authData) as AuthUser;
        setUser(parsedUser);
        console.log('[Auth] Restored authenticated user:', parsedUser.email);
      }

      if (storedGuestId) {
        setGuestId(storedGuestId);
        console.log('[Auth] Restored guest ID:', storedGuestId);
      } else {
        const newGuestId = generateGuestId();
        await AsyncStorage.setItem(GUEST_ID_KEY, newGuestId);
        setGuestId(newGuestId);
        console.log('[Auth] Created new guest ID:', newGuestId);
      }
    } catch (error) {
      console.error('[Auth] Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Sign in with Apple is only available on iOS devices.');
      return false;
    }

    try {
      console.log('[Auth] Starting Apple sign in...');
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const displayName = credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined;

      const authUser: AuthUser = {
        id: credential.user,
        email: credential.email || undefined,
        displayName: displayName || undefined,
        provider: 'apple',
        providerUserId: credential.user,
        createdAt: new Date().toISOString(),
        linkedAt: guestId ? new Date().toISOString() : undefined,
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      
      console.log('[Auth] Apple sign in successful:', authUser.email || authUser.id);
      return true;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('[Auth] Apple sign in canceled by user');
        return false;
      }
      console.error('[Auth] Apple sign in error:', error);
      Alert.alert('Sign In Failed', 'Unable to sign in with Apple. Please try again.');
      return false;
    }
  }, [guestId]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[Auth] Starting Google sign in...');

      if (GOOGLE_CLIENT_ID_WEB === '__GOOGLE_CLIENT_ID__') {
        Alert.alert(
          'Setup Required',
          'Google Sign In requires configuration. Please set up Google OAuth credentials in the app settings.'
        );
        return false;
      }

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'limbrise',
      });

      const state = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString()
      );

      const authRequest = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID_WEB,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        state,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await authRequest.promptAsync(googleDiscovery);

      if (result.type === 'success' && result.authentication?.accessToken) {
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
          }
        );
        
        const userInfo = await userInfoResponse.json();
        
        const authUser: AuthUser = {
          id: userInfo.id,
          email: userInfo.email,
          displayName: userInfo.name,
          provider: 'google',
          providerUserId: userInfo.id,
          createdAt: new Date().toISOString(),
          linkedAt: guestId ? new Date().toISOString() : undefined,
        };

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        setUser(authUser);
        
        console.log('[Auth] Google sign in successful:', authUser.email);
        return true;
      } else if (result.type === 'cancel') {
        console.log('[Auth] Google sign in canceled by user');
        return false;
      } else {
        throw new Error('Google authentication failed');
      }
    } catch (error) {
      console.error('[Auth] Google sign in error:', error);
      Alert.alert('Sign In Failed', 'Unable to sign in with Google. Please try again.');
      return false;
    }
  }, [guestId]);

  const signOut = useCallback(async () => {
    try {
      console.log('[Auth] Signing out...');
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      Alert.alert('Error', 'Unable to sign out. Please try again.');
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      console.log('[Auth] Deleting account...');
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      console.log('[Auth] Account deleted');
    } catch (error) {
      console.error('[Auth] Delete account error:', error);
      Alert.alert('Error', 'Unable to delete account. Please try again.');
    }
  }, []);

  const isGuest = !user;
  const isAuthenticated = !!user;
  const currentUserId = user?.id || guestId;

  return {
    user,
    isGuest,
    isAuthenticated,
    isLoading,
    guestId,
    currentUserId,
    appleAuthAvailable,
    signInWithApple,
    signInWithGoogle,
    signOut,
    deleteAccount,
  };
});
