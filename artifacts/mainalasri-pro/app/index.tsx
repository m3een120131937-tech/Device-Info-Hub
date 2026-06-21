import * as Battery from "expo-battery";
import * as Device from "expo-device";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  I18nManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

I18nManager.forceRTL(true);

interface DeviceInfo {
  model: string;
  androidVersion: string;
  totalRam: string;
  batteryLevel: number | null;
  isCharging: boolean;
}

interface Tool {
  id: string;
  labelAr: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  description: string;
}

const TOOLS: Tool[] = [
  {
    id: "frp",
    labelAr: "أدوات FRP",
    icon: "shield-lock",
    color: "#ff6b35",
    description: "جارٍ فتح أدوات FRP...",
  },
  {
    id: "flash",
    labelAr: "أدوات الفلاش",
    icon: "flash",
    color: "#ffd700",
    description: "جارٍ فتح أدوات الفلاش...",
  },
  {
    id: "imei",
    labelAr: "أدوات IMEI",
    icon: "sim",
    color: "#00d4ff",
    description: "جارٍ فتح أدوات IMEI...",
  },
  {
    id: "network",
    labelAr: "أدوات الشبكة",
    icon: "wifi",
    color: "#4ade80",
    description: "جارٍ فتح أدوات الشبكة...",
  },
  {
    id: "qr",
    labelAr: "ماسح QR",
    icon: "qrcode-scan",
    color: "#a855f7",
    description: "جارٍ فتح ماسح QR...",
  },
];

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
}

function PulsingDot({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.4, { duration: 800 }), -1, true);
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[animStyle, { width: 8, height: 8, borderRadius: 4, backgroundColor: color }]}
    />
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    model: "جارٍ التحميل...",
    androidVersion: "--",
    totalRam: "--",
    batteryLevel: null,
    isCharging: false,
  });

  useEffect(() => {
    async function loadInfo() {
      const model = Device.modelName ?? Device.deviceName ?? "غير معروف";
      const androidVersion = `Android ${Device.osVersion ?? "--"}`;
      const totalRamBytes = Device.totalMemory;
      const totalRam = totalRamBytes
        ? `${(totalRamBytes / 1024 / 1024 / 1024).toFixed(1)} GB`
        : "غير متاح";

      let batteryLevel: number | null = null;
      let isCharging = false;

      if (Platform.OS !== "web") {
        try {
          const level = await Battery.getBatteryLevelAsync();
          batteryLevel = Math.round(level * 100);
          const state = await Battery.getBatteryStateAsync();
          isCharging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
        } catch {
          batteryLevel = null;
        }
      }

      setDeviceInfo({ model, androidVersion, totalRam, batteryLevel, isCharging });
    }

    loadInfo();
  }, []);

  function batteryColor(level: number | null): string {
    if (level === null) return colors.mutedForeground;
    if (level > 50) return "#4ade80";
    if (level > 20) return "#ffd700";
    return "#ef4444";
  }

  const styles = makeStyles(colors, insets);

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.appTitle}>Mainalasri Pro</Text>
              <Text style={styles.appSubtitle}>مجموعة أدوات الهاتف الاحترافية</Text>
            </View>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="shield-check" size={28} color={colors.primary} />
            </View>
          </View>
        </Animated.View>

        {/* Device Info Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <MaterialCommunityIcons name="cellphone-information" size={18} color={colors.primary} />
            <Text style={styles.infoCardTitle}>معلومات الجهاز</Text>
            <PulsingDot color={colors.primary} />
          </View>

          <View style={styles.infoGrid}>
            <InfoItem
              icon="cellphone"
              label="الموديل"
              value={deviceInfo.model}
              color="#00d4ff"
              colors={colors}
            />
            <InfoItem
              icon="android"
              label="نظام التشغيل"
              value={deviceInfo.androidVersion}
              color="#4ade80"
              colors={colors}
            />
            <InfoItem
              icon="memory"
              label="الذاكرة الكلية"
              value={deviceInfo.totalRam}
              color="#a855f7"
              colors={colors}
            />
            <InfoItem
              icon={deviceInfo.isCharging ? "battery-charging" : "battery"}
              label="البطارية"
              value={
                deviceInfo.batteryLevel !== null
                  ? `${deviceInfo.batteryLevel}%${deviceInfo.isCharging ? " ⚡" : ""}`
                  : "غير متاح"
              }
              color={batteryColor(deviceInfo.batteryLevel)}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Tools Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>الأدوات</Text>
        </Animated.View>

        <View style={styles.toolsGrid}>
          {TOOLS.map((tool, index) => (
            <Animated.View
              key={tool.id}
              entering={FadeInDown.delay(250 + index * 60).duration(400)}
              style={styles.toolCardWrapper}
            >
              <ToolCard tool={tool} colors={colors} />
            </Animated.View>
          ))}
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.footer}>
          <Text style={styles.footerText}>Mainalasri Pro v1.0.0</Text>
          <Text style={styles.footerSub}>جميع الحقوق محفوظة</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
  color,
  colors,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={infoItemStyles.container}>
      <View style={[infoItemStyles.iconWrap, { backgroundColor: color + "22" }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={[infoItemStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text
        style={[infoItemStyles.value, { color: colors.foreground }]}
        numberOfLines={1}
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
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
    writingDirection: "rtl",
  },
  value: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    writingDirection: "rtl",
  },
});

function ToolCard({
  tool,
  colors,
}: {
  tool: Tool;
  colors: ReturnType<typeof useColors>;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withTiming(0.94, { duration: 80 }, () => {
      scale.value = withTiming(1, { duration: 120 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast(tool.description);
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View
        style={[
          toolCardStyles.card,
          animStyle,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[toolCardStyles.iconCircle, { backgroundColor: tool.color + "22" }]}>
          <MaterialCommunityIcons name={tool.icon} size={32} color={tool.color} />
        </View>
        <Text style={[toolCardStyles.label, { color: colors.foreground }]}>{tool.labelAr}</Text>
        <View style={[toolCardStyles.arrow, { backgroundColor: tool.color + "33" }]}>
          <MaterialCommunityIcons name="chevron-left" size={14} color={tool.color} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const toolCardStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    writingDirection: "rtl",
  },
  arrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

function makeStyles(
  colors: ReturnType<typeof useColors>,
  insets: { top: number; bottom: number; left: number; right: number }
) {
  const webTop = Platform.OS === "web" ? 67 : 0;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingTop: insets.top + 16 + webTop,
      paddingBottom: insets.bottom + 32 + webBottom,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 20,
    },
    headerRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary + "22",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "44",
    },
    appTitle: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
    },
    appSubtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      marginTop: 2,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 24,
    },
    infoCardHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoCardTitle: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
    },
    infoGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
      marginBottom: 14,
    },
    toolsGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 32,
    },
    toolCardWrapper: {
      width: "47%",
    },
    footer: {
      alignItems: "center",
      paddingTop: 8,
    },
    footerText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    footerSub: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
      textAlign: "center",
      writingDirection: "rtl",
    },
  });
}
