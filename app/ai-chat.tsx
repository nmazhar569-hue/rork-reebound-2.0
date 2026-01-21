import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Send, Sparkles } from 'lucide-react-native';

import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { REE_SYSTEM_PROMPT } from '@/constants/reeBehavior';

export default function AIChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialQuery?: string }>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const { userProfile, getTodayLog, getTodayWorkout } = useApp();
  const todayLog = getTodayLog();
  const todayWorkout = getTodayWorkout();

  const [inputText, setInputText] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [mode, setMode] = useState<'basic' | 'deep'>('basic');

  const userContext = userProfile
    ? `
User Profile:
- Injury: ${userProfile.injuryType}
- Sport: ${userProfile.sportType || 'Not specified'}
- Training Style: ${userProfile.trainingStyle}
- Weekly Frequency: ${userProfile.weeklyFrequency} days/week

Current Status:
- Today's Workout: ${todayWorkout?.title || 'None scheduled'}
- Pain Level: ${todayLog?.painLevel ?? 'Not recorded'}
- Confidence: ${todayLog?.confidenceLevel ?? 'Not recorded'}
`
    : 'User profile not available yet.';

  const systemPrompt = `${REE_SYSTEM_PROMPT}

=== RESPONSE RULES ===
- Respond only to user input or explicit context shifts
- One intent per message
- One idea per response
- Calm, neutral, human tone
- Never command or optimize

=== EXPLANATION MODE ===
Current Mode: ${mode.toUpperCase()}

BASIC MODE RULES:
- Use plain language
- Avoid scientific terms unless unavoidable
- No study names or statistics
- Focus on what it means for the user

DEEP THINKING MODE RULES:
- Explain underlying mechanisms (biomechanics, physiology, neuroscience)
- Reference *type* of evidence (e.g. "studies suggest", "meta-analyses show")
- No fake citations, no paper titles
- Explain uncertainty and trade-offs
- Still respect the INFORMATION BUDGET unless user asks for more

Never change tone, empathy, or autonomy rules based on mode.

Explanation depth preference: ${userProfile?.aiPreferences?.explanationDepth || 'simple'}

USER CONTEXT:
${userContext}
`;

  const { messages, sendMessage, status, error, setMessages } =
    useRorkAgent({ tools: {} });

  useEffect(() => {
    if (!hasInitialized) {
      setMessages([
        {
          id: 'system',
          role: 'system',
          parts: [{ type: 'text', text: systemPrompt }],
        },
      ]);
      setHasInitialized(true);
    }
  }, [hasInitialized, setMessages, systemPrompt]);

  useEffect(() => {
    if (
      params.initialQuery &&
      hasInitialized &&
      messages.length === 1 &&
      status !== 'streaming'
    ) {
      const timer = setTimeout(() => {
        sendMessage(params.initialQuery);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [params.initialQuery, hasInitialized, messages.length, status, sendMessage]);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, status]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || status === 'streaming') return;
    sendMessage(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  }, [inputText, status, sendMessage]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.iconContainer}>
            <Sparkles size={18} color={colors.surface} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ree</Text>
            <Text style={styles.headerSubtitle}>Training companion</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityLabel="Close chat"
        >
          <X size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          onPress={() => setMode('basic')}
          style={[
            styles.modeChip,
            mode === 'basic' && styles.modeChipActive,
          ]}
        >
          <Text
            style={[
              styles.modeChipText,
              mode === 'basic' && styles.modeChipTextActive,
            ]}
          >
            Basic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('deep')}
          style={[
            styles.modeChip,
            mode === 'deep' && styles.modeChipActive,
          ]}
        >
          <Text
            style={[
              styles.modeChipText,
              mode === 'deep' && styles.modeChipTextActive,
            ]}
          >
            Deep Thinking
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        keyboardDismissMode="interactive"
      >
        {messages
          .filter(m => m.role !== 'system')
          .map(m => (
            <View
              key={m.id}
              style={[
                styles.messageBubble,
                m.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.role === 'user'
                    ? styles.userMessageText
                    : styles.aiMessageText,
                ]}
              >
                {m.parts.map(p => p.type === 'text' && p.text).join('')}
              </Text>
            </View>
          ))}

        {status === 'streaming' && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Something didn't load correctly. Try again when ready.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Ask anything…"
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || status === 'streaming') &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || status === 'streaming'}
          >
            <Send size={18} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeChipTextActive: {
    color: colors.surface,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.surface,
  },
  aiMessageText: {
    color: colors.text,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
});
