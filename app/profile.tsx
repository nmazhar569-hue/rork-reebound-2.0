import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Alert, Platform, ActivityIndicator } from 'react-native';
import { User, LogOut, Shield, Smartphone, Mail, Trash2, Heart, Activity, RefreshCw, Link2, Unlink, Sparkles, Star, Clock, Dumbbell, ChevronRight, Moon, Zap, Calendar, AlertTriangle, Settings } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/contexts/AuthContext';
import { useHealth } from '@/contexts/HealthContext';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Card, SolidButton } from '@/components/ui';
import { SelectionChips } from '@/components/ui/FormElements';
import { storageService } from '@/services/StorageService';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { VoidBackground } from '@/components/VoidBackground';
import { SleepQuality, ActivityLevel, StressLevel, DietPreference, NutritionGoal, AppetiteLevel, UserProfile, GenderIdentity, ExplanationDepth, HeightUnit, WeightUnit, HealthPlatform, WorkoutSession } from '@/types';
import { haptics } from '@/utils/haptics';

const OPTIONS = {
  gender: [
    { label: 'Woman', value: 'woman' as GenderIdentity },
    { label: 'Man', value: 'man' as GenderIdentity },
    { label: 'Non-Binary', value: 'non_binary' as GenderIdentity },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' as GenderIdentity },
    { label: 'Other', value: 'other' as GenderIdentity },
  ],
  aiDepth: [
    { label: 'Simple', value: 'simple' as ExplanationDepth },
    { label: 'Applied Science', value: 'applied_science' as ExplanationDepth },
    { label: 'Deep Biomechanics', value: 'deep_biomechanics' as ExplanationDepth },
  ],
  heightUnit: [{ label: 'cm', value: 'cm' as HeightUnit }, { label: 'ft', value: 'ft' as HeightUnit }],
  weightUnit: [{ label: 'kg', value: 'kg' as WeightUnit }, { label: 'lb', value: 'lb' as WeightUnit }],
  sleep: [
    { label: 'Poor (< 6h)', value: 'poor' as SleepQuality },
    { label: 'Average (6-7h)', value: 'average' as SleepQuality },
    { label: 'Good (8h+)', value: 'good' as SleepQuality },
  ],
  activity: [
    { label: 'Sedentary', value: 'sedentary' as ActivityLevel },
    { label: 'Light', value: 'light' as ActivityLevel },
    { label: 'Moderate', value: 'moderate' as ActivityLevel },
    { label: 'Active', value: 'active' as ActivityLevel },
    { label: 'Very Active', value: 'very_active' as ActivityLevel },
  ],
  stress: [
    { label: 'Low', value: 'low' as StressLevel },
    { label: 'Moderate', value: 'moderate' as StressLevel },
    { label: 'High', value: 'high' as StressLevel },
  ],
  diet: [
    { label: 'None / Standard', value: 'none' as DietPreference },
    { label: 'Vegetarian', value: 'vegetarian' as DietPreference },
    { label: 'Vegan', value: 'vegan' as DietPreference },
    { label: 'Pescatarian', value: 'pescatarian' as DietPreference },
    { label: 'Halal', value: 'halal' as DietPreference },
    { label: 'Kosher', value: 'kosher' as DietPreference },
    { label: 'Gluten Free', value: 'gluten_free' as DietPreference },
    { label: 'Dairy Free', value: 'dairy_free' as DietPreference },
  ],
  goal: [
    { label: 'Performance', value: 'performance' as NutritionGoal },
    { label: 'Recovery', value: 'recovery' as NutritionGoal },
    { label: 'Body Comp', value: 'body_composition' as NutritionGoal },
    { label: 'General Health', value: 'general_health' as NutritionGoal },
  ],
  appetite: [
    { label: 'Low', value: 'low' as AppetiteLevel },
    { label: 'Average', value: 'average' as AppetiteLevel },
    { label: 'High', value: 'high' as AppetiteLevel },
  ],
};

const cmToFeet = (cm: number): string => {
  const totalInches = cm / 2.54;
  return `${Math.floor(totalInches / 12)}'${Math.round(totalInches % 12)}"`;
};

