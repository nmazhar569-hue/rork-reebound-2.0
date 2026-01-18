import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Lightbulb, ChevronDown, Sparkles } from 'lucide-react-native';
import colors, { borderRadius } from '@/constants/colors';
import { MicroExplanation as MicroExplanationType } from '@/constants/microExplanations';
import { useApp } from '@/contexts/AppContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MicroExplanationProps {
  explanation: MicroExplanationType;
  style?: object;
  testID?: string;
  onExpand?: (id: string) => void;
}

export function MicroExplanation({ explanation, style, testID, onExpand }: MicroExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { markExplanationSeen, seenExplanations } = useApp();
  
  const isNew = !seenExplanations.includes(explanation.id);

  useEffect(() => {
    if (isNew) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isNew, fadeAnim]);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (!isExpanded) {
      markExplanationSeen(explanation.id);
      onExpand?.(explanation.id);
    }

    setIsExpanded(!isExpanded);
  }, [isExpanded, rotateAnim, explanation.id, markExplanationSeen, onExpand]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={[styles.container, isNew && styles.containerNew, style]}
      onPress={toggleExpand}
      activeOpacity={0.8}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, isNew && styles.iconContainerNew]}>
          {isNew ? (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Sparkles size={14} color={colors.primary} />
            </Animated.View>
          ) : (
            <Lightbulb size={14} color={colors.primary} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.shortText}>{explanation.short}</Text>
          {isNew && <Text style={styles.newBadge}>New insight</Text>}
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={16} color={colors.textTertiary} />
        </Animated.View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.expandedText}>{explanation.expanded}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface MicroExplanationListProps {
  explanations: MicroExplanationType[];
  style?: object;
  maxVisible?: number;
}

export function MicroExplanationList({ explanations, style, maxVisible = 2 }: MicroExplanationListProps) {
  const { seenExplanations } = useApp();
  
  if (explanations.length === 0) return null;

  const sortedExplanations = [...explanations].sort((a, b) => {
    const aIsNew = !seenExplanations.includes(a.id);
    const bIsNew = !seenExplanations.includes(b.id);
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    return 0;
  });

  const visibleExplanations = sortedExplanations.slice(0, maxVisible);

  return (
    <View style={[styles.listContainer, style]}>
      {visibleExplanations.map((exp, index) => (
        <MicroExplanation
          key={exp.id}
          explanation={exp}
          style={index > 0 ? styles.listItem : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.lg,
    padding: 14,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary + '40',
  },
  containerNew: {
    backgroundColor: colors.primary + '12',
    borderLeftColor: colors.primary + '70',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerNew: {
    backgroundColor: colors.primary + '25',
  },
  textContainer: {
    flex: 1,
  },
  shortText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  newBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600' as const,
    marginTop: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary + '15',
  },
  expandedText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    marginTop: 0,
  },
});
