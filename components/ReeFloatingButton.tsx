import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
  PanResponder,
<<<<<<< HEAD
  Dimensions,
  LayoutAnimation,
=======
  useWindowDimensions,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb, HelpCircle, BarChart3, Dumbbell, Heart, TrendingUp, Apple, Home } from 'lucide-react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { useRee } from '@/contexts/ReeContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { CheckInModal } from './CheckInModal';

<<<<<<< HEAD
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 64; // Slightly larger for "Orb" feel
const PULSE_SCALE = 1.1;
=======
interface NavigationOption {
  id: string;
  label: string;
  icon: typeof Dumbbell;
  mode: 'workout' | 'recovery' | 'progress' | 'nutrition' | 'ai';
  route: string;
}

interface AIOption {
  id: string;
  label: string;
  icon: typeof Lightbulb;
  action: () => void;
}
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

export function ReeFloatingButton() {
  const router = useRouter();
  const { currentInsight, hasUnseenInsight } = useRee();
  const { setCurrentMode } = useAppMode();

<<<<<<< HEAD
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Animation Values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(SCREEN_WIDTH - BUTTON_SIZE - 20)).current;
  const positionY = useRef(new Animated.Value(SCREEN_HEIGHT - 120)).current;
=======
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const BUTTON_SIZE = 56;
  const DOUBLE_TAP_DELAY = 300;

  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const aiMenuAnim = useRef(new Animated.Value(0)).current;
  const navMenuAnim = useRef(new Animated.Value(0)).current;
  // Initialize position safely within bounds
  const positionX = useRef(new Animated.Value(SCREEN_WIDTH - BUTTON_SIZE - 20)).current;
  const positionY = useRef(new Animated.Value(SCREEN_HEIGHT - 180)).current;
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

  const isDragging = useRef(false);
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const DRAG_THRESHOLD = 5;

<<<<<<< HEAD
  // Breathing Pulse Animation
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: PULSE_SCALE,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [pulseAnim]);
=======
  // Update position if screen dimensions change (orientation change)
  // This ensures the button doesn't get lost off-screen
  React.useEffect(() => {
    const currentX = (positionX as any)._value;
    const currentY = (positionY as any)._value;

    // Snap to right edge if it was near the right edge, or keep relative position
    if (currentX > SCREEN_WIDTH / 2) {
      positionX.setValue(SCREEN_WIDTH - BUTTON_SIZE - 20);
    } else {
      positionX.setValue(20);
    }

    // Ensure Y is within bounds
    const maxY = SCREEN_HEIGHT - BUTTON_SIZE - Math.max(100, insets.bottom + 80);
    if (currentY > maxY) {
      positionY.setValue(maxY);
    }
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, insets.bottom]);
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > DRAG_THRESHOLD || Math.abs(gestureState.dy) > DRAG_THRESHOLD;
      },

      onPanResponderGrant: (evt) => {
        dragStartPosition.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
        isDragging.current = false;
<<<<<<< HEAD
=======
        isHolding.current = true;
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderMove: (evt, gestureState) => {
        const deltaX = Math.abs(evt.nativeEvent.pageX - dragStartPosition.current.x);
        const deltaY = Math.abs(evt.nativeEvent.pageY - dragStartPosition.current.y);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          isDragging.current = true;

<<<<<<< HEAD
          const newX = Math.max(10, Math.min(SCREEN_WIDTH - BUTTON_SIZE - 10, gestureState.moveX - BUTTON_SIZE / 2));
          const newY = Math.max(50, Math.min(SCREEN_HEIGHT - BUTTON_SIZE - 90, gestureState.moveY - BUTTON_SIZE / 2));
=======
          // Use insets logic for boundaries during drag
          const minX = insets.left + 10;
          const maxX = SCREEN_WIDTH - insets.right - BUTTON_SIZE - 10;
          const minY = insets.top + 50;
          const maxY = SCREEN_HEIGHT - insets.bottom - BUTTON_SIZE - 80;

          const newX = Math.max(minX, Math.min(maxX, gestureState.moveX - BUTTON_SIZE / 2));
          const newY = Math.max(minY, Math.min(maxY, gestureState.moveY - BUTTON_SIZE / 2));
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

          positionX.setValue(newX);
          positionY.setValue(newY);
        }
      },

      onPanResponderRelease: () => {
<<<<<<< HEAD
=======
        isHolding.current = false;

>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

<<<<<<< HEAD
        if (!isDragging.current) {
          haptics.medium();
          setShowCheckIn(true);
=======
        if (!isDragging.current && !showNavMenu && !showAIMenu) {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTime.current;

          if (timeSinceLastTap < DOUBLE_TAP_DELAY && tapCount.current === 1) {
            if (tapTimer.current) {
              clearTimeout(tapTimer.current);
              tapTimer.current = null;
            }
            tapCount.current = 0;
            haptics.medium();
            openNavMenu();
          } else {
            tapCount.current = 1;
            lastTapTime.current = now;

            tapTimer.current = setTimeout(() => {
              if (tapCount.current === 1) {
                haptics.light();
                openAIMenu();
              }
              tapCount.current = 0;
            }, DOUBLE_TAP_DELAY);
          }
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
        }

        if (isDragging.current) {
          const currentX = (positionX as any)._value;
          const currentY = (positionY as any)._value;

<<<<<<< HEAD
          // Snap logic
          const snapToLeft = currentX < SCREEN_WIDTH / 2;
          const targetX = snapToLeft ? 20 : SCREEN_WIDTH - BUTTON_SIZE - 20;
=======
          const maxY = SCREEN_HEIGHT - BUTTON_SIZE - Math.max(100, insets.bottom + 80);
          const minY = insets.top + 60;
          const constrainedY = Math.max(minY, Math.min(maxY, currentY));

          const snapToLeft = currentX < SCREEN_WIDTH / 2;
          const targetX = snapToLeft ? (insets.left + 20) : (SCREEN_WIDTH - insets.right - BUTTON_SIZE - 20);
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

          Animated.spring(positionX, {
            toValue: targetX,
            useNativeDriver: false,
          }).start();

          Animated.spring(positionY, {
            toValue: currentY, // Keep Y position
            useNativeDriver: false,
          }).start();
        }

        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      },
    })
  ).current;

