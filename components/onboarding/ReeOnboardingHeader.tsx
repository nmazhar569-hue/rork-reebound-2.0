import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';

interface ReeOnboardingHeaderProps {
    message: string;
    isTyping?: boolean;
}

export function ReeOnboardingHeader({ message, isTyping = false }: ReeOnboardingHeaderProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Reset and fade i
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [message]);

    return (
        <View style={styles.container}>
            {/* Ree Avatar */}
            <View style={styles.avatarContainer}>
                <Image
                    source={require('@/assets/images/ree-avatar.png')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                />
            </View>

            {/* Chat Bubble */}
            <View style={styles.bubbleContainer}>
                <Animated.View style={[styles.bubble, { opacity: fadeAnim }]}>
                    <Text style={styles.bubbleText}>
                        {message}
                        {isTyping && <Text style={styles.cursor}>|</Text>}
                    </Text>
                </Animated.View>
                {/* Little triangle for speech bubble */}
                <View style={styles.bubbleTriangle} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 24,
        marginTop: 10,
        gap: 12,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: liquidGlass.accent.primary,
        padding: 2,
        ...glassShadows.glow,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    bubbleContainer: {
        flex: 1,
        marginTop: 8,
    },
    bubble: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)', // Slate-800 with opacity
        borderRadius: 16,
        borderTopLeftRadius: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...glassShadows.soft,
    },
    bubbleText: {
        color: liquidGlass.text.primary,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    cursor: {
        color: liquidGlass.accent.primary,
        fontWeight: '700',
    },
    bubbleTriangle: {
        // Optional: could add a triangle here if desired, 
        // but the borderTopLeftRadius trick works well for chat bubbles
    }
});
