import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Heart, ChevronRight, X, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui';
import { SpatialGlassCard } from '@/components/SpatialGlassCard';
import colors, { borderRadius, gradients, spacing } from '@/constants/colors';
import { ReturnStatus } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WelcomeBackCardProps {
  returnStatus: ReturnStatus;
  onDismiss: () => void;
}

export function WelcomeBackCard({ returnStatus, onDismiss }: WelcomeBackCardProps) {
  const { acknowledgeReturn, userProfile } = useApp();
  const northStar = userProfile?.northStar;
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleContinue = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await acknowledgeReturn();
    onDismiss();
  };

  const handleReflectionSubmit = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await acknowledgeReturn(reflectionText.trim() || undefined);
    onDismiss();
  };

  const toggleReflection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowReflection(!showReflection);
  };

  const getTimeAwayText = () => {
    if (returnStatus.daysAway === 1) return '1 day';
    if (returnStatus.daysAway < 7) return `${returnStatus.daysAway} days`;
    if (returnStatus.daysAway < 14) return 'about a week';
    if (returnStatus.daysAway < 30) return `${Math.floor(returnStatus.daysAway / 7)} weeks`;
    return 'a while';
  };

  const getIntensityLabel = () => {
    if (returnStatus.intensityModifier <= 0.5) return 'Very light';
    if (returnStatus.intensityModifier <= 0.65) return 'Light';
    return 'Moderate';
  };

  return (
    <SpatialGlassCard layer="elevated" style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Heart size={20} color={colors.textInverted} />
          </LinearGradient>
        </Animated.View>
        <TouchableOpacity onPress={handleContinue} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>{returnStatus.welcomeMessage}</Text>
      
      <Text style={styles.timeText}>
        It&apos;s been {getTimeAwayText()}. That&apos;s okay.
      </Text>

      <View style={styles.intensityContainer}>
        <View style={styles.intensityBadge}>
          <Text style={styles.intensityLabel}>{getIntensityLabel()} intensity recommended</Text>
        </View>
      </View>

      {northStar && (
        <View style={styles.northStarContainer}>
          <Star size={14} color={colors.accent} fill={colors.accent} />
          <Text style={styles.northStarText}>Remember: &ldquo;{northStar}&rdquo;</Text>
        </View>
      )}

      <View style={styles.suggestionsContainer}>
        {returnStatus.suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionDot} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>

      {!showReflection ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Let&apos;s go</Text>
            <ChevronRight size={18} color={colors.textInverted} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reflectionToggle} onPress={toggleReflection}>
            <Text style={styles.reflectionToggleText}>Want to reflect? (optional)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.reflectionContainer}>
          <Text style={styles.reflectionPrompt}>
            What happened? (Private, no judgment)
          </Text>
          <TextInput
            style={styles.reflectionInput}
            placeholder="Life got busy, feeling off, needed rest..."
            placeholderTextColor={colors.textTertiary}
            value={reflectionText}
            onChangeText={setReflectionText}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.reflectionActions}>
            <TouchableOpacity style={styles.skipButton} onPress={handleContinue}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleReflectionSubmit}>
              <Text style={styles.saveButtonText}>Save & continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SpatialGlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  timeText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  intensityContainer: {
    marginBottom: 16,
  },
  intensityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  intensityLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  northStarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent + '10',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    marginBottom: 16,
  },
  northStarText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    fontStyle: 'italic' as const,
  },
  suggestionsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textInverted,
  },
  reflectionToggle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  reflectionToggleText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  reflectionContainer: {
    gap: 12,
  },
  reflectionPrompt: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reflectionInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    lineHeight: 22,
  },
  reflectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textInverted,
  },
});
