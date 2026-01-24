import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Dimensions,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    interpolate,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Mic, Sparkles, ChevronDown } from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ReeChat Component
 * 
 * Addictive, futuristic chat interface that transforms from a FAB
 * into a glassmorphic chat window with smooth animations.
 */

// Types
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ReeChatProps {
    onSendMessage?: (message: string) => Promise<string>;
    initialMessages?: Message[];
}

// Constants
const FAB_SIZE = 60;
const CHAT_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 400);
const CHAT_HEIGHT = SCREEN_HEIGHT * 0.5;
const CHAT_BORDER_RADIUS = 28;
const ANIMATION_DURATION = 400;
const SCROLL_THRESHOLD = 50; // Pixels from bottom to consider "at bottom"
const AT_BOTTOM_THRESHOLD = 20; // Pixels to be considered "at bottom"

// Animated SVG component for FAB gradient
const AnimatedFabGradient = () => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withTiming(360, {
            duration: 8000,
            easing: Easing.linear,
        });

        const interval = setInterval(() => {
            rotation.value = 0;
            rotation.value = withTiming(360, {
                duration: 8000,
                easing: Easing.linear,
            });
        }, 8000);

        return () => clearInterval(interval);
    }, [rotation]);

    return (
        <Svg width={FAB_SIZE} height={FAB_SIZE}>
            <Defs>
                <SvgGradient id="fabGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={theme.colors.primary} />
                    <Stop offset="50%" stopColor={theme.colors.primaryLight} />
                    <Stop offset="100%" stopColor={theme.colors.secondary} />
                </SvgGradient>
            </Defs>
            <Circle
                cx={FAB_SIZE / 2}
                cy={FAB_SIZE / 2}
                r={(FAB_SIZE / 2) - 2}
                fill="url(#fabGradient)"
            />
        </Svg>
    );
};