const feetToCm = (feetStr: string): number => {
  const match = feetStr.match(/(\d+)'\s*(\d+)?"?/);
  if (match) return Math.round(((parseInt(match[1], 10) || 0) * 12 + (parseInt(match[2], 10) || 0)) * 2.54);
  const numOnly = parseFloat(feetStr);
  return !isNaN(numOnly) ? Math.round(numOnly * 30.48) : 0;
};

const kgToLb = (kg: number): number => Math.round(kg * 2.205);
const lbToKg = (lb: number): number => Math.round(lb / 2.205);

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function ProfileScreen() {
  const { userProfile, updateUserProfile, getIdentityTitles, dailyLogs } = useApp();
  const identityTitles = getIdentityTitles();
  const router = useRouter();
  const { user, isAuthenticated, appleAuthAvailable, signInWithApple, signInWithGoogle, signOut, deleteAccount, isLoading: authLoading } = useAuth();
  const { settings: healthSettings, isConnected: healthConnected, connectPlatform, disconnect: disconnectHealth, syncHealthData, isPedometerAvailable } = useHealth();
  const [signingIn, setSigningIn] = useState(false);
  const [connectingHealth, setConnectingHealth] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const storedHeightUnit = userProfile?.unitPreferences?.height || 'cm';
  const storedWeightUnit = userProfile?.unitPreferences?.weight || 'kg';

  const getInitialHeight = (): string => {
    if (!userProfile?.height) return '';
    return storedHeightUnit === 'ft' ? cmToFeet(userProfile.height) : userProfile.height.toString();
  };

  const getInitialWeight = (): string => {
    if (!userProfile?.weight) return '';
    return storedWeightUnit === 'lb' ? kgToLb(userProfile.weight).toString() : userProfile.weight.toString();
  };

  const [height, setHeight] = useState(getInitialHeight());
  const [weight, setWeight] = useState(getInitialWeight());
  const [gender, setGender] = useState<GenderIdentity | undefined>(userProfile?.gender);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(userProfile?.sleepQuality || 'average');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(userProfile?.activityLevel || 'moderate');
  const [stressLevel, setStressLevel] = useState<StressLevel>(userProfile?.stressLevel || 'moderate');
  const [dietaryPreference, setDietaryPreference] = useState<DietPreference>(userProfile?.nutritionPreferences?.dietaryPreference || 'none');
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal>(userProfile?.nutritionPreferences?.goal || 'general_health');
  const [appetiteLevel, setAppetiteLevel] = useState<AppetiteLevel>(userProfile?.nutritionPreferences?.appetiteLevel || 'average');
  const [allergies, setAllergies] = useState(userProfile?.nutritionPreferences?.allergies?.join(', ') || '');
  const [yearsExperience, setYearsExperience] = useState(userProfile?.trainingBackground?.yearsExperience?.toString() || '');
  const [isCompetitive, setIsCompetitive] = useState(userProfile?.trainingBackground?.isCompetitive || false);
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>(userProfile?.aiPreferences?.explanationDepth || 'simple');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(storedHeightUnit);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(storedWeightUnit);
  const [northStar, setNorthStar] = useState(userProfile?.northStar || '');

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await storageService.getWorkoutHistory();
      setWorkoutHistory(history);
    } catch (error) {
      console.error('[ProfileScreen] Error loading workout history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleHeightUnitChange = useCallback((newUnit: HeightUnit) => {
    if (newUnit === heightUnit) return;
    if (height) {
      if (newUnit === 'ft') {
        const cm = parseFloat(height);
        if (!isNaN(cm)) setHeight(cmToFeet(cm));
      } else {
        const cm = feetToCm(height);
        if (cm > 0) setHeight(cm.toString());
      }
    }
    setHeightUnit(newUnit);
  }, [height, heightUnit]);

  const handleWeightUnitChange = useCallback((newUnit: WeightUnit) => {
    if (newUnit === weightUnit) return;
    if (weight) {
      const currentValue = parseFloat(weight);
      if (!isNaN(currentValue)) {
        setWeight(newUnit === 'lb' ? kgToLb(currentValue).toString() : lbToKg(currentValue).toString());
      }
    }
    setWeightUnit(newUnit);
  }, [weight, weightUnit]);

  const handleSave = useCallback(async () => {
    let heightInCm: number | undefined;
    let weightInKg: number | undefined;

    if (height) heightInCm = heightUnit === 'ft' ? feetToCm(height) : parseFloat(height);
    if (weight) {
      const w = parseFloat(weight);
      if (!isNaN(w)) weightInKg = weightUnit === 'lb' ? lbToKg(w) : w;
    }

    const updates: Partial<UserProfile> = {
      gender,
      height: heightInCm,
      weight: weightInKg,
      sleepQuality,
      activityLevel,
      stressLevel,
      nutritionPreferences: {
        dietaryPreference,
        goal: nutritionGoal,
        appetiteLevel,
        allergies: allergies ? allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        eatingFrequency: userProfile?.nutritionPreferences?.eatingFrequency,
      },
      trainingBackground: { ...userProfile?.trainingBackground, yearsExperience: yearsExperience ? parseFloat(yearsExperience) : undefined, isCompetitive },
      aiPreferences: { explanationDepth },
      unitPreferences: { height: heightUnit, weight: weightUnit },
      northStar: northStar || undefined,
    };

    await updateUserProfile(updates);
    haptics.success();
    Alert.alert('Profile Updated', 'Your settings have been saved.', [{ text: 'OK', onPress: () => router.back() }]);
  }, [gender, height, weight, heightUnit, weightUnit, sleepQuality, activityLevel, stressLevel, dietaryPreference, nutritionGoal, appetiteLevel, allergies, yearsExperience, isCompetitive, explanationDepth, northStar, userProfile, updateUserProfile, router]);

  const handleAppleSignIn = async () => {
    setSigningIn(true);
    try {
      const success = await signInWithApple();
      if (success) Alert.alert('Success', 'Your account has been linked successfully.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const success = await signInWithGoogle();
      if (success) Alert.alert('Success', 'Your account has been linked successfully.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleConnectHealth = async (platform: HealthPlatform) => {
    setConnectingHealth(true);
    try {
      const success = await connectPlatform(platform);
      if (success) {
        Alert.alert('Connected', `${platform === 'apple_health' ? 'Apple Health' : 'Google Fit'} connected successfully.`);
      }
    } finally {
      setConnectingHealth(false);
    }
  };

  const handleDisconnectHealth = () => {
    Alert.alert(
      'Disconnect Health Data',
      'This will stop syncing health data. Your existing data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectHealth },
      ]
    );
  };

  const handleSyncHealth = async () => {
    await syncHealthData();
    haptics.success();
    Alert.alert('Synced', 'Health data has been refreshed.');
  };

  const handleClearAllData = () => {
    haptics.warning();
    Alert.alert(
      'Clear All Data',
      'Permanently delete history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearHistory();
            setWorkoutHistory([]);
          }
        },
      ]
    );
  };

  const userName = userProfile?.questionnaireProfile?.preferredName || 'Athlete';
  const baselineSleep = userProfile?.baselineSleep ?? 7.5;
  const baselineHrv = userProfile?.baselineHrv ?? 50;
  const totalWorkouts = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0);
  const totalMinutes = workoutHistory.reduce((sum, w) => sum + w.durationMinutes, 0);

  return (
    <VoidBackground>
      <Stack.Screen options={{
        title: 'Profile',
        headerShown: true,
        headerTransparent: true,
        headerTintColor: liquidGlass.text.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              router.push('/settings');
            }}
            style={{ marginRight: 20 }}
          >
            <Settings size={24} color={liquidGlass.text.primary} />
          </TouchableOpacity>
        ),
      }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.heroSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.heroName}>{userName}</Text>
            <Text style={styles.heroSubtitle}>
              {userProfile?.goal ? userProfile.goal.replace('_', ' ').toLowerCase() : 'General fitness'}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Moon size={16} color={liquidGlass.accent.primary} />
                <Text style={styles.statValue}>{baselineSleep}h</Text>
                <Text style={styles.statLabel}>Sleep Base</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Heart size={16} color={liquidGlass.accent.primary} />
                <Text style={styles.statValue}>{baselineHrv}</Text>
                <Text style={styles.statLabel}>HRV Base</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Dumbbell size={16} color={liquidGlass.accent.primary} />
                <Text style={styles.statValue}>{totalWorkouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
            </View>
          </View>

          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={18} color={liquidGlass.accent.primary} />
              <Text style={styles.glassSectionTitle}>Workout History</Text>
            </View>

            {loadingHistory ? (
              <ActivityIndicator size="small" color={liquidGlass.accent.primary} style={{ margin: 20 }} />
            ) : workoutHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Dumbbell size={32} color={liquidGlass.text.tertiary} />
                <Text style={styles.emptyStateText}>No workouts logged yet</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {workoutHistory.slice(0, 3).map((workout, index) => (
                  <View
                    key={workout.id}
                    style={[
                      styles.historyItem,
                      index < Math.min(workoutHistory.length, 3) - 1 && styles.historyItemBorder
                    ]}
                  >
                    <View style={styles.historyItemLeft}>
                      <View style={styles.historyDateBadge}>
                        <Calendar size={12} color={liquidGlass.accent.primary} />
                        <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                      </View>
                      <Text style={styles.historyExercises}>{workout.exercises.length} exercises</Text>
                    </View>
                    <View style={styles.historyItemRight}>
                      <Text style={styles.historyMetaText}>{formatDuration(workout.durationMinutes)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card style={styles.section}>
            <View style={styles.northStarHeader}>
              <Star size={20} color={liquidGlass.accent.primary} />
              <Text style={styles.sectionTitle}>Your North Star</Text>
            </View>
            <Text style={styles.sectionDescription}>What drives your commitment to change?</Text>
            <TextInput
              style={styles.northStarInput}
              value={northStar}
              onChangeText={setNorthStar}
              placeholder="e.g., Move without fear, Play with my kids..."
              placeholderTextColor={liquidGlass.text.tertiary}
              multiline
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Identity & Goals</Text>
            <SelectionChips label="Gender Identity" options={OPTIONS.gender} selectedValue={gender} onSelect={setGender} />
            <SelectionChips label="Primary Goal" options={OPTIONS.goal} selectedValue={nutritionGoal} onSelect={setNutritionGoal} />

            <View style={styles.unitRow}>
              <View style={styles.unitInputContainer}>
                <View style={styles.unitLabelRow}>
                  <Text style={styles.inputLabel}>Height</Text>
                  <View style={styles.unitToggle}>
                    {OPTIONS.heightUnit.map((opt) => (
                      <TouchableOpacity key={opt.value} style={[styles.unitButton, heightUnit === opt.value && styles.unitButtonActive]} onPress={() => handleHeightUnitChange(opt.value)}>
                        <Text style={[styles.unitButtonText, heightUnit === opt.value && styles.unitButtonTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder={heightUnit === 'cm' ? '175' : "5'10\""} placeholderTextColor={liquidGlass.text.tertiary} />
              </View>
              <View style={{ width: 12 }} />
              <View style={styles.unitInputContainer}>
                <View style={styles.unitLabelRow}>
                  <Text style={styles.inputLabel}>Weight</Text>
                  <View style={styles.unitToggle}>
                    {OPTIONS.weightUnit.map((opt) => (
                      <TouchableOpacity key={opt.value} style={[styles.unitButton, weightUnit === opt.value && styles.unitButtonActive]} onPress={() => handleWeightUnitChange(opt.value)}>
                        <Text style={[styles.unitButtonText, weightUnit === opt.value && styles.unitButtonTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder={weightUnit === 'kg' ? '70' : '154'} placeholderTextColor={liquidGlass.text.tertiary} keyboardType="numeric" />
              </View>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle & Style</Text>
            <SelectionChips label="Sleep Quality" options={OPTIONS.sleep} selectedValue={sleepQuality} onSelect={setSleepQuality} />
            <SelectionChips label="Daily Activity" options={OPTIONS.activity} selectedValue={activityLevel} onSelect={setActivityLevel} />
            <SelectionChips label="Explanation Depth" options={OPTIONS.aiDepth} selectedValue={explanationDepth} onSelect={setExplanationDepth} />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Health Integration</Text>
            {healthConnected ? (
              <View style={styles.healthStatusRow}>
                <Heart size={20} color={liquidGlass.status.success} />
                <Text style={styles.healthConnectedText}>Synced with {healthSettings.platform === 'apple_health' ? 'Apple Health' : 'Google Fit'}</Text>
                <TouchableOpacity onPress={handleSyncHealth}><RefreshCw size={18} color={liquidGlass.accent.primary} /></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.healthConnectBtn} onPress={() => handleConnectHealth(Platform.OS === 'ios' ? 'apple_health' : 'google_fit')}>
                <Link2 size={18} color={liquidGlass.accent.primary} />
                <Text style={styles.healthConnectBtnText}>Connect Health Data</Text>
              </TouchableOpacity>
            )}
          </Card>

          <View style={styles.devSection}>
            <View style={styles.devHeader}>
              <AlertTriangle size={18} color={liquidGlass.status.danger} />
              <Text style={styles.devTitle}>Developer Access</Text>
            </View>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAllData}>
              <Trash2 size={18} color={liquidGlass.status.danger} />
              <Text style={styles.dangerBtnText}>Wipe Workout History</Text>
            </TouchableOpacity>

            <View style={{ height: 12 }} />

            {/* Retake Assessment Button */}
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={() => {
                haptics.warning();
                Alert.alert(
                  'Retake Assessment?',
                  'This will reset your profile goals and training preferences. We recommend doing this ONLY if your primary goal has changed significantly.\n\nAre you sure?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Yes, Retake It',
                      style: 'destructive',
                      onPress: () => {
                        router.push('/onboarding');
                      }
                    }
                  ]
                );
              }}
            >
              <RefreshCw size={18} color={liquidGlass.status.warning} />
              <Text style={[styles.dangerBtnText, { color: liquidGlass.status.warning }]}>Retake Assessment</Text>
            </TouchableOpacity>
          </View>

          <SolidButton label="Save All Changes" onPress={handleSave} style={styles.saveButton} />
        </ScrollView>
      </SafeAreaView>
    </VoidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 100, paddingBottom: 40 },

  heroSection: { alignItems: 'center', marginBottom: 32 },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    ...glassShadows.glow,
  },
  avatarLargeText: { fontSize: 32, fontWeight: '800', color: liquidGlass.text.inverse },
  heroName: { fontSize: 24, fontWeight: '700', color: liquidGlass.text.primary, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, color: liquidGlass.text.secondary, textTransform: 'capitalize', marginBottom: 24 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 20, borderWidth: 1, borderColor: liquidGlass.border.glass,
    paddingVertical: 16, paddingHorizontal: 20,
    ...glassShadows.soft,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700', color: liquidGlass.text.primary, marginTop: 4 },
  statLabel: { fontSize: 11, color: liquidGlass.text.tertiary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: liquidGlass.border.glassLight },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: liquidGlass.text.primary, marginBottom: 16 },
  glassSectionTitle: { fontSize: 16, fontWeight: '600', color: liquidGlass.text.primary },
  sectionDescription: { fontSize: 14, color: liquidGlass.text.secondary, marginBottom: 12 },

  historyList: { gap: 12 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyItemLeft: { flex: 1, gap: 4 },
  historyItemRight: { alignItems: 'flex-end' },
  historyItemBorder: { borderBottomWidth: 1, borderBottomColor: liquidGlass.border.glassLight, paddingBottom: 12 },
  historyDateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyDate: { fontSize: 14, fontWeight: '600', color: liquidGlass.text.primary },
  historyExercises: { fontSize: 12, color: liquidGlass.text.tertiary, marginTop: 2 },
  historyMetaText: { fontSize: 13, color: liquidGlass.text.secondary },

  northStarHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  northStarInput: {
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 16, borderWidth: 1, borderColor: liquidGlass.border.glass,
    padding: 16, minHeight: 100, color: liquidGlass.text.primary, textAlignVertical: 'top',
  },

  unitRow: { flexDirection: 'row', marginTop: 8 },
  unitInputContainer: { flex: 1 },
  unitLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: liquidGlass.text.secondary },
  unitToggle: { flexDirection: 'row', backgroundColor: liquidGlass.surface.glassDark, borderRadius: 8, padding: 2 },
  unitButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  unitButtonActive: { backgroundColor: liquidGlass.accent.primary },
  unitButtonText: { fontSize: 11, fontWeight: '700', color: liquidGlass.text.tertiary },
  unitButtonTextActive: { color: liquidGlass.text.inverse },
  input: {
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 12, borderWidth: 1, borderColor: liquidGlass.border.glass,
    padding: 14, color: liquidGlass.text.primary, fontSize: 15,
  },

  healthStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  healthConnectedText: { flex: 1, color: liquidGlass.text.secondary, fontSize: 14 },
  healthConnectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: liquidGlass.accent.muted, padding: 16, borderRadius: 16,
  },
  healthConnectBtnText: { color: liquidGlass.accent.primary, fontWeight: '700', fontSize: 15 },

  devSection: { padding: 16, borderRadius: 20, backgroundColor: liquidGlass.surface.card, marginBottom: 20, borderWidth: 1, borderColor: liquidGlass.border.glass },
  devHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  devTitle: { fontSize: 15, fontWeight: '700', color: liquidGlass.status.danger },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: liquidGlass.status.dangerMuted, padding: 14, borderRadius: 12,
  },
  dangerBtnText: { color: liquidGlass.status.danger, fontWeight: '600' },

  saveButton: { marginVertical: 20, height: 60, borderRadius: 30 },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyStateText: { color: liquidGlass.text.tertiary, marginTop: 10 },
});
