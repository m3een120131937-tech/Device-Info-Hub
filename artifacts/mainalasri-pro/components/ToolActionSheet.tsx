import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export interface ToolOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  warning?: string;
  auto: {
    description: string;
    steps: string[];
    actionLabel: string;
    actionIcon: string;
    canAct: boolean;
    onAction?: () => void | Promise<void>;
  };
  manual: {
    description: string;
    steps: string[];
  };
}

interface Props {
  visible: boolean;
  option: ToolOption | null;
  onClose: () => void;
}

type Mode = null | "auto" | "manual";

export function openURL(url: string) {
  Linking.openURL(url).catch(() => {});
}

export async function copyToClipboard(text: string) {
  await Clipboard.setStringAsync(text);
}

export default function ToolActionSheet({ visible, option, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [mode, setMode] = useState<Mode>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visible) {
      setMode(null);
      setRunning(false);
      setDone(false);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  async function handleAutoAction() {
    if (!option?.auto.onAction) return;
    setRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await option.auto.onAction();
      setDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRunning(false);
    }
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [700, 0],
  });

  if (!option) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            transform: [{ translateY }],
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={22} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.sheetTitleRow}>
            <View style={[styles.sheetIcon, { backgroundColor: option.color + "25" }]}>
              <MaterialCommunityIcons name={option.icon as "home"} size={22} color={option.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{option.title}</Text>
              {option.subtitle ? (
                <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>{option.subtitle}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {option.warning ? (
          <View style={[styles.warnRow, { backgroundColor: "#ff6b3512", borderColor: "#ff6b3535" }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#ff6b35" />
            <Text style={[styles.warnText, { color: "#ff6b35" }]}>{option.warning}</Text>
          </View>
        ) : null}

        {/* ── MODE SELECTION ── */}
        {mode === null ? (
          <View style={styles.modesRow}>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setMode("auto"); }}
              style={[styles.modeCard, { backgroundColor: "#ffd70012", borderColor: "#ffd70045" }]}
            >
              <View style={[styles.modeIconBg, { backgroundColor: "#ffd70022" }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={30} color="#ffd700" />
              </View>
              <Text style={[styles.modeTitle, { color: "#ffd700" }]}>تلقائي</Text>
              <Text style={[styles.modeHint, { color: colors.mutedForeground }]}>التطبيق ينفّذ بنفسه</Text>
            </Pressable>

            <Pressable
              onPress={() => { Haptics.selectionAsync(); setMode("manual"); }}
              style={[styles.modeCard, { backgroundColor: "#00d4ff12", borderColor: "#00d4ff45" }]}
            >
              <View style={[styles.modeIconBg, { backgroundColor: "#00d4ff22" }]}>
                <MaterialCommunityIcons name="book-open-variant" size={30} color="#00d4ff" />
              </View>
              <Text style={[styles.modeTitle, { color: "#00d4ff" }]}>يدوي</Text>
              <Text style={[styles.modeHint, { color: colors.mutedForeground }]}>خطوات للمستخدم</Text>
            </Pressable>
          </View>
        ) : (
          /* ── STEPS VIEW ── */
          <>
            <View style={[styles.modeBar, { borderBottomColor: colors.border }]}>
              <Pressable
                onPress={() => { Haptics.selectionAsync(); setMode(null); setDone(false); }}
                style={styles.backModeBtn}
              >
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
                <Text style={[styles.backModeText, { color: colors.primary }]}>تغيير الوضع</Text>
              </Pressable>
              <View
                style={[
                  styles.modeBadge,
                  { backgroundColor: mode === "auto" ? "#ffd70018" : "#00d4ff18" },
                ]}
              >
                <MaterialCommunityIcons
                  name={mode === "auto" ? "lightning-bolt" : "book-open-variant"}
                  size={13}
                  color={mode === "auto" ? "#ffd700" : "#00d4ff"}
                />
                <Text
                  style={[
                    styles.modeBadgeText,
                    { color: mode === "auto" ? "#ffd700" : "#00d4ff" },
                  ]}
                >
                  {mode === "auto" ? "وضع تلقائي" : "وضع يدوي"}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.stepsScroll}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modeDescText, { color: colors.mutedForeground }]}>
                {mode === "auto" ? option.auto.description : option.manual.description}
              </Text>

              {(mode === "auto" ? option.auto.steps : option.manual.steps).map((step, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepItem,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.stepNum,
                      { backgroundColor: mode === "auto" ? "#ffd70022" : "#00d4ff22" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumText,
                        { color: mode === "auto" ? "#ffd700" : "#00d4ff" },
                      ]}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}

              {mode === "auto" && option.auto.canAct ? (
                <Pressable
                  onPress={done ? undefined : handleAutoAction}
                  style={[
                    styles.actionBtn,
                    done
                      ? { backgroundColor: "#4ade8018", borderWidth: 1, borderColor: "#4ade8045" }
                      : running
                      ? { backgroundColor: "#ffd70030" }
                      : { backgroundColor: "#ffd700" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      done
                        ? "check-circle"
                        : running
                        ? "loading"
                        : (option.auto.actionIcon as "home")
                    }
                    size={20}
                    color={done ? "#4ade80" : running ? "#ffd700" : "#000"}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: done ? "#4ade80" : running ? "#ffd700" : "#000" },
                    ]}
                  >
                    {done ? "تم بنجاح ✓" : running ? "جاري التنفيذ..." : option.auto.actionLabel}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "78%",
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  closeBtn: { padding: 4 },
  sheetTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sheetIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", textAlign: "right" },
  sheetSubtitle: { fontSize: 12, textAlign: "right", marginTop: 1 },
  warnRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  warnText: { fontSize: 12, flex: 1, textAlign: "right" },
  modesRow: {
    flexDirection: "row-reverse",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 20,
  },
  modeCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  modeIconBg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitle: { fontSize: 17, fontWeight: "700" },
  modeHint: { fontSize: 12, textAlign: "center" },
  modeBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  backModeBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 2 },
  backModeText: { fontSize: 13, fontWeight: "500" },
  modeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modeBadgeText: { fontSize: 12, fontWeight: "600" },
  stepsScroll: { paddingHorizontal: 16, maxHeight: 420 },
  modeDescText: {
    fontSize: 13,
    textAlign: "right",
    lineHeight: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  stepItem: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: { fontSize: 13, fontWeight: "700" },
  stepText: { fontSize: 13, flex: 1, textAlign: "right", lineHeight: 20, marginTop: 4 },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  actionBtnText: { fontSize: 15, fontWeight: "700" },
});
