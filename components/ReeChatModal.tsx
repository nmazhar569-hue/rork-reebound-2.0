import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Sparkles } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { REE_SYSTEM_PROMPT } from '@/constants/reeBehavior';
import { theme } from '@/constants/theme';
import { glassShadows, liquidGlass } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface ReeChatModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ReeChatModal({ visible, onClose }: ReeChatModalProps) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    const { userProfile, getTodayLog, getTodayWorkout } = useApp();
    const todayLog = getTodayLog();
    const todayWorkout = getTodayWorkout();

    const [inputText, setInputText] = useState('');
    const [hasInitialized, setHasInitialized] = useState(false);

    // --- CONTEXT LOGIC (Minified from ai-chat.tsx) ---
    const userContext = userProfile ? `
User: ${userProfile.questionnaireProfile?.preferredName || 'Athlete'}
Injury: ${userProfile.injuryType}
Status: ${todayWorkout ? 'Training today' : 'Rest day'}
Pain: ${todayLog?.painLevel ?? 'N/A'}/10
Energy: ${todayLog?.energyLevel ?? 'N/A'}/10
` : 'Profile: N/A';

    const systemPrompt = `${REE_SYSTEM_PROMPT}\nCONTEXT:\n${userContext}`;

    const { messages, sendMessage, status, error, setMessages } = useRorkAgent({ tools: {} });

    useEffect(() => {
        if (visible && !hasInitialized) {
            setMessages([{ id: 'system', role: 'system', parts: [{ type: 'text', text: systemPrompt }] }]);
            setHasInitialized(true);
        }
    }, [visible, hasInitialized]);

    // Auto-scroll
    useEffect(() => {
        if (visible && scrollViewRef.current) {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages, status, visible]);

    const handleSend = useCallback(() => {
        if (!inputText.trim() || status === 'streaming') return;
        haptics.light();
        sendMessage(inputText.trim());
        setInputText('');
        Keyboard.dismiss();
    }, [inputText, status, sendMessage]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.iconContainer}>
                                    <Sparkles size={16} color={liquidGlass.text.inverse} />
                                </View>
                                <Text style={styles.headerTitle}>Ree Chat</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <X size={20} color={liquidGlass.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.chatContainer}
                            contentContainerStyle={styles.chatContent}
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode="interactive"
                        >
                            {/* Welcome/Empty State */}
                            {messages.length <= 1 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>Hey {userProfile?.questionnaireProfile?.preferredName || 'there'}. How's the body feeling?</Text>
                                </View>
                            )}

                            {messages.filter(m => m.role !== 'system').map(m => (
                                <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                                    <Text style={[styles.msgText, m.role === 'user' ? styles.userMsgText : styles.aiMsgText]}>
                                        {m.parts.map(p => p.type === 'text' && p.text).join('')}
                                    </Text>
                                </View>
                            ))}

                            {status === 'streaming' && (
                                <View style={[styles.bubble, styles.aiBubble]}><ActivityIndicator size="small" color={theme.colors.primary} /></View>
                            )}
                        </ScrollView>

                        {/* Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask Ree..."
                                placeholderTextColor={liquidGlass.text.tertiary}
                                value={inputText}
                                onChangeText={setInputText}
                            />
                            <TouchableOpacity onPress={handleSend} disabled={!inputText.trim()} style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}>
                                <Send size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: '90%',
        height: 500, // Fixed height for "popup" feel
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 24,
        ...glassShadows.deep,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconContainer: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: liquidGlass.text.primary },
    closeBtn: { padding: 4 },

    chatContainer: { flex: 1 },
    chatContent: { padding: 16, gap: 12 },
    emptyState: { padding: 20, alignItems: 'center' },
    emptyText: { color: liquidGlass.text.secondary, textAlign: 'center' },

    bubble: { maxWidth: '85%', padding: 12, borderRadius: 16 },
    userBubble: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: 4 },

    msgText: { fontSize: 14, lineHeight: 20 },
    userMsgText: { color: 'white' },
    aiMsgText: { color: liquidGlass.text.primary },

    inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', alignItems: 'center', gap: 10 },
    input: { flex: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, paddingHorizontal: 16, color: 'white' },
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
});
