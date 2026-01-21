import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Alert, Platform, ActivityIndicator } from 'react-native';
import { User, LogOut, Shield, Smartphone, Mail, Trash2, Heart, Activity, RefreshCw, Link2, Unlink, Sparkles, Star, Clock, Dumbbell, ChevronRight, Moon, Zap, Calendar, AlertTriangle } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/contexts/AuthContext';
import { useHealth } from '@/contexts/HealthContext';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Card, SolidButton } from '@/components/ui';
import { SelectionChips } from '@/components/ui/FormElements';
import { storageService } from '@/services/StorageService';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import colors, { borderRadius, layout } from '@/constants/colors';
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
      console.log('[ProfileScreen] Loaded workout history:', history.length, 'sessions');
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
        Alert.alert('Connected', `${platform === 'apple_health' ? 'Apple Health' : 'Google Fit'} connected successfully. Your health data will now sync automatically.`);
      } else {
        Alert.alert('Permission Required', 'Please grant health data access in your device settings to use this feature.');
      }
    } finally {
      setConnectingHealth(false);
    }
  };

  const handleDisconnectHealth = () => {
    Alert.alert(
      'Disconnect Health Data',
      'This will stop syncing health data. Your existing Limbrise data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectHealth },
      ]
    );
  };

  const handleSyncHealth = async () => {
    await syncHealthData();
    Alert.alert('Synced', 'Health data has been refreshed.');
  };

  const handleClearAllData = () => {
    haptics.warning();
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all workout history and reset the app. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Everything', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await storageService.clearHistory();
              setWorkoutHistory([]);
              Alert.alert('Data Cleared', 'All workout history has been deleted.');
              console.log('[ProfileScreen] All data cleared');
            } catch (error) {
              console.error('[ProfileScreen] Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
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
    <>
      <Stack.Screen options={{ 
        title: 'Profile', 
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: liquidGlass.background.primary },
        headerTintColor: liquidGlass.text.primary,
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

          <View style={styles.glassSection}>
            <View style={styles.sectionHeader}>
              <Clock size={18} color={liquidGlass.accent.primary} />
              <Text style={styles.glassSectionTitle}>Workout History</Text>
            </View>
            
            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={liquidGlass.accent.primary} />
              </View>
            ) : workoutHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Dumbbell size={32} color={liquidGlass.text.tertiary} />
                <Text style={styles.emptyStateText}>No workouts logged yet</Text>
                <Text style={styles.emptyStateSubtext}>Complete your first session to see it here</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {workoutHistory.slice(0, 5).map((workout, index) => (
                  <View 
                    key={workout.id} 
                    style={[
                      styles.historyItem,
                      index < Math.min(workoutHistory.length, 5) - 1 && styles.historyItemBorder
                    ]}
                  >
                    <View style={styles.historyItemLeft}>
                      <View style={styles.historyDateBadge}>
                        <Calendar size={12} color={liquidGlass.accent.primary} />
                        <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                      </View>
                      <Text style={styles.historyExercises}>
                        {workout.exercises.length} exercises
                      </Text>
                    </View>
                    <View style={styles.historyItemRight}>
                      <View style={styles.historyMeta}>
                        <Clock size={12} color={liquidGlass.text.tertiary} />
                        <Text style={styles.historyMetaText}>{formatDuration(workout.durationMinutes)}</Text>
                      </View>
                      <View style={styles.historyMeta}>
                        <Zap size={12} color={liquidGlass.text.tertiary} />
                        <Text style={styles.historyMetaText}>{workout.totalVolume.toLocaleString()} lbs</Text>
                      </View>
                    </View>
                  </View>
                ))}
                
                {workoutHistory.length > 5 && (
                  <TouchableOpacity style={styles.viewAllBtn}>
                    <Text style={styles.viewAllText}>View all {workoutHistory.length} workouts</Text>
                    <ChevronRight size={16} color={liquidGlass.accent.primary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {totalWorkouts > 0 && (
              <View style={styles.historySummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatDuration(totalMinutes)}</Text>
                  <Text style={styles.summaryLabel}>Total Time</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalVolume.toLocaleString()}</Text>
                  <Text style={styles.summaryLabel}>Total Volume (lbs)</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your training and recovery preferences</Text>
          </View>

          <Card style={styles.section}>
            <View style={styles.northStarHeader}>
              <Star size={20} color={colors.accent} fill={colors.accent} />
              <Text style={styles.sectionTitle}>Your North Star</Text>
            </View>
            <Text style={styles.northStarDescription}>
              What do you want your body to let you do again?
            </Text>
            <TextInput
              style={styles.northStarInput}
              value={northStar}
              onChangeText={setNorthStar}
              placeholder="e.g., Move without fear, Play with my kids..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={100}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {authLoading ? (
              <View style={styles.loadingContainer}><ActivityIndicator size="small" color={colors.primary} /></View>
            ) : isAuthenticated && user ? (
              <View style={styles.accountInfo}>
                <View style={styles.accountHeader}>
                  <View style={styles.avatarContainer}><User size={24} color={colors.primary} /></View>
                  <View style={styles.accountDetails}>
                    {user.displayName && <Text style={styles.accountName}>{user.displayName}</Text>}
                    {user.email && (
                      <View style={styles.emailRow}>
                        <Mail size={14} color={colors.textSecondary} />
                        <Text style={styles.accountEmail}>{user.email}</Text>
                      </View>
                    )}
                    <View style={styles.providerBadge}>
                      <Shield size={12} color={colors.success} />
                      <Text style={styles.providerText}>Signed in with {user.provider === 'apple' ? 'Apple' : 'Google'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.accountActions}>
                  <TouchableOpacity style={styles.accountActionButton} onPress={() => Alert.alert('Sign Out', 'You will continue as a guest.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: signOut }])}>
                    <LogOut size={18} color={colors.textSecondary} />
                    <Text style={styles.accountActionText}>Sign Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.accountActionButton, styles.dangerAction]} onPress={() => Alert.alert('Delete Account', 'This will remove your account.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete Account', style: 'destructive', onPress: deleteAccount }])}>
                    <Trash2 size={18} color={colors.danger} />
                    <Text style={[styles.accountActionText, styles.dangerText]}>Delete Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.guestContainer}>
                <View style={styles.guestInfo}>
                  <View style={styles.guestIconContainer}><Smartphone size={20} color={colors.textSecondary} /></View>
                  <View style={styles.guestTextContainer}>
                    <Text style={styles.guestTitle}>Using as Guest</Text>
                    <Text style={styles.guestSubtitle}>Sign in to sync your data across devices</Text>
                  </View>
                </View>
                <View style={styles.signInOptions}>
                  {Platform.OS === 'ios' && appleAuthAvailable && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                      cornerRadius={16}
                      style={styles.appleButton}
                      onPress={handleAppleSignIn}
                    />
                  )}
                  <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={signingIn}>
                    {signingIn ? <ActivityIndicator size="small" color={colors.text} /> : (
                      <>
                        <Text style={styles.googleIcon}>G</Text>
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.privacyNote}>Your existing data will be preserved when you sign in</Text>
              </View>
            )}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Health Data</Text>
            <Text style={styles.sectionDescription}>Connect to sync steps, activity, and more. Read-only access only.</Text>
            
            {healthConnected ? (
              <View style={styles.healthConnected}>
                <View style={styles.healthStatusRow}>
                  <View style={styles.healthStatusIcon}>
                    <Heart size={20} color={colors.success} />
                  </View>
                  <View style={styles.healthStatusText}>
                    <Text style={styles.healthConnectedTitle}>
                      {healthSettings.platform === 'apple_health' ? 'Apple Health' : 'Google Fit'}
                    </Text>
                    <Text style={styles.healthConnectedSubtitle}>Connected and syncing</Text>
                  </View>
                </View>
                
                <View style={styles.healthPermissions}>
                  {healthSettings.permissions.steps && (
                    <View style={styles.permissionBadge}>
                      <Activity size={12} color={colors.primary} />
                      <Text style={styles.permissionText}>Steps</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.healthActions}>
                  <TouchableOpacity style={styles.healthActionButton} onPress={handleSyncHealth}>
                    <RefreshCw size={16} color={colors.primary} />
                    <Text style={styles.healthActionText}>Sync Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.healthActionButton, styles.healthDisconnectButton]} onPress={handleDisconnectHealth}>
                    <Unlink size={16} color={colors.danger} />
                    <Text style={[styles.healthActionText, styles.healthDisconnectText]}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.healthOptions}>
                {Platform.OS === 'ios' && isPedometerAvailable && (
                  <TouchableOpacity 
                    style={styles.healthConnectButton} 
                    onPress={() => handleConnectHealth('apple_health')}
                    disabled={connectingHealth}
                  >
                    {connectingHealth ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <>
                        <View style={styles.healthConnectIcon}>
                          <Heart size={20} color="#FF2D55" />
                        </View>
                        <View style={styles.healthConnectTextContainer}>
                          <Text style={styles.healthConnectTitle}>Connect Apple Health</Text>
                          <Text style={styles.healthConnectSubtitle}>Sync steps, workouts & more</Text>
                        </View>
                        <Link2 size={18} color={colors.textTertiary} />
                      </>
                    )}
                  </TouchableOpacity>
                )}
                
                {Platform.OS === 'android' && isPedometerAvailable && (
                  <TouchableOpacity 
                    style={styles.healthConnectButton} 
                    onPress={() => handleConnectHealth('google_fit')}
                    disabled={connectingHealth}
                  >
                    {connectingHealth ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <>
                        <View style={styles.healthConnectIcon}>
                          <Activity size={20} color="#4285F4" />
                        </View>
                        <View style={styles.healthConnectTextContainer}>
                          <Text style={styles.healthConnectTitle}>Connect Google Fit</Text>
                          <Text style={styles.healthConnectSubtitle}>Sync steps, workouts & more</Text>
                        </View>
                        <Link2 size={18} color={colors.textTertiary} />
                      </>
                    )}
                  </TouchableOpacity>
                )}
                
                {!isPedometerAvailable && (
                  <View style={styles.healthUnavailable}>
                    <Activity size={20} color={colors.textTertiary} />
                    <Text style={styles.healthUnavailableText}>
                      Health data integration is available on mobile devices
                    </Text>
                  </View>
                )}
                
                <Text style={styles.healthPrivacyNote}>
                  Your data stays on your device. We only read health metrics to personalize your training.
                </Text>
              </View>
            )}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Body & Lifestyle</Text>
            <SelectionChips label="Gender Identity" options={OPTIONS.gender} selectedValue={gender} onSelect={setGender} />

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
                <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder={heightUnit === 'cm' ? '175' : "5'10\""} placeholderTextColor={colors.textTertiary} keyboardType={heightUnit === 'cm' ? 'numeric' : 'default'} />
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
                <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder={weightUnit === 'kg' ? '70' : '154'} placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
              </View>
            </View>

            <SelectionChips label="Sleep Quality" options={OPTIONS.sleep} selectedValue={sleepQuality} onSelect={setSleepQuality} />
            <SelectionChips label="Daily Activity Level" options={OPTIONS.activity} selectedValue={activityLevel} onSelect={setActivityLevel} />
            <SelectionChips label="Stress Level" options={OPTIONS.stress} selectedValue={stressLevel} onSelect={setStressLevel} />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Preferences</Text>
            <SelectionChips label="Primary Goal" options={OPTIONS.goal} selectedValue={nutritionGoal} onSelect={setNutritionGoal} />
            <SelectionChips label="Diet Type" options={OPTIONS.diet} selectedValue={dietaryPreference} onSelect={setDietaryPreference} />
            <SelectionChips label="Appetite Level" options={OPTIONS.appetite} selectedValue={appetiteLevel} onSelect={setAppetiteLevel} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Food Allergies / Intolerances (comma separated)</Text>
              <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="Peanuts, Shellfish, Dairy..." placeholderTextColor={colors.textTertiary} />
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Training Background</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Years of Experience</Text>
              <TextInput style={styles.input} value={yearsExperience} onChangeText={setYearsExperience} placeholder="e.g. 5" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Are you a competitive athlete?</Text>
              <Switch value={isCompetitive} onValueChange={setIsCompetitive} trackColor={{ false: colors.borderLight, true: colors.primary }} thumbColor={colors.surface} />
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>AI Personalization</Text>
            <SelectionChips label="Explanation Depth" options={OPTIONS.aiDepth} selectedValue={explanationDepth} onSelect={setExplanationDepth} />
          </Card>

          {identityTitles.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.identityHeader}>
              <Sparkles size={18} color={colors.textTertiary} />
              <Text style={styles.identitySectionTitle}>Your Identity</Text>
            </View>
            <View style={styles.identityTitles}>
              {identityTitles.map((title) => (
                <View key={title.key} style={styles.identityTitleItem}>
                  <Text style={styles.identityTitleLabel}>{title.label}</Text>
                  <Text style={styles.identityTitleDescription}>{title.description}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

          <View style={styles.glassSection}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={18} color={liquidGlass.status.danger} />
              <Text style={[styles.glassSectionTitle, { color: liquidGlass.status.danger }]}>Developer Tools</Text>
            </View>
            <Text style={styles.devToolsDescription}>
              Use these options for testing and debugging. Data deletion is permanent.
            </Text>
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
              <Trash2 size={18} color={liquidGlass.status.danger} />
              <Text style={styles.dangerButtonText}>Clear All Workout Data</Text>
            </TouchableOpacity>
          </View>

          <SolidButton label="Save Changes" onPress={handleSave} style={styles.saveButton} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: liquidGlass.background.primary },
  scrollContent: { padding: layout.screenPadding, paddingBottom: 40 },
  
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...glassShadows.glow,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: liquidGlass.text.inverse,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    textTransform: 'capitalize',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: liquidGlass.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: liquidGlass.border.glassLight,
  },

  glassSection: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    padding: 20,
    marginBottom: 24,
    ...glassShadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  glassSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
  },

  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: liquidGlass.border.subtle,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
  },
  historyExercises: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyMetaText: {
    fontSize: 12,
    color: liquidGlass.text.secondary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: liquidGlass.border.subtle,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: liquidGlass.accent.primary,
  },
  historySummary: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: liquidGlass.border.glass,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: liquidGlass.border.glassLight,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: liquidGlass.accent.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: liquidGlass.text.tertiary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.text.secondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    marginTop: 4,
  },

  devToolsDescription: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    marginBottom: 16,
    lineHeight: 18,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: liquidGlass.status.dangerMuted,
    borderWidth: 1,
    borderColor: liquidGlass.status.danger + '40',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: liquidGlass.status.danger,
  },

  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700' as const, color: colors.text, marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600' as const, color: colors.text, marginBottom: 20 },
  unitRow: { flexDirection: 'row', marginBottom: 16 },
  unitInputContainer: { flex: 1 },
  unitLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  unitToggle: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 8, padding: 2 },
  unitButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  unitButtonActive: { backgroundColor: colors.primary },
  unitButtonText: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
  unitButtonTextActive: { color: colors.surface },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500' as const, color: colors.textSecondary, marginBottom: 8 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight, borderRadius: borderRadius.lg, padding: 16, fontSize: 16, color: colors.text },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontSize: 16, color: colors.text },
  saveButton: { marginBottom: 20 },
  loadingContainer: { padding: 24, alignItems: 'center' },
  accountInfo: { gap: 20 },
  accountHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  accountDetails: { flex: 1, gap: 4 },
  accountName: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accountEmail: { fontSize: 14, color: colors.textSecondary },
  providerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, backgroundColor: colors.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  providerText: { fontSize: 12, fontWeight: '500' as const, color: colors.success },
  accountActions: { flexDirection: 'row', gap: 12 },
  accountActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight },
  dangerAction: { borderColor: colors.danger + '30', backgroundColor: colors.danger + '08' },
  accountActionText: { fontSize: 14, fontWeight: '500' as const, color: colors.textSecondary },
  dangerText: { color: colors.danger },
  guestContainer: { gap: 20 },
  guestInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  guestIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  guestTextContainer: { flex: 1 },
  guestTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 4 },
  guestSubtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  signInOptions: { gap: 12 },
  appleButton: { height: 52, width: '100%' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight },
  googleIcon: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  googleButtonText: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  privacyNote: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', lineHeight: 18 },
  sectionDescription: { fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  healthConnected: { gap: 16 },
  healthStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthStatusIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.success + '15', alignItems: 'center', justifyContent: 'center' },
  healthStatusText: { flex: 1 },
  healthConnectedTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  healthConnectedSubtitle: { fontSize: 13, color: colors.success, marginTop: 2 },
  healthPermissions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  permissionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.primary + '10', borderRadius: 20 },
  permissionText: { fontSize: 13, fontWeight: '500' as const, color: colors.primary },
  healthActions: { flexDirection: 'row', gap: 12 },
  healthActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary + '10' },
  healthActionText: { fontSize: 14, fontWeight: '600' as const, color: colors.primary },
  healthDisconnectButton: { backgroundColor: colors.danger + '10' },
  healthDisconnectText: { color: colors.danger },
  healthOptions: { gap: 12 },
  healthConnectButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight },
  healthConnectIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  healthConnectTextContainer: { flex: 1 },
  healthConnectTitle: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  healthConnectSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  healthUnavailable: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.background, borderRadius: 16 },
  healthUnavailableText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  healthPrivacyNote: { fontSize: 12, color: colors.textTertiary, textAlign: 'center', lineHeight: 18, marginTop: 4 },
  identityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  identitySectionTitle: { fontSize: 16, fontWeight: '500' as const, color: colors.textSecondary },
  identityTitles: { gap: 12 },
  identityTitleItem: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.background, borderRadius: borderRadius.lg },
  identityTitleLabel: { fontSize: 15, fontWeight: '600' as const, color: colors.text, marginBottom: 4 },
  identityTitleDescription: { fontSize: 13, color: colors.textTertiary, lineHeight: 18 },
  northStarHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  northStarDescription: { fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  northStarInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight, borderRadius: borderRadius.lg, padding: 16, fontSize: 16, color: colors.text, minHeight: 80, textAlignVertical: 'top' },
});
