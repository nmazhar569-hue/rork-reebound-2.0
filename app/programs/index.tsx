import { router } from 'expo-router';
import { Plus, Pencil, Dumbbell, PersonStanding, Activity } from 'lucide-react-native';
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import colors, { borderRadius, shadows, layout } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

interface ProgramTemplate {
  id: string;
  name: string;
  icon: typeof Dumbbell;
  color: string;
  description: string;
}

const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  { 
    id: 'push', 
    name: 'Push Day', 
    icon: Dumbbell, 
    color: colors.primary,
    description: 'Use template',
  },
  { 
    id: 'leg', 
    name: 'Leg Day', 
    icon: PersonStanding, 
    color: colors.primary,
    description: 'Use template',
  },
  { 
    id: 'recovery', 
    name: 'Full Body Recovery', 
    icon: Activity, 
    color: colors.primary,
    description: 'Use template',
  },
];

export default function ProgramsScreen() {
  const { programs, activeProgramId, setActiveProgram, deleteProgram } = useApp();

  const sorted = useMemo(() => [...programs].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)), [programs]);

  const handleDelete = useCallback((programId: string) => {
    Alert.alert('Delete program?', 'This will remove the program and any edits tied to it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProgram(programId) },
    ]);
  }, [deleteProgram]);

  const handleEditProgram = useCallback((programId: string) => {
    haptics.light();
    router.push(`/programs/builder?programId=${encodeURIComponent(programId)}`);
  }, []);

  const handleCreateNew = useCallback(() => {
    haptics.medium();
    router.push('/programs/builder');
  }, []);

  const handleUseTemplate = useCallback((templateId: string) => {
    haptics.light();
    router.push(`/programs/builder?template=${templateId}`);
  }, []);

  const getLastUsedText = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'created today';
    if (diffDays === 1) return 'last used 1 day ago';
    return `last used ${diffDays} days ago`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Programs</Text>
        <TouchableOpacity 
          style={styles.newProgramBtn} 
          onPress={handleCreateNew}
          testID="programsCreate"
        >
          <Plus size={18} color={colors.surface} />
          <Text style={styles.newProgramBtnText}>New Program</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.programsList}>
        {sorted.map((p) => {
          const isActive = p.id === activeProgramId;
          const exerciseCount = p.sessions.reduce((acc, s) => acc + s.exercises.length, 0);
          const totalMinutes = exerciseCount * 8;

          return (
            <TouchableOpacity 
              key={p.id} 
              style={[styles.programCard, isActive && styles.programCardActive]}
              onPress={() => setActiveProgram(isActive ? null : p.id)}
              onLongPress={() => handleDelete(p.id)}
              testID={`programCard-${p.id}`}
            >
              <View style={styles.programCardContent}>
                <Text style={styles.programName}>{p.name}</Text>
                <Text style={styles.programMeta}>
                  {exerciseCount} exercises · {totalMinutes} min
                </Text>
                <Text style={styles.programLastUsed}>{getLastUsedText(p.createdAt)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn}
                onPress={() => handleEditProgram(p.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Pencil size={18} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity 
          style={styles.createFirstCard}
          onPress={handleCreateNew}
          testID="programsEmptyCta"
        >
          <Plus size={20} color={colors.primary} />
          <Text style={styles.createFirstText}>Create your first program</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.templatesSection}>
        <Text style={styles.sectionTitle}>Templates</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templatesScroll}
        >
          {PROGRAM_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <TouchableOpacity 
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleUseTemplate(template.id)}
              >
                <View style={[styles.templateIcon, { backgroundColor: template.color + '15' }]}>
                  <Icon size={20} color={template.color} />
                </View>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateAction}>{template.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.reeMessage}>
        <View style={styles.reeAvatar}>
          <Text style={styles.reeAvatarText}>😊</Text>
        </View>
        <View style={styles.reeBubble}>
          <Text style={styles.reeBubbleText}>Build what works for you.</Text>
        </View>
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  content: { 
    padding: layout.screenPadding,
    paddingTop: layout.screenPaddingTop,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  newProgramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  newProgramBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  programsList: {
    gap: 12,
    marginBottom: 32,
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  programCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  programCardContent: {
    flex: 1,
  },
  programName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  programMeta: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  programLastUsed: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createFirstCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  createFirstText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  templatesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  templatesScroll: {
    gap: 12,
    paddingRight: 20,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 16,
    width: 140,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  templateAction: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  reeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reeAvatarText: {
    fontSize: 22,
  },
  reeBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reeBubbleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerSpacer: { 
    height: layout.tabBarHeight,
  },
});
