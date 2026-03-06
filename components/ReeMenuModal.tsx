import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { MessageSquare, ClipboardCheck, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { theme } from '@/constants/theme';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface ReeMenuModalProps {
    visible: boolean;
    onClose: () => void;
    onCheckIn: () => void;
    onTalk: () => void;
}

export function ReeMenuModal({ visible, onClose, onCheckIn, onTalk }: ReeMenuModalProps) {
    const router = useRouter();

    const handleTalkToRee = () => {
        haptics.light();
        onClose();
        onTalk();
    };

    const handleCheckIn = () => {
        haptics.light();
        onClose();
        onCheckIn();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                    <TouchableWithoutFeedback>
                        <View style={styles.menuContainer}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Ree Assistant</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <X size={20} color={liquidGlass.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.menuItem} onPress={handleTalkToRee}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                    <MessageSquare size={24} color="#60A5FA" />
                                </View>
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemTitle}>Talk to Ree</Text>
                                    <Text style={styles.itemDesc}>Chat about your recovery or training</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={handleCheckIn}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(20, 184, 166, 0.2)' }]}>
                                    <ClipboardCheck size={24} color="#2DD4BF" />
                                </View>
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemTitle}>Check in with Ree</Text>
                                    <Text style={styles.itemDesc}>Quick questionnaire to update readiness</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuContainer: {
        backgroundColor: liquidGlass.surface.card,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: liquidGlass.border.glass,
        padding: 24,
        paddingBottom: 40,
        ...glassShadows.deep,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    closeBtn: {
        padding: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    }
});
