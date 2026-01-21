import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    haptics.medium();
    onConfirm();
  };

  const handleCancel = () => {
    haptics.light();
    onCancel();
  };

  const iconColor = type === 'danger' ? liquidGlass.status.danger : type === 'warning' ? liquidGlass.status.warning : liquidGlass.status.info;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <AlertTriangle size={32} color={iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={type === 'danger' ? [liquidGlass.status.danger, '#FF4444'] : liquidGlass.gradients.button}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.medium,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: liquidGlass.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    fontWeight: '500' as const,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 50,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    letterSpacing: 0.1,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: liquidGlass.text.inverse,
    letterSpacing: 0.1,
  },
});
