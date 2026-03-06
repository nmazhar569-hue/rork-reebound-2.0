
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trash2, CalendarDays, History as HistoryIcon, X } from 'lucide-react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface OptionItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
    destructive?: boolean;
}

interface ExerciseOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onMove: () => void;
    onHistory: () => void;
    exerciseName: string;
}

export const ExerciseOptionsModal = ({
    visible,
    onClose,
    onDelete,
    onMove,
    onHistory,
    exerciseName
}: ExerciseOptionsModalProps) => {

    const options: OptionItem[] = [
        {
            id: 'history',
            label: 'View History',
            icon: <HistoryIcon size={20} color={liquidGlass.text.primary} />,
            color: liquidGlass.text.primary,
            action: onHistory
        },
        {
            id: 'move',
            label: 'Move to another day',
            icon: <CalendarDays size={20} color={liquidGlass.text.primary} />,
            color: liquidGlass.text.primary,
            action: onMove
        },
        {
            id: 'delete',
            label: 'Delete Exercise',
            icon: <Trash2 size={20} color="#FF6B6B" />,
            color: '#FF6B6B',
            action: onDelete,
            destructive: true
        }
    ];

    const handlePress = (action: () => void) => {
        haptics.selection();
        onClose();
        // Small delay to allow modal to close first
        setTimeout(action, 100);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                <TouchableWithoutFeedback>
                    <View style={styles.sheet}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <X size={20} color={liquidGlass.text.tertiary} />
                            </TouchableOpacity>
                        </View>

                        {/* Options */}
                        <View style={styles.optionsList}>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={styles.optionRow}
                                    onPress={() => handlePress(opt.action)}
                                >
                                    <View style={[styles.iconBox, opt.destructive && styles.destructiveIconBox]}>
                                        {opt.icon}
                                    </View>
                                    <Text style={[styles.optionLabel, opt.destructive && styles.destructiveText]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: liquidGlass.background.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.glass,
        ...glassShadows.deep,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        paddingBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    },
    optionsList: {
        gap: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: liquidGlass.surface.glass,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    destructiveIconBox: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },
    destructiveText: {
        color: '#FF6B6B',
    }
});
