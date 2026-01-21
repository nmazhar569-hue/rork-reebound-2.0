import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Audio } from 'expo-av';
import {
  X,
  Mic,
  Camera,
  ScanLine,
  Image as ImageIcon,
  ChevronRight,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';
import { haptics } from '@/utils/haptics';
import {
  processFoodInput,
  transcribeAudio,
  FoodInputResult,
  FoodNutrition,
} from '@/services/FoodProcessingService';

const NEON_LIME = '#CCFF00';
const TEAL = '#00C2B8';
const ORANGE = '#FF7A50';
const BG_PRIMARY = '#000000';
const BG_CARD = 'rgba(255,255,255,0.03)';
const BORDER_COLOR = 'rgba(255,255,255,0.06)';

interface SmartFoodLoggerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    inflammationScore?: number;
  }) => void;
  mealName: string;
}

type CameraMode = 'barcode' | 'photo';
type InputMode = 'text' | 'voice' | 'camera' | null;

export function SmartFoodLogger({ visible, onClose, onSave, mealName }: SmartFoodLoggerProps) {
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodInputResult | null>(null);
  const [editableEntry, setEditableEntry] = useState<FoodNutrition | null>(null);
  
  const [cameraMode, setCameraMode] = useState<CameraMode>('barcode');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  useEffect(() => {
    if (inputMode === 'camera' && cameraMode === 'barcode') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [inputMode, cameraMode, scanLineAnim]);

  const resetState = useCallback(() => {
    setInputMode(null);
    setTextInput('');
    setIsProcessing(false);
    setError(null);
    setResult(null);
    setEditableEntry(null);
    setIsScanning(true);
  }, []);

  const requestAudioPermission = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === 'granted');
      return status === 'granted';
    } catch (err) {
      console.error('[SmartFoodLogger] Audio permission error:', err);
      return false;
    }
  }, []);

  const handleTextSubmit = useCallback(async () => {
    if (!textInput.trim()) return;
    
    haptics.medium();
    setIsProcessing(true);
    setError(null);
    
    try {
      const foodResult = await processFoodInput({
        source: 'text',
        text: textInput.trim(),
      });
      
      setResult(foodResult);
      if (foodResult.items.length > 0) {
        setEditableEntry({
          name: foodResult.items.map(i => i.name).join(', '),
          calories: foodResult.totalCalories,
          protein: foodResult.totalProtein,
          carbs: foodResult.totalCarbs,
          fats: foodResult.totalFats,
          confidence: 'medium',
        });
      }
      haptics.success();
    } catch (err) {
      console.error('[SmartFoodLogger] Text processing error:', err);
      setError('Failed to process food description. Please try again.');
      haptics.error();
    } finally {
      setIsProcessing(false);
    }
  }, [textInput]);

  const handleStartRecording = useCallback(async () => {
    if (Platform.OS === 'web') {
      setError('Voice recording is not available on web');
      return;
    }
    
    const hasPermission = audioPermission || await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone access is needed for voice input');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setInputMode('voice');
      haptics.light();
      console.log('[SmartFoodLogger] Recording started');
    } catch (err) {
      console.error('[SmartFoodLogger] Failed to start recording:', err);
      setError('Failed to start recording');
    }
  }, [audioPermission, requestAudioPermission]);

  const handleStopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      haptics.medium();

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

      console.log('[SmartFoodLogger] Recording stopped, URI:', uri);

      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const transcript = await transcribeAudio(uri, fileType);
      console.log('[SmartFoodLogger] Transcript:', transcript);

      setTextInput(transcript);

      const foodResult = await processFoodInput({
        source: 'voice',
        text: transcript,
      });

      setResult(foodResult);
      if (foodResult.items.length > 0) {
        setEditableEntry({
          name: foodResult.items.map(i => i.name).join(', '),
          calories: foodResult.totalCalories,
          protein: foodResult.totalProtein,
          carbs: foodResult.totalCarbs,
          fats: foodResult.totalFats,
          confidence: 'medium',
        });
      }
      haptics.success();
    } catch (err) {
      console.error('[SmartFoodLogger] Recording/transcription error:', err);
      setError('Failed to process voice input. Please try again.');
      haptics.error();
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleOpenCamera = useCallback(async (mode: CameraMode) => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to scan food');
        return;
      }
    }
    
    setCameraMode(mode);
    setInputMode('camera');
    setIsScanning(true);
    haptics.light();
  }, [cameraPermission, requestCameraPermission]);

  const handleBarcodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (!isScanning) return;
    
    setIsScanning(false);
    haptics.medium();
    setIsProcessing(true);
    setError(null);

    console.log('[SmartFoodLogger] Barcode scanned:', result.data);

    try {
      const foodResult = await processFoodInput({
        source: 'barcode',
        barcodeData: result.data,
      });

      setResult(foodResult);
      if (foodResult.items.length > 0) {
        setEditableEntry({
          name: foodResult.items[0].name,
          calories: foodResult.totalCalories,
          protein: foodResult.totalProtein,
          carbs: foodResult.totalCarbs,
          fats: foodResult.totalFats,
          confidence: 'high',
        });
      }
      setInputMode(null);
      haptics.success();
    } catch (err: unknown) {
      console.error('[SmartFoodLogger] Barcode processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Product not found. Try again or enter manually.';
      setError(errorMessage);
      setIsScanning(true);
      haptics.error();
    } finally {
      setIsProcessing(false);
    }
  }, [isScanning]);

  const handleTakePhoto = useCallback(async () => {
    if (!cameraRef.current) return;

    haptics.medium();
    setIsProcessing(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      console.log('[SmartFoodLogger] Photo captured');

      const foodResult = await processFoodInput({
        source: 'image',
        imageBase64: photo.base64,
      });

      setResult(foodResult);
      if (foodResult.items.length > 0) {
        setEditableEntry({
          name: foodResult.items.map(i => i.name).join(', '),
          calories: foodResult.totalCalories,
          protein: foodResult.totalProtein,
          carbs: foodResult.totalCarbs,
          fats: foodResult.totalFats,
          confidence: 'medium',
        });
      }
      setInputMode(null);
      haptics.success();
    } catch (err) {
      console.error('[SmartFoodLogger] Photo processing error:', err);
      setError('Failed to analyze photo. Please try again.');
      haptics.error();
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!editableEntry) return;

    haptics.success();
    onSave({
      name: editableEntry.name,
      calories: editableEntry.calories,
      protein: editableEntry.protein,
      carbs: editableEntry.carbs,
      fats: editableEntry.fats,
      inflammationScore: editableEntry.inflammationScore,
    });
    onClose();
  }, [editableEntry, onSave, onClose]);

  const updateEditableField = useCallback((field: keyof FoodNutrition, value: string | number) => {
    if (!editableEntry) return;
    setEditableEntry({
      ...editableEntry,
      [field]: typeof value === 'string' && field !== 'name' ? parseInt(value, 10) || 0 : value,
    });
  }, [editableEntry]);

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={cameraMode === 'barcode' ? {
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        } : undefined}
        onBarcodeScanned={cameraMode === 'barcode' && isScanning ? handleBarcodeScanned : undefined}
      >
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setInputMode(null)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.cameraModeToggle}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, cameraMode === 'barcode' && styles.modeToggleBtnActive]}
              onPress={() => { setCameraMode('barcode'); setIsScanning(true); }}
            >
              <ScanLine size={18} color={cameraMode === 'barcode' ? '#000' : '#FFF'} />
              <Text style={[styles.modeToggleText, cameraMode === 'barcode' && styles.modeToggleTextActive]}>
                Barcode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeToggleBtn, cameraMode === 'photo' && styles.modeToggleBtnActive]}
              onPress={() => setCameraMode('photo')}
            >
              <ImageIcon size={18} color={cameraMode === 'photo' ? '#000' : '#FFF'} />
              <Text style={[styles.modeToggleText, cameraMode === 'photo' && styles.modeToggleTextActive]}>
                Food Snap
              </Text>
            </TouchableOpacity>
          </View>

          {cameraMode === 'barcode' ? (
            <View style={styles.scanFrame}>
              <View style={styles.scanCorner} />
              <View style={[styles.scanCorner, styles.scanCornerTR]} />
              <View style={[styles.scanCorner, styles.scanCornerBL]} />
              <View style={[styles.scanCorner, styles.scanCornerBR]} />
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 180],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Text style={styles.scanHint}>
                {isScanning ? 'Point at barcode' : 'Processing...'}
              </Text>
            </View>
          ) : (
            <View style={styles.photoFrame}>
              <Text style={styles.photoHint}>Center your food in frame</Text>
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={handleTakePhoto}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View style={styles.captureBtnInner} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );

  const renderEditableForm = () => (
    <View style={styles.editableForm}>
      <View style={styles.formHeader}>
        <Sparkles size={20} color={NEON_LIME} />
        <Text style={styles.formTitle}>Review & Edit</Text>
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Food Name</Text>
        <TextInput
          style={styles.fieldInput}
          value={editableEntry?.name || ''}
          onChangeText={(v) => updateEditableField('name', v)}
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
      </View>

      <View style={styles.macroGrid}>
        <View style={styles.macroField}>
          <Text style={styles.macroLabel}>Calories</Text>
          <TextInput
            style={styles.macroInput}
            value={String(editableEntry?.calories || 0)}
            onChangeText={(v) => updateEditableField('calories', v)}
            keyboardType="numeric"
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <Text style={styles.macroUnit}>kcal</Text>
        </View>
        <View style={styles.macroField}>
          <Text style={styles.macroLabel}>Protein</Text>
          <TextInput
            style={styles.macroInput}
            value={String(editableEntry?.protein || 0)}
            onChangeText={(v) => updateEditableField('protein', v)}
            keyboardType="numeric"
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <Text style={styles.macroUnit}>g</Text>
        </View>
        <View style={styles.macroField}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <TextInput
            style={styles.macroInput}
            value={String(editableEntry?.carbs || 0)}
            onChangeText={(v) => updateEditableField('carbs', v)}
            keyboardType="numeric"
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <Text style={styles.macroUnit}>g</Text>
        </View>
        <View style={styles.macroField}>
          <Text style={styles.macroLabel}>Fats</Text>
          <TextInput
            style={styles.macroInput}
            value={String(editableEntry?.fats || 0)}
            onChangeText={(v) => updateEditableField('fats', v)}
            keyboardType="numeric"
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <Text style={styles.macroUnit}>g</Text>
        </View>
      </View>

      {result && result.items.length > 1 && (
        <View style={styles.itemsBreakdown}>
          <Text style={styles.breakdownTitle}>Items Detected:</Text>
          {result.items.map((item, idx) => (
            <View key={idx} style={styles.breakdownItem}>
              <Text style={styles.breakdownName}>{item.name}</Text>
              <Text style={styles.breakdownMacros}>
                {item.calories}kcal • P:{item.protein}g • C:{item.carbs}g • F:{item.fats}g
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <LinearGradient
          colors={[NEON_LIME, TEAL]}
          style={styles.saveBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Check size={20} color="#000" />
          <Text style={styles.saveBtnText}>Save to {mealName}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.retryBtn} onPress={resetState}>
        <RefreshCw size={16} color="rgba(255,255,255,0.6)" />
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMainInput = () => (
    <View style={styles.mainInputContainer}>
      <View style={styles.aiInputContainer}>
        <TextInput
          style={styles.aiInputField}
          placeholder="I ate 2 eggs and toast..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={textInput}
          onChangeText={setTextInput}
          multiline
          numberOfLines={3}
          onSubmitEditing={handleTextSubmit}
        />
        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[styles.inputActionBtn, isRecording && styles.inputActionBtnActive]}
            onPressIn={handleStartRecording}
            onPressOut={handleStopRecording}
            delayLongPress={0}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Mic size={22} color={isRecording ? '#000' : NEON_LIME} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inputActionBtn}
            onPress={() => handleOpenCamera('barcode')}
          >
            <ScanLine size={22} color={NEON_LIME} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inputActionBtn}
            onPress={() => handleOpenCamera('photo')}
          >
            <Camera size={22} color={NEON_LIME} />
          </TouchableOpacity>
        </View>
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording... Release to process</Text>
        </View>
      )}

      <View style={styles.inputHints}>
        <View style={styles.hintItem}>
          <Mic size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.hintText}>Hold mic to speak</Text>
        </View>
        <View style={styles.hintItem}>
          <ScanLine size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.hintText}>Scan barcode</Text>
        </View>
        <View style={styles.hintItem}>
          <Camera size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.hintText}>Snap food photo</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.processBtn, (!textInput.trim() || isProcessing) && styles.processBtnDisabled]}
        onPress={handleTextSubmit}
        disabled={!textInput.trim() || isProcessing}
      >
        <LinearGradient
          colors={textInput.trim() && !isProcessing ? [NEON_LIME, TEAL] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
          style={styles.processBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isProcessing ? (
            <ActivityIndicator color={textInput.trim() ? '#000' : 'rgba(255,255,255,0.3)'} />
          ) : (
            <>
              <Sparkles size={18} color={textInput.trim() ? '#000' : 'rgba(255,255,255,0.3)'} />
              <Text style={[styles.processBtnText, !textInput.trim() && styles.processBtnTextDisabled]}>
                Analyze with AI
              </Text>
              <ChevronRight size={18} color={textInput.trim() ? '#000' : 'rgba(255,255,255,0.3)'} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {inputMode === 'camera' ? (
        renderCameraView()
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log {mealName}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                <X size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={ORANGE} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => setError(null)}>
                  <X size={16} color={ORANGE} />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {editableEntry ? renderEditableForm() : renderMainInput()}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalClose: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,122,80,0.15)',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: ORANGE,
    fontSize: 13,
  },
  mainInputContainer: {
    gap: 16,
  },
  aiInputContainer: {
    backgroundColor: BG_CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  aiInputField: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  inputActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(204,255,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputActionBtnActive: {
    backgroundColor: NEON_LIME,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,59,48,0.15)',
    borderRadius: 12,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  inputHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  processBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  processBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 50,
  },
  processBtnDisabled: {
    opacity: 0.6,
  },
  processBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  processBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraModeToggle: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 80,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 4,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 22,
  },
  modeToggleBtnActive: {
    backgroundColor: NEON_LIME,
  },
  modeToggleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modeToggleTextActive: {
    color: '#000',
  },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    height: 200,
    borderWidth: 0,
  },
  scanCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: NEON_LIME,
  },
  scanCornerTR: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  scanCornerBL: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  scanCornerBR: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: NEON_LIME,
    shadowColor: NEON_LIME,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanHint: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 14,
  },
  photoFrame: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  photoHint: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 30,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
  editableForm: {
    gap: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  formTitle: {
    color: NEON_LIME,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  formField: {
    gap: 8,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroField: {
    width: '47%',
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  macroLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  macroInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  macroUnit: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  itemsBreakdown: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 10,
  },
  breakdownTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  breakdownItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  breakdownName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  breakdownMacros: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  saveBtn: {
    borderRadius: 50,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 50,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});