export function ReeChat({ onSendMessage, initialMessages = [] }: ReeChatProps) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Smart scroll state
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
    const [hasNewContent, setHasNewContent] = useState(false);
    const contentHeightRef = useRef(0);
    const scrollViewHeightRef = useRef(0);
    const scrollOffsetRef = useRef(0);

    // Animation values
    const progress = useSharedValue(0);
    const fabScale = useSharedValue(1);
    const fabGlow = useSharedValue(0.4);
    const messageOpacity = useSharedValue(0);
    const newMessageIndicatorOpacity = useSharedValue(0);
    const newMessageIndicatorScale = useSharedValue(0.8);

    // Keyboard listeners
    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // FAB pulsing glow animation
    useEffect(() => {
        if (!isOpen) {
            const pulse = () => {
                fabGlow.value = withSequence(
                    withTiming(0.7, { duration: 1500 }),
                    withTiming(0.4, { duration: 1500 })
                );
            };
            pulse();
            const interval = setInterval(pulse, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, fabGlow]);

    // Open chat
    const handleOpen = useCallback(() => {
        haptics.light();
        setIsOpen(true);

        // Scale down FAB then morph to chat
        fabScale.value = withSequence(
            withTiming(0.9, { duration: 100 }),
            withTiming(1, { duration: 100 })
        );

        progress.value = withSpring(1, {
            damping: 20,
            stiffness: 90,
        });

        // Fade in messages after window opens
        messageOpacity.value = withDelay(
            200,
            withTiming(1, { duration: 300 })
        );
    }, [progress, fabScale, messageOpacity]);

    // Close chat
    const handleClose = useCallback(() => {
        haptics.light();
        Keyboard.dismiss();

        // Fade out messages first
        messageOpacity.value = withTiming(0, { duration: 150 });

        // Then morph back to FAB
        progress.value = withSpring(0, {
            damping: 25,
            stiffness: 120,
        });

        setTimeout(() => {
            setIsOpen(false);
        }, 350);
    }, [progress, messageOpacity]);

    // Check if user is at bottom of scroll
    const checkIfAtBottom = useCallback(() => {
        const maxScroll = contentHeightRef.current - scrollViewHeightRef.current;
        const distanceFromBottom = maxScroll - scrollOffsetRef.current;
        return distanceFromBottom <= AT_BOTTOM_THRESHOLD;
    }, []);

    // Handle scroll events
    const handleScroll = useCallback((event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        scrollOffsetRef.current = contentOffset.y;
        contentHeightRef.current = contentSize.height;
        scrollViewHeightRef.current = layoutMeasurement.height;

        const atBottom = checkIfAtBottom();
        setIsAtBottom(atBottom);

        // If user scrolled back to bottom, hide indicator and resume auto-scroll
        if (atBottom && showNewMessageIndicator) {
            setShowNewMessageIndicator(false);
            setHasNewContent(false);
            // Animate indicator out
            newMessageIndicatorOpacity.value = withTiming(0, { duration: 200 });
            newMessageIndicatorScale.value = withTiming(0.8, { duration: 200 });
        }
    }, [checkIfAtBottom, showNewMessageIndicator, newMessageIndicatorOpacity, newMessageIndicatorScale]);

    // Scroll to bottom with animation
    const scrollToBottom = useCallback(() => {
        haptics.light();
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setShowNewMessageIndicator(false);
        setHasNewContent(false);
        setIsAtBottom(true);
        newMessageIndicatorOpacity.value = withTiming(0, { duration: 200 });
        newMessageIndicatorScale.value = withTiming(0.8, { duration: 200 });
    }, [newMessageIndicatorOpacity, newMessageIndicatorScale]);

    // Show new message indicator
    const showIndicator = useCallback(() => {
        if (!isAtBottom) {
            setShowNewMessageIndicator(true);
            setHasNewContent(true);
            // Animate indicator in with spring
            newMessageIndicatorOpacity.value = withSpring(1);
            newMessageIndicatorScale.value = withSpring(1);

            // Auto-dismiss after 3 seconds if user scrolls back
            // This doesn't auto-hide; it only hides when user is at bottom
        }
    }, [isAtBottom, newMessageIndicatorOpacity, newMessageIndicatorScale]);

    // Smart scroll - only auto-scroll if at bottom
    const smartScrollToBottom = useCallback(() => {
        if (isAtBottom) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } else {
            showIndicator();
        }
    }, [isAtBottom, showIndicator]);

    // Send message
    const handleSend = useCallback(async () => {
        if (!inputText.trim()) return;

        haptics.light();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);
        setIsAtBottom(true); // User sending message means they want to see response

        // Always scroll to bottom when user sends
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            // Get AI response
            const response = onSendMessage
                ? await onSendMessage(inputText.trim())
                : "I'm here to help you with your fitness journey. How can I assist you today?";

            setIsTyping(false);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Smart scroll for AI response
            smartScrollToBottom();

        } catch {
            setIsTyping(false);
            // Error handling
        }
    }, [inputText, onSendMessage, smartScrollToBottom]);

    // Swipe down gesture to close
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                progress.value = Math.max(0, 1 - (event.translationY / 200));
            }
        })
        .onEnd((event) => {
            if (event.translationY > 100) {
                runOnJS(handleClose)();
            } else {
                progress.value = withSpring(1);
            }
        });

    // Animated styles
    const containerStyle = useAnimatedStyle(() => {
        const width = interpolate(progress.value, [0, 1], [FAB_SIZE, CHAT_WIDTH]);
        const height = interpolate(progress.value, [0, 1], [FAB_SIZE, CHAT_HEIGHT - keyboardHeight * 0.5]);
        const borderRadius = interpolate(progress.value, [0, 1], [FAB_SIZE / 2, CHAT_BORDER_RADIUS]);

        // Position: FAB at bottom-right, Chat at upper-center
        const right = interpolate(progress.value, [0, 1], [20, (SCREEN_WIDTH - CHAT_WIDTH) / 2]);
        const bottom = interpolate(
            progress.value,
            [0, 1],
            [100 + insets.bottom, SCREEN_HEIGHT * 0.15 + keyboardHeight * 0.5]
        );

        return {
            width,
            height,
            borderRadius,
            right,
            bottom,
            transform: [{ scale: fabScale.value }],
        };
    });

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.3], [fabGlow.value, 0]),
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: messageOpacity.value,
    }));

    const fabContentStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.3], [1, 0]),
    }));

    return (
        <>
            {/* Backdrop when open */}
            {isOpen && (
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                </TouchableOpacity>
            )}

            {/* Main container (FAB → Chat) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.container, containerStyle]}>
                    {/* Glass background */}
                    <BlurView intensity={isOpen ? 80 : 60} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.glassOverlay} />

                    {/* Pulsing glow effect for FAB */}
                    <Animated.View style={[styles.fabGlow, glowStyle]} />

                    {/* FAB Content (visible when closed) */}
                    <Animated.View style={[styles.fabContent, fabContentStyle]}>
                        <TouchableOpacity
                            style={styles.fabTouchable}
                            onPress={handleOpen}
                            activeOpacity={0.9}
                        >
                            <AnimatedFabGradient />
                            <View style={styles.fabIcon}>
                                <Sparkles size={24} color={theme.colors.textInverse} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Chat Content (visible when open) */}
                    {isOpen && (
                        <Animated.View style={[styles.chatContent, contentStyle]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.reeAvatar}>
                                    <LinearGradient
                                        colors={theme.gradients.primary}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarText}>R</Text>
                                    </LinearGradient>
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.headerTitle}>Ree</Text>
                                    <Text style={styles.headerSubtitle}>Your AI Coach</Text>
                                </View>
                                <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                    <X size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Messages */}
                            <View style={styles.messagesWrapper}>
                                <ScrollView
                                    ref={scrollViewRef}
                                    style={styles.messagesContainer}
                                    contentContainerStyle={styles.messagesContent}
                                    showsVerticalScrollIndicator={false}
                                    onScroll={handleScroll}
                                    scrollEventThrottle={16}
                                >
                                    {messages.length === 0 && (
                                        <View style={styles.emptyState}>
                                            <Sparkles size={32} color={theme.colors.primary} />
                                            <Text style={styles.emptyTitle}>Ask Ree Anything</Text>
                                            <Text style={styles.emptySubtitle}>
                                                Get personalized insights about your workouts, recovery, and progress.
                                            </Text>
                                        </View>
                                    )}

                                    {messages.map((message, index) => (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            isLast={index === messages.length - 1}
                                        />
                                    ))}

                                    {isTyping && <TypingIndicator />}
                                </ScrollView>

                                {/* New Message Indicator */}
                                <NewMessageIndicator
                                    visible={showNewMessageIndicator}
                                    isTyping={isTyping}
                                    onPress={scrollToBottom}
                                    opacity={newMessageIndicatorOpacity}
                                    scale={newMessageIndicatorScale}
                                />
                            </View>

                            {/* Input */}
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                keyboardVerticalOffset={0}
                            >
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={inputText}
                                            onChangeText={setInputText}
                                            placeholder="Ask Ree anything..."
                                            placeholderTextColor={theme.colors.textTertiary}
                                            multiline
                                            maxLength={500}
                                        />
                                        <TouchableOpacity style={styles.micBtn}>
                                            <Mic size={18} color={theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
                                        onPress={handleSend}
                                        disabled={!inputText.trim()}
                                    >
                                        <LinearGradient
                                            colors={inputText.trim() ? theme.gradients.tealButton : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                            style={styles.sendBtnGradient}
                                        >
                                            <Send size={18} color={inputText.trim() ? theme.colors.textInverse : theme.colors.textTertiary} />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </Animated.View>
                    )}
                </Animated.View>
            </GestureDetector>
        </>
    );
}

