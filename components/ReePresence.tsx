import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Sparkles, X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { useRee } from '@/contexts/ReeContext';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReePresenceProps {
  style?: object;
}

export function ReePresence({ style }: ReePresenceProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    currentInsight,
    isMinimized,
    shouldShowPresence,
    hasUnseenInsight,
    dismissCurrentInsight,
    minimizeRee,
    expandRee,
    recordInteraction,
  } = useRee();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldShowPresence && currentInsight) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();

      if (hasUnseenInsight) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShowPresence, currentInsight, hasUnseenInsight, fadeAnim, slideAnim, pulseAnim]);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isMinimized ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isMinimized, expandAnim]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismissCurrentInsight();
  }, [dismissCurrentInsight]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isMinimized) {
      expandRee();
    } else {
      minimizeRee();
    }
  }, [isMinimized, expandRee, minimizeRee]);

  const handleAskRee = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordInteraction();
    const query = currentInsight
      ? `${currentInsight.message} Can you tell me more?`
      : "Can you help me understand what I'm looking at?";
    router.push(`/ai-chat?initialQuery=${encodeURIComponent(query)}`);
  }, [currentInsight, router, recordInteraction]);

  if (!shouldShowPresence || !currentInsight) {
    return null;
  }

  const categoryColors: Record<string, string> = {
    orientation: colors.primary,
    explanation: colors.info,
    choice_support: colors.accent,
    confidence: colors.success,
    context_shift: colors.warning,
  };

  const accentColor = categoryColors[currentInsight.category] || colors.primary;

  const cardHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, currentInsight.expandedMessage ? 180 : 140],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          bottom: 100 + insets.bottom, // Dynamic bottom offset
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <Animated.View style={[styles.card, { height: cardHeight, borderLeftColor: accentColor }]}>
        {isMinimized ? (
          <TouchableOpacity
            style={styles.minimizedContent}
            onPress={handleToggle}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
              <Sparkles size={16} color={accentColor} />
            </View>
            <Text style={styles.minimizedLabel} numberOfLines={1}>
              Ree has something
            </Text>
            <View style={styles.minimizedActions}>
              <ChevronUp size={18} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.expandedContent}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
                  <Sparkles size={14} color={accentColor} />
                </View>
                <Text style={styles.reeLabel}>Ree</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleToggle}
                  style={styles.headerButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ChevronDown size={16} color={colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.headerButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.message}>{currentInsight.message}</Text>

            {currentInsight.expandedMessage && (
              <Text style={styles.expandedMessage}>{currentInsight.expandedMessage}</Text>
            )}

            <TouchableOpacity onPress={handleAskRee} style={styles.askButton}>
              <MessageCircle size={14} color={colors.primary} />
              <Text style={styles.askButtonText}>Ask Ree</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export function ReeMiniBadge() {
  const router = useRouter();
  const { shouldShowPresence, hasUnseenInsight, recordInteraction } = useRee();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasUnseenInsight) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasUnseenInsight, pulseAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordInteraction();
    router.push('/ai-chat');
  }, [router, recordInteraction]);

  if (!shouldShowPresence) {
    return null;
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.miniBadge,
          { transform: [{ scale: pulseAnim }] },
          hasUnseenInsight && styles.miniBadgeActive,
        ]}
      >
        <Sparkles size={18} color={hasUnseenInsight ? colors.surface : colors.primary} />
        {hasUnseenInsight && <View style={styles.unseenDot} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Dynamic bottom position to avoid home indicator
    bottom: 0,
    paddingBottom: 0, // Handled by container style dynamic calculation in render
    left: 16,
    right: 16,
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimizedLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  minimizedActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reeLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  message: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  expandedMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: colors.primary + '10',
    borderRadius: 14,
  },
  askButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  miniBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniBadgeActive: {
    backgroundColor: colors.primary,
  },
  unseenDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
