import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb, HelpCircle, BarChart3, X } from 'lucide-react-native';
import colors, { gradients, borderRadius, shadows, animation } from '@/constants/colors';
import { haptics } from '@/utils/haptics';
import { useRee } from '@/contexts/ReeContext';

interface PopupOption {
  id: string;
  label: string;
  icon: typeof Lightbulb;
  action: () => void;
}

export function ReeFloatingButton() {
  const router = useRouter();
  const { currentInsight, hasUnseenInsight } = useRee();
  const [isOpen, setIsOpen] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const popupAnim = useRef(new Animated.Value(0)).current;
  const option1Anim = useRef(new Animated.Value(0)).current;
  const option2Anim = useRef(new Animated.Value(0)).current;
  const option3Anim = useRef(new Animated.Value(0)).current;
  const reduceMotion = useRef(false);

  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.12,
              duration: 2400,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: 2400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2400,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 2400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
      if (!enabled && hasUnseenInsight) {
        startPulse();
      }
    });
  }, [pulseAnim, opacityAnim, hasUnseenInsight]);

  const openPopup = useCallback(() => {
    setIsOpen(true);
    haptics.medium();
    
    Animated.parallel([
      Animated.spring(popupAnim, {
        toValue: 1,
        tension: animation.spring.tension,
        friction: animation.spring.friction,
        useNativeDriver: true,
      }),
      Animated.stagger(50, [
        Animated.spring(option1Anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(option2Anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(option3Anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [popupAnim, option1Anim, option2Anim, option3Anim]);

  const closePopup = useCallback(() => {
    Animated.parallel([
      Animated.timing(popupAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(option1Anim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(option2Anim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(option3Anim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  }, [popupAnim, option1Anim, option2Anim, option3Anim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      tension: animation.spring.tension,
      friction: animation.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: animation.spring.tension,
      friction: animation.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (isOpen) {
      closePopup();
    } else {
      openPopup();
    }
  }, [isOpen, openPopup, closePopup]);

  const handleQuickTip = useCallback(() => {
    haptics.light();
    closePopup();
    const query = currentInsight 
      ? `Give me a quick tip about: ${currentInsight.message}`
      : "Give me a quick wellness tip for today";
    router.push(`/ai-chat?initialQuery=${encodeURIComponent(query)}`);
  }, [currentInsight, router, closePopup]);

  const handleAskQuestion = useCallback(() => {
    haptics.light();
    closePopup();
    router.push('/ai-chat');
  }, [router, closePopup]);

  const handleViewInsights = useCallback(() => {
    haptics.light();
    closePopup();
    router.push('/ai-chat?initialQuery=Show%20me%20my%20recent%20insights%20and%20progress');
  }, [router, closePopup]);

  const options: PopupOption[] = [
    { id: 'quick-tip', label: 'Quick tip', icon: Lightbulb, action: handleQuickTip },
    { id: 'ask-question', label: 'Ask question', icon: HelpCircle, action: handleAskQuestion },
    { id: 'view-insights', label: 'View insights', icon: BarChart3, action: handleViewInsights },
  ];

  const optionAnims = [option1Anim, option2Anim, option3Anim];

  return (
    <>
      {isOpen && (
        <Pressable style={styles.overlay} onPress={closePopup}>
          <Animated.View 
            style={[
              styles.popupContainer,
              {
                opacity: popupAnim,
                transform: [
                  { 
                    translateY: popupAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }
                ],
              }
            ]}
          >
            {options.map((option, index) => {
              return (
                <Animated.View
                  key={option.id}
                  style={[
                    styles.optionWrapper,
                    {
                      opacity: optionAnims[index],
                      transform: [
                        {
                          translateX: optionAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                        {
                          scale: optionAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={option.action}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </Pressable>
      )}
      
      <View style={styles.container}>
        {!isOpen && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <LinearGradient
              colors={gradients.primarySoft}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pulseGradient}
            />
          </Animated.View>
        )}
        
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityLabel="Open Ree assistant menu"
          accessibilityRole="button"
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={isOpen ? [colors.textSecondary, colors.text] : gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <View style={styles.inner}>
                {isOpen ? (
                  <X size={20} color={colors.surface} strokeWidth={2.5} />
                ) : (
                  <View style={styles.icon}>
                    <Text style={styles.iconText}>R</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        
        {hasUnseenInsight && !isOpen && (
          <View style={styles.badge} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
  },
  pulseGradient: {
    flex: 1,
    borderRadius: 38,
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
      },
      android: {
        elevation: 7,
      },
    }),
  },
  inner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  popupContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 130 : 110,
    right: 20,
    alignItems: 'flex-end',
    gap: 8,
  },
  optionWrapper: {
    alignItems: 'flex-end',
  },
  optionButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
