import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const TOOLS = [
  { name: "Odin", brand: "Samsung", icon: "cellphone-arrow-down" as const, color: "#00d4ff", desc: "أداة رسمية لفلاش firmware على أجهزة Samsung عبر Windows" },
  { name: "SP Flash Tool", brand: "MediaTek", icon: "flash" as const, color: "#ffd700", desc: "فلاش أجهزة MediaTek — تدعم scatter files و firmware كامل" },
  { name: "Fastboot / ADB", brand: "جميع الأجهزة", icon: "console" as const, color: "#4ade80", desc: "أدوات Android SDK لفلاش عبر USB من سطر الأوامر" },
  { name: "QFIL / QPST", brand: "Qualcomm", icon: "chip" as const, color: "#a855f7", desc: "أدوات Qualcomm لفلاش firmware على مستوى EDL/9008" },
  { name: "MiFlash", brand: "Xiaomi", icon: "cellphone-link" as const, color: "#ff6b35", desc: "أداة Xiaomi الرسمية لفلاش MIUI عبر وضع Fastboot" },
];

const MODES = [
  { name: "Fastboot Mode", combo: "Power + Vol Down", icon: "lightning-bolt" as const, color: "#ffd700" },
  { name: "Recovery Mode", combo: "Power + Vol Up", icon: "restore" as const, color: "#4ade80" },
  { name: "Download Mode", combo: "Power + Vol Down + Home", icon: "download" as const, color: "#00d4ff" },
  { name: "EDL Mode (9008)", combo: "كابل خاص أو مفاتيح خاصة", icon: "chip" as const, color: "#a855f7" },
];

export default function FlashScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + webTop + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: "#ffd70022" }]}>
            <MaterialCommunityIcons name="flash" size={22} color="#ffd700" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات الفلاش</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>Flash & Firmware Tools</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>أدوات الفلاش حسب الشركة</Text>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.name}
            onPress={() => { Haptics.selectionAsync(); setSelectedTool(selectedTool === tool.name ? null : tool.name); }}
            style={[styles.card, { backgroundColor: colors.card, borderColor: selectedTool === tool.name ? tool.color : colors.border }]}
          >
            <View style={styles.cardRow}>
              <View style={[styles.cardIcon, { backgroundColor: tool.color + "22" }]}>
                <MaterialCommunityIcons name={tool.icon} size={22} color={tool.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardName, { color: colors.foreground }]}>{tool.name}</Text>
                <Text style={[styles.cardBrand, { color: tool.color }]}>{tool.brand}</Text>
              </View>
              <MaterialCommunityIcons
                name={selectedTool === tool.name ? "chevron-up" : "chevron-down"}
                size={18} color={colors.mutedForeground}
              />
            </View>
            {selectedTool === tool.name && (
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{tool.desc}</Text>
            )}
          </Pressable>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>أوضاع الدخول (Boot Modes)</Text>
        <View style={styles.modesGrid}>
          {MODES.map((mode) => (
            <View key={mode.name} style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name={mode.icon} size={24} color={mode.color} />
              <Text style={[styles.modeName, { color: colors.foreground }]}>{mode.name}</Text>
              <Text style={[styles.modeCombo, { color: colors.mutedForeground }]}>{mode.combo}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.warnCard, { backgroundColor: "#ff6b3515", borderColor: "#ff6b3540" }]}>
          <MaterialCommunityIcons name="alert" size={18} color="#ff6b35" />
          <Text style={[styles.warnText, { color: "#ff6b35" }]}>الفلاش الخاطئ قد يُبطل ضمان الجهاز أو يُتلفه — تأكد من الـ firmware الصحيح</Text>
        </View>
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
  sectionLabel: { fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 8, marginBottom: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  cardRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  cardIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  cardName: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  cardBrand: { fontSize: 12, fontWeight: "500", textAlign: "right" },
  cardDesc: { fontSize: 13, textAlign: "right", lineHeight: 20 },
  modesGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 },
  modeCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  modeName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  modeCombo: { fontSize: 11, textAlign: "center" },
  warnCard: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 6 },
  warnText: { flex: 1, fontSize: 13, fontWeight: "500", textAlign: "right", lineHeight: 19 },
});