// Message Bubble Component
function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
    const isUser = message.role === 'user';
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(
            isLast ? 100 : 0,
            withTiming(1, { duration: 300 })
        );
        translateY.value = withDelay(
            isLast ? 100 : 0,
            withSpring(0, { damping: 20, stiffness: 120 })
        );
    }, [opacity, translateY, isLast]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.messageBubbleContainer,
                isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
                animatedStyle,
            ]}
        >
            {!isUser && (
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            )}
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {message.content}
                </Text>
            </View>
        </Animated.View>
    );
}

// Typing Indicator
function TypingIndicator() {
    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    useEffect(() => {
        const animate = () => {
            dot1.value = withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 300 })
            );
            dot2.value = withDelay(150, withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 300 })
            ));
            dot3.value = withDelay(300, withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 300 })
            ));
        };
        animate();
        const interval = setInterval(animate, 1200);
        return () => clearInterval(interval);
    }, [dot1, dot2, dot3]);

    const dot1Style = useAnimatedStyle(() => ({
        opacity: 0.4 + dot1.value * 0.6,
        transform: [{ scale: 1 + dot1.value * 0.3 }],
    }));
    const dot2Style = useAnimatedStyle(() => ({
        opacity: 0.4 + dot2.value * 0.6,
        transform: [{ scale: 1 + dot2.value * 0.3 }],
    }));
    const dot3Style = useAnimatedStyle(() => ({
        opacity: 0.4 + dot3.value * 0.6,
        transform: [{ scale: 1 + dot3.value * 0.3 }],
    }));

    return (
        <View style={styles.typingContainer}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.typingContent}>
                <Animated.View style={[styles.typingDot, dot1Style]} />
                <Animated.View style={[styles.typingDot, dot2Style]} />
                <Animated.View style={[styles.typingDot, dot3Style]} />
            </View>
        </View>
    );
}

