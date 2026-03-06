import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const VoidBackground = ({ children }: { children?: React.ReactNode }) => {
    return (
        <View style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient
                        id="voidGrad"
                        cx="50%"
                        cy="0%"
                        rx="80%"
                        ry="60%"
                        fx="50%"
                        fy="0%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#0f172a" stopOpacity="1" />
                        <Stop offset="40%" stopColor="#020617" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#voidGrad)" />
            </Svg>
            {children}
        </View>
    );
};
