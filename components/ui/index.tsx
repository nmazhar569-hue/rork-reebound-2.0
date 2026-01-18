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
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: 22,
    ...shadows.soft,
  },
  cardElevated: {
    ...shadows.medium,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.full,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  solidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  solidButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowOpacity: 0,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
  },
  ghostButtonDisabled: {
    opacity: 0.5,
  },
  ghostButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
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
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    ...shadows.soft,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateAction: {
    marginTop: 20,
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
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: borderRadius.xl,
    gap: 12,
  },
  infoBoxIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBoxContent: {
    flex: 1,
  },
});