// New Message Indicator (pill button to scroll to bottom)
interface NewMessageIndicatorProps {
    visible: boolean;
    isTyping: boolean;
    onPress: () => void;
    opacity: Animated.SharedValue<number>;
    scale: Animated.SharedValue<number>;
}

function NewMessageIndicator({ visible, isTyping, onPress, opacity, scale }: NewMessageIndicatorProps) {
    const pulseValue = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            const pulse = () => {
                pulseValue.value = withSequence(
                    withTiming(1.05, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                );
            };
            pulse();
            const interval = setInterval(pulse, 1600);
            return () => clearInterval(interval);
        }
    }, [visible, pulseValue]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value * pulseValue.value },
        ],
    }));

    if (!visible) return null;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.newMessageIndicatorTouchable}
        >
            <Animated.View style={[styles.newMessageIndicator, animatedStyle]}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.newMessageIndicatorContent}>
                    <Text style={styles.newMessageIndicatorText}>
                        {isTyping ? 'Ree is responding' : 'New message'}
                    </Text>
                    <ChevronDown size={14} color={theme.colors.primary} />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 998,
    },
    container: {
        position: 'absolute',
        zIndex: 999,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        ...glassShadows.deep,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 29, 50, 0.85)',
    },
    fabGlow: {
        position: 'absolute',
        width: FAB_SIZE + 20,
        height: FAB_SIZE + 20,
        borderRadius: (FAB_SIZE + 20) / 2,
        backgroundColor: theme.colors.primary,
        top: -10,
        left: -10,
    },
    fabContent: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabTouchable: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        position: 'absolute',
    },
    chatContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    reeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatarGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 1,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    messageBubbleContainer: {
        maxWidth: '85%',
        borderRadius: 18,
        overflow: 'hidden',
    },
    userBubbleContainer: {
        alignSelf: 'flex-end',
    },
    assistantBubbleContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        paddingHorizontal: 16,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
    },
    assistantBubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    messageText: {
        fontSize: 15,
        color: theme.colors.text,
        lineHeight: 21,
    },
    userMessageText: {
        color: theme.colors.textInverse,
    },
    typingContainer: {
        alignSelf: 'flex-start',
        borderRadius: 18,
        overflow: 'hidden',
        maxWidth: 80,
    },
    typingContent: {
        flexDirection: 'row',
        padding: 14,
        paddingHorizontal: 18,
        gap: 6,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 8,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text,
        maxHeight: 80,
        paddingVertical: 4,
    },
    micBtn: {
        padding: 6,
        marginLeft: 4,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sendBtnActive: {
        ...glassShadows.glowTeal,
    },
    sendBtnGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Smart scroll styles
    messagesWrapper: {
        flex: 1,
        position: 'relative',
    },
    newMessageIndicatorTouchable: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    newMessageIndicator: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${theme.colors.primary}40`,
        ...glassShadows.soft,
    },
    newMessageIndicatorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
    },
    newMessageIndicatorText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
});

export default ReeChat;
