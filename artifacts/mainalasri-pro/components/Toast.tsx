import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text } from "react-native";

const native = Platform.OS !== "web";

interface ToastProps {
  message: string;
  visible: boolean;
  color?: string;
}

export function Toast({ message, visible, color = "#00d4ff" }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: native }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: native }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: native }),
        Animated.timing(translateY, { toValue: 30, duration: 300, useNativeDriver: native }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }], borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#0f1629",
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    zIndex: 9999,
    minWidth: 200,
    maxWidth: 320,
    ...Platform.select({
      web: { boxShadow: "0px 4px 24px rgba(0,0,0,0.4)" },
      default: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    }),
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    writingDirection: "rtl",
  },
});
