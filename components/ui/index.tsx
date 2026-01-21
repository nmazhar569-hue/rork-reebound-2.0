import React, { ReactNode, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import colors, { gradients, borderRadius, shadows, animation } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, style, contentStyle }: ScreenContainerProps) {
  if (scroll) {
    return (
      <ScrollView
        style={[styles.screenContainer, style]}
        contentContainerStyle={[styles.screenContent, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }
  return (
    <View style={[styles.screenContainer, styles.screenContent, style]}>
      {children}
    </View>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}

export function PageHeader({ title, subtitle, rightElement }: PageHeaderProps) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderText}>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </View>
  );
}

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated }: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.cardElevated, style]}>
      {children}
    </View>
  );
}

interface ButtonProps {
  onPress: () => void;
  children?: ReactNode;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function PrimaryButton({ onPress, label, icon: Icon, iconPosition = 'left', disabled, style, testID }: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    haptics.soft();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={disabled ? [colors.textTertiary, colors.textTertiary] : gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          {Icon && iconPosition === 'left' && <Icon size={20} color={colors.surface} />}
          {label && <Text style={styles.primaryButtonText}>{label}</Text>}
          {Icon && iconPosition === 'right' && <Icon size={20} color={colors.surface} />}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function SolidButton({ onPress, label, icon: Icon, iconPosition = 'left', disabled, style, testID }: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    haptics.soft();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
    >
      <Animated.View style={[styles.solidButton, disabled && styles.buttonDisabled, style, { transform: [{ scale: scaleAnim }] }]}>
        {Icon && iconPosition === 'left' && <Icon size={20} color={colors.surface} />}
        {label && <Text style={styles.solidButtonText}>{label}</Text>}
        {Icon && iconPosition === 'right' && <Icon size={20} color={colors.surface} />}
      </Animated.View>
    </Pressable>
  );
}

export function GhostButton({ onPress, label, icon: Icon, iconPosition = 'left', disabled, style, testID }: ButtonProps) {
  const handlePress = useCallback(() => {
    haptics.selection();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      style={[styles.ghostButton, disabled && styles.ghostButtonDisabled, style]}
    >
      {Icon && iconPosition === 'left' && <Icon size={18} color={colors.primary} />}
      {label && <Text style={styles.ghostButtonText}>{label}</Text>}
      {Icon && iconPosition === 'right' && <Icon size={18} color={colors.primary} />}
    </TouchableOpacity>
  );
}

interface IconButtonProps {
  onPress: () => void;
  icon: LucideIcon;
  size?: number;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export function IconButton({ onPress, icon: Icon, size = 22, color = colors.textSecondary, style, testID }: IconButtonProps) {
  const handlePress = useCallback(() => {
    haptics.light();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.iconButton, style]} testID={testID} activeOpacity={0.7}>
      <Icon size={size} color={color} />
    </TouchableOpacity>
  );
}

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ label, color = colors.primary, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '15' }, style]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

interface EmptyStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      {title && <Text style={styles.emptyStateTitle}>{title}</Text>}
      <Text style={styles.emptyStateText}>{message}</Text>
      {action && (
        <GhostButton onPress={action.onPress} label={action.label} style={styles.emptyStateAction} />
      )}
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
  height?: number;
  showGradient?: boolean;
}

export function ProgressBar({ progress, height = 6, showGradient = true }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  return (
    <View style={[styles.progressBarContainer, { height }]}>
      {showGradient ? (
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${clampedProgress}%`, borderRadius: height / 2 }]}
        />
      ) : (
        <View style={[styles.progressBarFillSolid, { width: `${clampedProgress}%`, borderRadius: height / 2 }]} />
      )}
    </View>
  );
}

interface SectionTitleProps {
  title: string;
  style?: TextStyle;
}

export function SectionTitle({ title, style }: SectionTitleProps) {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
}

interface InfoBoxProps {
  children: ReactNode;
  icon?: LucideIcon;
  color?: string;
  style?: ViewStyle;
}

export function InfoBox({ children, icon: Icon, color = colors.primary, style }: InfoBoxProps) {
  return (
    <View style={[styles.infoBox, { backgroundColor: color + '08' }, style]}>
      {Icon && (
        <View style={[styles.infoBoxIcon, { backgroundColor: color + '15' }]}>
          <Icon size={16} color={color} />
        </View>
      )}
      <View style={styles.infoBoxContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    padding: 20,
    paddingTop: 60,
  },
  bottomSpacer: {
    height: 100,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pageHeaderText: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: 22,
    ...shadows.medium,
  },
  cardElevated: {
    ...shadows.lifted,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderRadius: borderRadius.full,
    ...shadows.glowSoft(colors.primary),
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.surface,
    letterSpacing: 0.2,
  },
  solidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    ...shadows.glowSoft(colors.primary),
  },
  solidButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.surface,
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowOpacity: 0,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
  },
  ghostButtonDisabled: {
    opacity: 0.5,
  },
  ghostButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
    letterSpacing: 0.1,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    ...shadows.medium,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  emptyStateAction: {
    marginTop: 24,
  },
  progressBarContainer: {
    backgroundColor: colors.surfaceDim,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressBarFillSolid: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: borderRadius.xl,
    gap: 14,
  },
  infoBoxIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBoxContent: {
    flex: 1,
  },
});