<<<<<<< HEAD
  const handleCheckInSubmit = (data: { energy: number; soreness: number; stress: number }) => {
    console.log("Check In Data:", data);
    // TODO: Process data and show Executive Summary
    haptics.success();
  };

  return (
    <>
      <CheckInModal
        visible={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleCheckInSubmit}
      />

=======
  const openAIMenu = useCallback(() => {
    setShowAIMenu(true);
    Animated.spring(aiMenuAnim, {
      toValue: 1,
      tension: 200,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [aiMenuAnim]);

  const closeAIMenu = useCallback(() => {
    Animated.timing(aiMenuAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowAIMenu(false);
    });
  }, [aiMenuAnim]);

  const openNavMenu = useCallback(() => {
    setShowNavMenu(true);
    Animated.spring(navMenuAnim, {
      toValue: 1,
      tension: 200,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [navMenuAnim]);

  const closeNavMenu = useCallback(() => {
    Animated.timing(navMenuAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowNavMenu(false);
    });
  }, [navMenuAnim]);

  const handleQuickTip = useCallback(() => {
    haptics.light();
    closeAIMenu();
    const query = currentInsight
      ? `Give me a quick tip about: ${currentInsight.message}`
      : "Give me a quick wellness tip for today";
    router.push(`/ai-chat?initialQuery=${encodeURIComponent(query)}`);
  }, [currentInsight, router, closeAIMenu]);

  const handleAskQuestion = useCallback(() => {
    haptics.light();
    closeAIMenu();
    router.push('/ai-chat');
  }, [router, closeAIMenu]);

  const handleViewInsights = useCallback(() => {
    haptics.light();
    closeAIMenu();
    router.push('/ai-chat?initialQuery=Show%20me%20my%20recent%20insights%20and%20progress');
  }, [router, closeAIMenu]);

  const handleNavigationOption = useCallback((option: NavigationOption) => {
    haptics.medium();
    setCurrentMode(option.mode);
    closeNavMenu();
    router.push(option.route as any);
  }, [router, setCurrentMode, closeNavMenu]);

  const navigationOptions: NavigationOption[] = [
    { id: 'home', label: 'Home', icon: Home, mode: 'workout', route: '/(tabs)/' },
    { id: 'workout', label: 'Workout Plan', icon: Dumbbell, mode: 'workout', route: '/(tabs)/plan' },
    { id: 'recovery', label: 'Recovery', icon: Heart, mode: 'recovery', route: '/(tabs)/recovery' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, mode: 'progress', route: '/(tabs)/progress' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, mode: 'nutrition', route: '/(tabs)/nutrition' },
  ];

  const aiOptions: AIOption[] = [
    { id: 'quick-tip', label: 'Quick tip', icon: Lightbulb, action: handleQuickTip },
    { id: 'ask-question', label: 'Ask question', icon: HelpCircle, action: handleAskQuestion },
    { id: 'view-insights', label: 'View insights', icon: BarChart3, action: handleViewInsights },
  ];

  return (
    <>
      {(showAIMenu || showNavMenu) && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            if (showAIMenu) closeAIMenu();
            if (showNavMenu) closeNavMenu();
          }}
        />
      )}

      {showAIMenu && (
        <Animated.View
          style={[
            styles.aiMenuContainer,
            {
              bottom: (Platform.OS === 'ios' ? 120 : 100) + insets.bottom,
              opacity: aiMenuAnim,
              transform: [
                {
                  translateY: aiMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                },
                {
                  scale: aiMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                },
              ],
            }
          ]}
        >
          {aiOptions.map((option) => (
            <Animated.View
              key={option.id}
              style={[
                {
                  opacity: aiMenuAnim,
                  transform: [
                    {
                      translateX: aiMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.aiOptionButton}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <option.icon size={18} color={liquidGlass.accent.primary} strokeWidth={2} />
                <Text style={styles.aiOptionLabel}>{option.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {showNavMenu && (
        <Animated.View
          style={[
            styles.navMenuContainer,
            {
              opacity: navMenuAnim,
              transform: [
                {
                  scale: navMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }
              ],
            }
          ]}
        >
          <View style={styles.navMenuContent}>
            <View style={styles.navMenuHeader}>
              <Text style={styles.navMenuTitle}>Navigate to</Text>
            </View>
            {navigationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.navOptionButton}
                onPress={() => handleNavigationOption(option)}
                activeOpacity={0.7}
              >
                <View style={styles.navOptionIcon}>
                  <option.icon size={20} color={liquidGlass.accent.primary} strokeWidth={2} />
                </View>
                <Text style={styles.navOptionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
      <Animated.View
        style={[
          styles.floatingButton,
          {
            left: positionX,
            top: positionY,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={liquidGlass.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          {/* Inner Glow Ring */}
          <View style={styles.innerRing}>
            {/* "Lung" Pulse Effect */}
            <View style={styles.core} />
          </View>
        </LinearGradient>

<<<<<<< HEAD
        {/* Outer Glow Layer */}
        <View style={styles.glow} />
=======
        {hasUnseenInsight && !showAIMenu && !showNavMenu && (
          <View style={styles.badge} />
        )}
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 100,
    ...glassShadows.glowStrong, // Strong glow for the Orb
  },
  buttonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
=======
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: liquidGlass.text.inverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: liquidGlass.accent.primary,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B9D',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  aiMenuContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 99,
    gap: 10,
  },
  aiOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderRadius: 16,
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    minWidth: 150,
    ...glassShadows.medium,
  },
  aiOptionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    color: liquidGlass.text.primary,
  },

  navMenuContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -140,
    marginTop: -180,
    width: 280,
    zIndex: 99,
    borderRadius: 24,
    overflow: 'hidden',
    ...glassShadows.medium,
  },
  navMenuContent: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
    overflow: 'hidden',
  },
  innerRing: {
    width: BUTTON_SIZE - 6,
    height: BUTTON_SIZE - 6,
    borderRadius: (BUTTON_SIZE - 6) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  core: {
    width: BUTTON_SIZE / 3,
    height: BUTTON_SIZE / 3,
    borderRadius: BUTTON_SIZE / 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  glow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: BUTTON_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: -1,
  },
});
