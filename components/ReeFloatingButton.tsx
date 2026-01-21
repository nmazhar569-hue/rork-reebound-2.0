import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Lightbulb, HelpCircle, BarChart3, Dumbbell, Heart, TrendingUp, Apple, Home } from 'lucide-react-native';
import { modeColors, glassRadius, glassShadows, neutralColors } from '@/constants/modeColors';
import { haptics } from '@/utils/haptics';
import { useRee } from '@/contexts/ReeContext';
import { useAppMode } from '@/contexts/AppModeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const DOUBLE_TAP_DELAY = 300; // ms between taps for double tap

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

export function ReeFloatingButton() {
  const router = useRouter();
  const { currentInsight, hasUnseenInsight } = useRee();
  const { setCurrentMode, theme } = useAppMode();
  
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const aiMenuAnim = useRef(new Animated.Value(0)).current;
  const navMenuAnim = useRef(new Animated.Value(0)).current;
  const positionX = useRef(new Animated.Value(SCREEN_WIDTH - BUTTON_SIZE - 20)).current;
  const positionY = useRef(new Animated.Value(SCREEN_HEIGHT - 180)).current;
  
  const isDragging = useRef(false);
  const isHolding = useRef(false);
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | number | null>(null);
  const DRAG_THRESHOLD = 5;

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
        isHolding.current = true;
        
        // Press animation
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }).start();
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const deltaX = Math.abs(evt.nativeEvent.pageX - dragStartPosition.current.x);
        const deltaY = Math.abs(evt.nativeEvent.pageY - dragStartPosition.current.y);
        
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          isDragging.current = true;
          
          // Smooth position update while dragging
          const newX = Math.max(10, Math.min(SCREEN_WIDTH - BUTTON_SIZE - 10, gestureState.moveX - BUTTON_SIZE / 2));
          const newY = Math.max(50, Math.min(SCREEN_HEIGHT - BUTTON_SIZE - 90, gestureState.moveY - BUTTON_SIZE / 2));
          
          positionX.setValue(newX);
          positionY.setValue(newY);
        }
      },
      
      onPanResponderRelease: () => {
        isHolding.current = false;
        
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }).start();
        
        // Handle tap detection
        if (!isDragging.current && !showNavMenu && !showAIMenu) {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTime.current;
          
          if (timeSinceLastTap < DOUBLE_TAP_DELAY && tapCount.current === 1) {
            // Double tap detected - show nav menu
            if (tapTimer.current) {
              clearTimeout(tapTimer.current);
              tapTimer.current = null;
            }
            tapCount.current = 0;
            haptics.medium();
            openNavMenu();
          } else {
            // First tap - wait to see if it's a double tap
            tapCount.current = 1;
            lastTapTime.current = now;
            
            tapTimer.current = setTimeout(() => {
              if (tapCount.current === 1) {
                // Single tap - show AI menu
                haptics.light();
                openAIMenu();
              }
              tapCount.current = 0;
            }, DOUBLE_TAP_DELAY);
          }
        }
        
        // Snap to nearest edge after dragging
        if (isDragging.current) {
          const currentX = (positionX as any)._value;
          const currentY = (positionY as any)._value;
          
          // Constrain Y position
          const maxY = SCREEN_HEIGHT - BUTTON_SIZE - 100;
          const minY = 60;
          const constrainedY = Math.max(minY, Math.min(maxY, currentY));
          
          // Snap to nearest edge (left or right)
          const snapToLeft = currentX < SCREEN_WIDTH / 2;
          const targetX = snapToLeft ? 20 : SCREEN_WIDTH - BUTTON_SIZE - 20;
          
          Animated.spring(positionX, {
            toValue: targetX,
            tension: 120,
            friction: 12,
            useNativeDriver: false,
          }).start();
          
          Animated.spring(positionY, {
            toValue: constrainedY,
            tension: 120,
            friction: 12,
            useNativeDriver: false,
          }).start();
        }
        
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      },
    })
  ).current;

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
    router.push(option.route as `/${string}`);
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
      {/* Overlay for closing menus */}
      {(showAIMenu || showNavMenu) && (
        <Pressable 
          style={styles.overlay} 
          onPress={() => {
            if (showAIMenu) closeAIMenu();
            if (showNavMenu) closeNavMenu();
          }}
        />
      )}
      
      {/* AI Quick Menu (Tap) */}
      {showAIMenu && (
        <Animated.View 
          style={[
            styles.aiMenuContainer,
            {
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
          {aiOptions.map((option, index) => (
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
                style={[styles.aiOptionButton]}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <BlurView intensity={80} style={styles.blurContainer} tint="light">
                  <option.icon size={18} color={theme.primary} strokeWidth={2} />
                  <Text style={[styles.aiOptionLabel, { color: neutralColors.text }]}>
                    {option.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Navigation Menu (Hold) */}
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
          <BlurView intensity={90} style={styles.navMenuBlur} tint="light">
            <View style={styles.navMenuHeader}>
              <Text style={styles.navMenuTitle}>Navigate to</Text>
            </View>
            {navigationOptions.map((option) => {
              const optionTheme = modeColors[option.mode];
              return (
                <TouchableOpacity
                  key={option.id}
                  style={styles.navOptionButton}
                  onPress={() => handleNavigationOption(option)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={optionTheme.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.navOptionGradient}
                  >
                    <option.icon size={20} color="#FFF" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={[styles.navOptionLabel, { color: neutralColors.text }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </Animated.View>
      )}
      
      {/* Floating Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            left: positionX,
            top: positionY,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <BlurView intensity={40} style={styles.buttonBlur} tint="light">
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>R</Text>
            </View>
          </BlurView>
        </LinearGradient>
        
        {hasUnseenInsight && !showAIMenu && !showNavMenu && (
          <View style={[styles.badge, { backgroundColor: modeColors.recovery.primary }]} />
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 98,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: glassRadius.full,
    zIndex: 100,
    ...glassShadows.heavy,
  },
  buttonGradient: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: glassRadius.full,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: modeColors.workout.primary,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  
  // AI Menu (quick actions)
  aiMenuContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    zIndex: 99,
    gap: 10,
  },
  aiOptionButton: {
    borderRadius: glassRadius.button,
    overflow: 'hidden',
    ...glassShadows.medium,
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 150,
  },
  aiOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  
  // Navigation Menu (hold)
  navMenuContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -140,
    marginTop: -160,
    width: 280,
    zIndex: 99,
    borderRadius: glassRadius.large,
    overflow: 'hidden',
    ...glassShadows.heavy,
  },
  navMenuBlur: {
    borderRadius: glassRadius.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  navMenuHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  navMenuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: neutralColors.text,
    letterSpacing: -0.2,
  },
  navOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  navOptionGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
