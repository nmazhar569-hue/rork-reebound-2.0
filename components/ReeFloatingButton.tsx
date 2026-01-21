import React, { useRef, useCallback, useEffect, useMemo, memo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { useRee } from '@/contexts/ReeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 64;
const EDGE_PADDING = 16;

const ReeFloatingButtonComponent = () => {
  const { hasUnseenInsight, expandRee } = useRee();
  
  // Use persistent refs for animation values to prevent recreation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(SCREEN_WIDTH - BUTTON_SIZE - EDGE_PADDING)).current;
  const positionY = useRef(new Animated.Value(SCREEN_HEIGHT - 200)).current;
  
  // Drag state management
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const DRAG_THRESHOLD = 10; // Increased threshold for better stability
  const DOUBLE_TAP_DELAY = 300;

  // Memoized animation setup to prevent recreation on every render
  useEffect(() => {
    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();
    pulseAnimation.start();

    return () => {
      glowAnimation.stop();
      pulseAnimation.stop();
    };
  }, []); // Empty dependency array - only run once

  const snapToNearestSide = useCallback((currentX: number, currentY: number) => {
    const maxY = SCREEN_HEIGHT - BUTTON_SIZE - 120;
    const minY = 80;
    const constrainedY = Math.max(minY, Math.min(maxY, currentY));
    
    const snapToLeft = currentX < SCREEN_WIDTH / 2;
    const targetX = snapToLeft ? EDGE_PADDING : SCREEN_WIDTH - BUTTON_SIZE - EDGE_PADDING;
    
    Animated.parallel([
      Animated.spring(positionX, {
        toValue: targetX,
        tension: 120,
        friction: 10,
        useNativeDriver: false,
      }),
      Animated.spring(positionY, {
        toValue: constrainedY,
        tension: 120,
        friction: 10,
        useNativeDriver: false,
      }),
    ]).start();
    
    haptics.light();
  }, []);

  // Handle button tap/press
  const handlePress = useCallback(() => {
    if (isDragging.current || hasMoved.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;
    
    if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
      // Double tap - navigate to AI chat
      haptics.medium();
      router.push('/ai-chat');
    } else {
      // Single tap - expand Ree
      haptics.light();
      expandRee();
    }
    
    lastTap.current = now;
  }, [expandRee]);

  // Optimized PanResponder with better touch handling
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const moved = Math.abs(gestureState.dx) > DRAG_THRESHOLD || 
                       Math.abs(gestureState.dy) > DRAG_THRESHOLD;
          return moved;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const moved = Math.abs(gestureState.dx) > DRAG_THRESHOLD || 
                       Math.abs(gestureState.dy) > DRAG_THRESHOLD;
          return moved;
        },
        
        onPanResponderGrant: (evt) => {
          dragStartPosition.current = {
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
          };
          isDragging.current = false;
          hasMoved.current = false;
          
          Animated.spring(scaleAnim, {
            toValue: 0.92,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }).start();
        },
        
        onPanResponderMove: (evt, gestureState) => {
          const deltaX = Math.abs(evt.nativeEvent.pageX - dragStartPosition.current.x);
          const deltaY = Math.abs(evt.nativeEvent.pageY - dragStartPosition.current.y);
          
          if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
            if (!isDragging.current) {
              isDragging.current = true;
              hasMoved.current = true;
            }
            
            const newX = Math.max(
              EDGE_PADDING, 
              Math.min(
                SCREEN_WIDTH - BUTTON_SIZE - EDGE_PADDING, 
                gestureState.moveX - BUTTON_SIZE / 2
              )
            );
            const newY = Math.max(
              80, 
              Math.min(
                SCREEN_HEIGHT - BUTTON_SIZE - 120, 
                gestureState.moveY - BUTTON_SIZE / 2
              )
            );
            
            positionX.setValue(newX);
            positionY.setValue(newY);
          }
        },
        
        onPanResponderRelease: (_, gestureState) => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }).start();
          
          if (hasMoved.current) {
            const currentX = (positionX as any)._value;
            const currentY = (positionY as any)._value;
            snapToNearestSide(currentX, currentY);
            
            // Reset drag state after animation
            setTimeout(() => {
              isDragging.current = false;
              hasMoved.current = false;
            }, 100);
          } else {
            // It was a tap, not a drag
            setTimeout(() => {
              isDragging.current = false;
              hasMoved.current = false;
              handlePress();
            }, 50);
          }
        },
        
        onPanResponderTerminate: () => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }).start();
          
          isDragging.current = false;
          hasMoved.current = false;
        },
      }),
    [handlePress, snapToNearestSide]
  );

  return (
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
      <Animated.View 
        style={[
          styles.outerGlow,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]} 
      />
      
      <Animated.View 
        style={[
          styles.middleGlow,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0.6, 1],
              outputRange: [0.3, 0.5],
            }),
          },
        ]} 
      />
      
      <LinearGradient
        colors={['rgba(0, 217, 184, 0.25)', 'rgba(0, 168, 150, 0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <View style={styles.innerCircle}>
          <Svg width={32} height={20} viewBox="0 0 32 20">
            <Path
              d="M0 10 L6 10 L9 4 L13 16 L17 6 L20 12 L23 10 L32 10"
              stroke={liquidGlass.accent.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </LinearGradient>
      
      <View style={styles.innerBorder} />
      
      {hasUnseenInsight && (
        <Animated.View 
          style={[
            styles.badge,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]} 
        />
      )}
    </Animated.View>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ReeFloatingButton = memo(ReeFloatingButtonComponent);

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: BUTTON_SIZE + 30,
    height: BUTTON_SIZE + 30,
    borderRadius: (BUTTON_SIZE + 30) / 2,
    backgroundColor: liquidGlass.accent.glow,
  },
  middleGlow: {
    position: 'absolute',
    width: BUTTON_SIZE + 16,
    height: BUTTON_SIZE + 16,
    borderRadius: (BUTTON_SIZE + 16) / 2,
    backgroundColor: liquidGlass.accent.muted,
  },
  buttonGradient: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 217, 184, 0.4)',
  },
  innerCircle: {
    width: BUTTON_SIZE - 12,
    height: BUTTON_SIZE - 12,
    borderRadius: (BUTTON_SIZE - 12) / 2,
    backgroundColor: 'rgba(10, 26, 31, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 184, 0.25)',
  },
  innerBorder: {
    position: 'absolute',
    width: BUTTON_SIZE - 4,
    height: BUTTON_SIZE - 4,
    borderRadius: (BUTTON_SIZE - 4) / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 184, 0.15)',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B9D',
    borderWidth: 2,
    borderColor: liquidGlass.background.primary,
    ...glassShadows.soft,
  },
});
