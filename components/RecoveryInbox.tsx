import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check, Clock, ShieldAlert, Utensils, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { suggestionService, Suggestion } from '@/services/SuggestionService';
import { analysisService } from '@/services/AnalysisService';
import { haptics } from '@/utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecoveryInboxProps {
  visible: boolean;
  onClose: () => void;
}

export function RecoveryInbox({ visible, onClose }: RecoveryInboxProps) {
  const insets = useSafeAreaInsets();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      const analysis = analysisService.analyzeDailyState({
        date: new Date(),
        sleepHours: 5.5,
        sleepQuality: 'fair',
        hrv: 40,
        restingHeartRate: 65,
        sorenessRating: 6,
        stressRating: 7,
      });

      const newSuggestions = suggestionService.getSuggestions(analysis.flags);
      setSuggestions(newSuggestions);
      console.log('[RecoveryInbox] Generated suggestions:', newSuggestions.length);

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleAction = useCallback(async (id: string, action: 'ACCEPT' | 'DISMISS') => {
    haptics.light();
    
    if (action === 'ACCEPT') {
      await suggestionService.applySuggestion(id);
    } else {
      await suggestionService.dismissSuggestion(id);
    }

    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleClose = useCallback(() => {
    haptics.light();
    onClose();
  }, [onClose]);

  const getTypeIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'SCHEDULE':
        return Clock;
      case 'NUTRITION':
        return Utensils;
      case 'RECOVERY':
      default:
        return ShieldAlert;
    }
  };

  const getImpactColor = (impact: Suggestion['impact']) => {
    switch (impact) {
      case 'HIGH':
        return liquidGlass.status.danger;
      case 'MEDIUM':
        return liquidGlass.status.warning;
      default:
        return liquidGlass.accent.primary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />

        <Animated.View 
          style={[
            styles.container,
            { 
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <Sparkles size={20} color={liquidGlass.accent.primary} />
                <Text style={styles.title}>Optimization Inbox</Text>
              </View>
              <Text style={styles.subtitle}>
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} for you
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              testID="inbox-close-button"
            >
              <X color={liquidGlass.text.primary} size={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.dragIndicator} />

          <ScrollView 
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {suggestions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Check size={32} color={liquidGlass.accent.primary} />
                </View>
                <Text style={styles.emptyTitle}>All Optimized</Text>
                <Text style={styles.emptyText}>
                  No suggestions right now. You are primed for performance.
                </Text>
              </View>
            ) : (
              suggestions.map((item, index) => {
                const TypeIcon = getTypeIcon(item.type);
                const impactColor = getImpactColor(item.impact);

                return (
                  <Animated.View
                    key={item.id}
                    style={[
                      styles.cardWrapper,
                      { opacity: 1 },
                    ]}
                  >
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.typeBadge}>
                          <TypeIcon size={12} color={liquidGlass.text.secondary} />
                          <Text style={styles.typeText}>{item.type}</Text>
                        </View>
                        {item.impact === 'HIGH' && (
                          <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
                            <Text style={[styles.impactText, { color: impactColor }]}>
                              HIGH IMPACT
                            </Text>
                          </View>
                        )}
                        {item.impact === 'MEDIUM' && (
                          <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
                            <Text style={[styles.impactText, { color: impactColor }]}>
                              MEDIUM
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardBody}>{item.message}</Text>

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.dismissBtn}
                          onPress={() => handleAction(item.id, 'DISMISS')}
                          testID={`dismiss-${item.id}`}
                        >
                          <Text style={styles.dismissText}>Dismiss</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => handleAction(item.id, 'ACCEPT')}
                          testID={`accept-${item.id}`}
                        >
                          <Check color={liquidGlass.text.inverse} size={16} />
                          <Text style={styles.acceptText}>{item.actionLabel}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: liquidGlass.background.secondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.medium,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: liquidGlass.border.glassLight,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    color: liquidGlass.text.primary,
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: liquidGlass.text.tertiary,
    fontSize: 14,
    marginLeft: 30,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    padding: 18,
    ...glassShadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: liquidGlass.surface.glassDark,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  typeText: {
    color: liquidGlass.text.tertiary,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  impactBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  impactText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: liquidGlass.text.primary,
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  cardBody: {
    color: liquidGlass.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    backgroundColor: liquidGlass.surface.glassDark,
    alignItems: 'center',
  },
  dismissText: {
    color: liquidGlass.text.tertiary,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: liquidGlass.accent.primary,
    borderRadius: 12,
    paddingVertical: 12,
    ...glassShadows.glow,
  },
  acceptText: {
    color: liquidGlass.text.inverse,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: liquidGlass.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  emptyTitle: {
    color: liquidGlass.text.primary,
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  emptyText: {
    color: liquidGlass.text.tertiary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
