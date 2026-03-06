
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface TargetEditModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    title: string;
    initialValue: string;
    isNumeric?: boolean;
}

export const TargetEditModal = ({
    visible,
    onClose,
    onSave,
    title,
    initialValue,
    isNumeric = true
}: TargetEditModalProps) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (visible) setValue(initialValue);
    }, [visible, initialValue]);

    const handleSave = () => {
        haptics.success();
        onSave(value);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>

                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        keyboardType={isNumeric ? 'numeric' : 'default'}
                        autoFocus
                        selectTextOnFocus
                        placeholder="0"
                        placeholderTextColor={liquidGlass.text.tertiary}
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>Save Update</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    card: {
        backgroundColor: liquidGlass.background.secondary,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.deep,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        textAlign: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
    },
    cancelText: {
        color: liquidGlass.text.tertiary,
        fontWeight: '600',
    },
    saveBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: liquidGlass.accent.primary,
        alignItems: 'center',
        ...glassShadows.glowTeal,
    },
    saveText: {
        color: liquidGlass.text.inverse,
        fontWeight: '700',
    }
});
