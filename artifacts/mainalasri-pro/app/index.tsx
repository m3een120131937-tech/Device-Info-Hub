import * as Battery from "expo-battery";
import * as Device from "expo-device";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Toast } from "@/components/Toast";
import { useColors } from "@/hooks/useColors";

const native = Platform.OS !== "web";

interface DeviceInfo {
  model: string;
  androidVersion: string;
  totalRam: string;
  batteryLevel: number | null;
  isCharging: boolean;
  loaded: boolean;
}

interface Tool {
  id: string;
  labelAr: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  toastMsg: string;
}

const TOOLS: Tool[] = [
  {
    id: "frp",
    labelAr: "أدوات FRP",
    icon: "shield-lock",
    color: "#ff6b35",
    toastMsg: "🔓 جارٍ فتح أدوات FRP",
  },
  {
    id: "flash",
    labelAr: "أدوات الفلاش",
    icon: "flash",
    color: "#ffd700",
    toastMsg: "⚡ جارٍ فتح أدوات الفلاش",
  },
  {
    id: "imei",
    labelAr: "أدوات IMEI",
    icon: "sim",
    color: "#00d4ff",
    toastMsg: "📡 جارٍ فتح أدوات IMEI",
  },
  {
    id: "network",
    labelAr: "أدوات الشبكة",
    icon: "wifi",
    color: "#4ade80",
    toastMsg: "🌐 جارٍ فتح أدوات الشبكة",
  },
  {
    id: "qr",
    labelAr: "ماسح QR",
    icon: "qrcode-scan",
    color: "#a855f7",
    toastMsg: "📷 جارٍ فتح ماسح QR",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    model: "...",
    androidVersion: "...",
    totalRam: "...",
    batteryLevel: null,
    isCharging: false,
    loaded: false,
  });

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastColor, setToastColor] = useState("#00d4ff");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, color: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    setToastColor(color);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    async function loadInfo() {
      let model = "غير معروف";
      let androidVersion = "غير متاح";
      let totalRam = "غير متاح";
      let batteryLevel: number | null = null;
      let isCharging = false;

      try {
        if (Device.modelName) model = Device.modelName;
        else if (Device.deviceName) model = Device.deviceName;
        if (Device.osVersion) androidVersion = `Android ${Device.osVersion}`;
        if (Device.totalMemory) {
          const gb = Device.totalMemory / 1024 / 1024 / 1024;
          totalRam = `${gb.toFixed(1)} GB`;
        }
      } catch {
        /* ignore */
      }

      if (Platform.OS !== "web") {
        try {
          const level = await Battery.getBatteryLevelAsync();
          if (level >= 0) batteryLevel = Math.round(level * 100);
          const state = await Battery.getBatteryStateAsync();
          isCharging =
            state === Battery.BatteryState.CHARGING ||
            state === Battery.BatteryState.FULL;
        } catch {
          /* ignore */
        }
      }

      setDeviceInfo({ model, androidVersion, totalRam, batteryLevel, isCharging, loaded: true });
    }

    loadInfo();
  }, []);

  function batteryColor(level: number | null): string {
    if (level === null) return colors.mutedForeground;
    if (level > 50) return "#4ade80";
    if (level > 20) return "#ffd700";
    return "#ef4444";
  }

  const webTop = Platform.OS === "web" ? 67 : 0;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 20 + webTop,
            paddingBottom: insets.bottom + 40 + webBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appTitle, { color: colors.foreground }]}>Mainalasri Pro</Text>
              <Text style={[styles.appSubtitle, { color: colors.mutedForeground }]}>
                مجموعة أدوات الهاتف الاحترافية
              </Text>
            </View>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" },
              ]}
            >
              <MaterialCommunityIcons name="shield-check" size={28} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Device Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.infoCardHeader, { borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons name="cellphone-information" size={18} color={colors.primary} />
            <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>معلومات الجهاز</Text>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>

          <View style={styles.infoGrid}>
            <InfoItem
              icon="cellphone"
              label="الموديل"
              value={deviceInfo.model}
              accent="#00d4ff"
              textColor={colors.foreground}
              subColor={colors.mutedForeground}
              loaded={deviceInfo.loaded}
            />
            <InfoItem
              icon="android"
              label="نظام التشغيل"
              value={deviceInfo.androidVersion}
              accent="#4ade80"
              textColor={colors.foreground}
              subColor={colors.mutedForeground}
              loaded={deviceInfo.loaded}
            />
            <InfoItem
              icon="memory"
              label="الذاكرة الكلية"
              value={deviceInfo.totalRam}
              accent="#a855f7"
              textColor={colors.foreground}
              subColor={colors.mutedForeground}
              loaded={deviceInfo.loaded}
            />
            <InfoItem
              icon={deviceInfo.isCharging ? "battery-charging" : "battery-80"}
              label="البطارية"
              value={
                deviceInfo.batteryLevel !== null
                  ? `${deviceInfo.batteryLevel}%${deviceInfo.isCharging ? " ⚡" : ""}`
                  : Platform.OS === "web"
                  ? "— (تصفح ويب)"
                  : "غير متاح"
              }
              accent={batteryColor(deviceInfo.batteryLevel)}
              textColor={colors.foreground}
              subColor={colors.mutedForeground}
              loaded={deviceInfo.loaded}
            />
          </View>
        </View>

        {/* Tools Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الأدوات</Text>

        <View style={styles.toolsGrid}>
          {TOOLS.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              cardBg={colors.card}
              cardBorder={colors.border}
              labelColor={colors.foreground}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                showToast(tool.toastMsg, tool.color);
              }}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Mainalasri Pro • الإصدار 1.0.0
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
            جميع الحقوق محفوظة © 2025
          </Text>
        </View>
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} color={toastColor} />
    </View>
  );
}

/* ─── InfoItem ─────────────────────────────────── */
function InfoItem({
  icon,
  label,
  value,
  accent,
  textColor,
  subColor,
  loaded,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  accent: string;
  textColor: string;
  subColor: string;
  loaded: boolean;
}) {
  return (
    <View style={infoItemStyles.container}>
      <View style={[infoItemStyles.iconWrap, { backgroundColor: accent + "22" }]}>
        <MaterialCommunityIcons name={icon} size={22} color={accent} />
      </View>
      <Text style={[infoItemStyles.label, { color: subColor }]}>{label}</Text>
      <Text
        style={[infoItemStyles.value, { color: loaded ? textColor : subColor }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const infoItemStyles = StyleSheet.create({
  container: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
    textAlign: "center",
  },
  value: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});

/* ─── ToolCard ─────────────────────────────────── */
function ToolCard({
  tool,
  cardBg,
  cardBorder,
  labelColor,
  onPress,
}: {
  tool: Tool;
  cardBg: string;
  cardBorder: string;
  labelColor: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: native, speed: 50 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: native, speed: 20 }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={toolCardStyles.pressable}
    >
      <Animated.View
        style={[
          toolCardStyles.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[toolCardStyles.iconCircle, { backgroundColor: tool.color + "22" }]}>
          <MaterialCommunityIcons name={tool.icon} size={32} color={tool.color} />
        </View>
        <Text style={[toolCardStyles.label, { color: labelColor }]}>{tool.labelAr}</Text>
        <View style={[toolCardStyles.pill, { backgroundColor: tool.color + "33" }]}>
          <MaterialCommunityIcons name="chevron-left" size={14} color={tool.color} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const toolCardStyles = StyleSheet.create({
  pressable: {
    width: "47%",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  pill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});

/* ─── Page Styles ──────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 22,
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  appTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  appSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 3,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 26,
  },
  infoCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  infoCardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 14,
  },
  toolsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 36,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  footerSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
