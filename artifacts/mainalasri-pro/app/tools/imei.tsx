import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface DeviceData {
  model: string;
  brand: string;
  manufacturer: string;
  osVersion: string;
  sdkVersion: string;
  deviceType: string;
  isDevice: boolean;
  totalRam: string;
}

const USSD_CODES = [
  { code: "*#06#", desc: "عرض رقم IMEI (مدعوم على معظم الهواتف)", color: "#00d4ff" },
  { code: "*#*#4636#*#*", desc: "معلومات الهاتف والبطارية والإحصاءات", color: "#4ade80" },
  { code: "*#*#7780#*#*", desc: "إعادة ضبط المصنع (جزئي)", color: "#ffd700" },
  { code: "*#0*#", desc: "قائمة اختبار الجهاز (Samsung)", color: "#a855f7" },
  { code: "*#*#2664#*#*", desc: "اختبار شاشة اللمس", color: "#ff6b35" },
  { code: "*#*#1234#*#*", desc: "معلومات PDA و Firmware", color: "#00d4ff" },
];

export default function IMEIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [device, setDevice] = useState<DeviceData | null>(null);

  useEffect(() => {
    const typeMap: Record<number, string> = {
      1: "هاتف", 2: "تابلت", 3: "ساعة ذكية",
      4: "تلفاز ذكي", 5: "سطح المكتب", 6: "مدمج", 7: "محطة عمل",
    };

    let model = "غير معروف", brand = "غير معروف", manufacturer = "غير معروف";
    let osVersion = "غير متاح", sdkVersion = "--", deviceType = "غير معروف";
    let isDevice = false, totalRam = "غير متاح";

    if (Platform.OS !== "web") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Device = require("expo-device");
        model = Device.modelName ?? Device.deviceName ?? "غير معروف";
        brand = Device.brand ?? "غير معروف";
        manufacturer = Device.manufacturer ?? "غير معروف";
        osVersion = `Android ${Device.osVersion ?? "--"}`;
        sdkVersion = `SDK ${Device.platformApiLevel ?? "--"}`;
        deviceType = typeMap[Device.deviceType ?? 0] ?? "غير معروف";
        isDevice = Device.isDevice;
        if (Device.totalMemory) {
          totalRam = `${(Device.totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB`;
        }
      } catch { /* ignore */ }
    }

    setDevice({ model, brand, manufacturer, osVersion, sdkVersion, deviceType, isDevice, totalRam });
  }, []);

  const rows = device
    ? [
        { label: "الموديل", value: device.model, icon: "cellphone" as const, color: "#00d4ff" },
        { label: "الشركة المصنّعة", value: device.manufacturer, icon: "factory" as const, color: "#4ade80" },
        { label: "العلامة التجارية", value: device.brand, icon: "tag" as const, color: "#ffd700" },
        { label: "نظام التشغيل", value: device.osVersion, icon: "android" as const, color: "#a855f7" },
        { label: "إصدار SDK", value: device.sdkVersion, icon: "code-braces" as const, color: "#ff6b35" },
        { label: "نوع الجهاز", value: device.deviceType, icon: "devices" as const, color: "#00d4ff" },
        { label: "الذاكرة الكلية", value: device.totalRam, icon: "memory" as const, color: "#4ade80" },
        { label: "جهاز حقيقي", value: device.isDevice ? "نعم ✓" : "محاكي", icon: "check-circle" as const, color: device.isDevice ? "#4ade80" : "#ff6b35" },
      ]
    : [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: "#00d4ff22" }]}>
            <MaterialCommunityIcons name="sim" size={22} color="#00d4ff" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات IMEI</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>Device & IMEI Information</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {/* IMEI note */}
        <View style={[styles.imeiBox, { backgroundColor: "#00d4ff15", borderColor: "#00d4ff40" }]}>
          <MaterialCommunityIcons name="information" size={18} color="#00d4ff" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.imeiTitle, { color: "#00d4ff" }]}>للحصول على IMEI</Text>
            <Text style={[styles.imeiDesc, { color: colors.mutedForeground }]}>
              اتصل بـ <Text style={{ fontWeight: "bold", color: "#00d4ff" }}>*#06#</Text> من تطبيق الهاتف أو انظر في الإعدادات ← حول الهاتف
            </Text>
          </View>
        </View>

        {/* Device info */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>معلومات الجهاز الحالي</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {rows.map((row, i) => (
            <View key={row.label} style={[styles.infoRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value}</Text>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name={row.icon} size={14} color={row.color} />
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* USSD Codes */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>أكواد USSD المفيدة</Text>
        {USSD_CODES.map((item) => (
          <Pressable
            key={item.code}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert("الكود", `اضغط طلب اتصال بعد كتابة:\n${item.code}`, [{ text: "حسناً" }]);
            }}
            style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.codeRow}>
              <Text style={[styles.codeText, { color: item.color }]}>{item.code}</Text>
              <Text style={[styles.codeDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-left" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flexDirection: "row-reverse", alignItems: "center", gap: 10, flex: 1 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  titleText: { fontSize: 18, fontWeight: "bold", textAlign: "right" },
  subtitleText: { fontSize: 12, textAlign: "right" },
  scroll: { padding: 16, gap: 10 },
  imeiBox: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  imeiTitle: { fontSize: 14, fontWeight: "bold", textAlign: "right" },
  imeiDesc: { fontSize: 13, textAlign: "right", marginTop: 2, lineHeight: 20 },
  sectionLabel: { fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 8, marginBottom: 4 },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  infoLabelRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 14, fontWeight: "600", textAlign: "left" },
  codeCard: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 14, borderWidth: 1 },
  codeRow: { flex: 1, gap: 3 },
  codeText: { fontSize: 16, fontWeight: "bold", textAlign: "right" },
  codeDesc: { fontSize: 12, textAlign: "right" },
});
