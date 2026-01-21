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
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Send, Sparkles, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { useApp } from '@/contexts/AppContext';
import { useHealth } from '@/contexts/HealthContext';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { REE_SYSTEM_PROMPT } from '@/constants/reeBehavior';

export default function AIChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialQuery?: string }>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const { userProfile, getTodayLog, getTodayWorkout } = useApp();
  const { getTodaySteps, getTodaySleep, calculateReadinessFactors, isConnected: isHealthConnected } = useHealth();
  const todayLog = getTodayLog();
  const todayWorkout = getTodayWorkout();

  const [inputText, setInputText] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [mode, setMode] = useState<'basic' | 'deep'>('basic');
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  
  
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;

  const todaySteps = getTodaySteps();
  const todaySleep = getTodaySleep();
  const readinessFactors = calculateReadinessFactors(todayLog?.painLevel, todayLog?.confidenceLevel === 1 ? 'low' : todayLog?.confidenceLevel === 3 ? 'high' : 'medium');

  const healthContext = isHealthConnected ? `
Health Data (from connected device):
- Today's Steps: ${todaySteps}
- Last Sleep: ${todaySleep ? `${(todaySleep.durationMinutes / 60).toFixed(1)} hours (${todaySleep.quality || 'quality unknown'})` : 'Not recorded'}
- Readiness Score: ${readinessFactors.overallScore}/100
- Recovery Insights: ${readinessFactors.insights.join(', ') || 'None'}
` : '';

  const userContext = userProfile
    ? `
User Profile:
- Name: ${userProfile.questionnaireProfile?.preferredName || 'User'}
- Injury: ${userProfile.injuryType}
- Sport: ${userProfile.sportType || 'Not specified'}
- Training Style: ${userProfile.trainingStyle}
- Weekly Frequency: ${userProfile.weeklyFrequency} days/week
- Fitness Level: ${userProfile.questionnaireProfile?.fitnessLevel || 'Not specified'}
- Goals: ${userProfile.questionnaireProfile?.primaryGoals?.join(', ') || 'Not specified'}

Current Status:
- Today's Workout: ${todayWorkout?.title || 'None scheduled'}
- Pain Level: ${todayLog?.painLevel ?? 'Not recorded'}
- Confidence: ${todayLog?.confidenceLevel ?? 'Not recorded'}
${healthContext}
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
    if (!isUserScrolledUp && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, status, isUserScrolledUp]);

  useEffect(() => {
    Animated.timing(scrollButtonAnim, {
      toValue: isUserScrolledUp ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isUserScrolledUp, scrollButtonAnim]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    
    const isNearBottom = distanceFromBottom < 100;
    setIsUserScrolledUp(!isNearBottom);
  }, []);

  const handleScrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setIsUserScrolledUp(false);
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || status === 'streaming') return;
    setIsUserScrolledUp(false);
    sendMessage(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  }, [inputText, status, sendMessage]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={liquidGlass.background.gradient}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <LinearGradient
            colors={liquidGlass.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Sparkles size={18} color={liquidGlass.text.inverse} />
          </LinearGradient>
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
          <X size={22} color={liquidGlass.text.secondary} />
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

      <View style={styles.chatWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          keyboardDismissMode="interactive"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          
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
              <ActivityIndicator size="small" color={liquidGlass.accent.primary} />
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Something didn&apos;t load correctly. Try again when ready.
              </Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>

        <Animated.View
          style={[
            styles.scrollToBottomButton,
            {
              opacity: scrollButtonAnim,
              transform: [
                {
                  translateY: scrollButtonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={isUserScrolledUp ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.scrollToBottomTouchable}
            onPress={handleScrollToBottom}
            activeOpacity={0.8}
          >
            <ChevronDown size={20} color={liquidGlass.text.primary} />
          </TouchableOpacity>
        </Animated.View>
      </View>

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
            placeholderTextColor={liquidGlass.text.tertiary}
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
            <Send size={18} color={liquidGlass.text.inverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: liquidGlass.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: liquidGlass.border.subtle,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: liquidGlass.text.secondary,
  },
  closeButton: {
    padding: 8,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: liquidGlass.surface.glassDark,
    borderBottomWidth: 1,
    borderBottomColor: liquidGlass.border.subtle,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  modeChipActive: {
    backgroundColor: liquidGlass.accent.primary,
    borderColor: liquidGlass.accent.primary,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: liquidGlass.text.secondary,
  },
  modeChipTextActive: {
    color: liquidGlass.text.inverse,
  },
  chatWrapper: {
    flex: 1,
    position: 'relative',
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
    backgroundColor: liquidGlass.accent.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: liquidGlass.surface.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: liquidGlass.text.inverse,
  },
  aiMessageText: {
    color: liquidGlass.text.primary,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: liquidGlass.status.dangerMuted,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: liquidGlass.status.danger,
    textAlign: 'center',
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    zIndex: 10,
  },
  scrollToBottomTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassShadows.soft,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    backgroundColor: liquidGlass.surface.glassDark,
    borderTopWidth: 1,
    borderTopColor: liquidGlass.border.subtle,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: liquidGlass.text.primary,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: liquidGlass.surface.glass,
  },
});
