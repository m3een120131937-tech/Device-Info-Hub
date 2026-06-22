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

const STEPS = [
  {
    step: "1",
    title: "إعادة ضبط المصنع",
    desc: "من إعدادات الجهاز → الإدارة العامة → إعادة الضبط → إعادة ضبط بيانات المصنع",
    icon: "restore" as const,
    color: "#ff6b35",
  },
  {
    step: "2",
    title: "تجاوز عبر Recovery",
    desc: "أدخل وضع Recovery (Power + Vol Down) → Wipe Data → Factory Reset",
    icon: "android" as const,
    color: "#ffd700",
  },
  {
    step: "3",
    title: "إزالة حساب Google",
    desc: "الإعدادات → الحسابات → Google → احذف الحساب قبل إعادة الضبط",
    icon: "google" as const,
    color: "#4ade80",
  },
  {
    step: "4",
    title: "FRP عبر OTG",
    desc: "استخدم كابل OTG مع USB للوصول لأدوات ADB وتجاوز قفل FRP",
    icon: "usb" as const,
    color: "#00d4ff",
  },
  {
    step: "5",
    title: "أداة Odin (Samsung)",
    desc: "لأجهزة Samsung: استخدم Odin لفلاش firmware جديد يُزيل FRP",
    icon: "database" as const,
    color: "#a855f7",
  },
];

const TIPS = [
  "تأكد من شحن البطارية > 50% قبل البدء",
  "احتفظ بنسخة احتياطية من بياناتك",
  "هذه الأدوات للاستخدام الشخصي فقط على أجهزتك",
];

export default function FRPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + webTop + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => { Haptics.selectionAsync(); router.back(); }}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: "#ff6b3522" }]}>
            <MaterialCommunityIcons name="shield-lock" size={22} color="#ff6b35" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات FRP</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>Factory Reset Protection</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {/* Warning Card */}
        <View style={[styles.warnCard, { backgroundColor: "#ff6b3515", borderColor: "#ff6b3540" }]}>
          <MaterialCommunityIcons name="alert-circle" size={18} color="#ff6b35" />
          <Text style={[styles.warnText, { color: "#ff6b35" }]}>
            هذه الأدوات للاستخدام على أجهزتك الخاصة فقط
          </Text>
        </View>

        {/* Steps */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>خطوات تجاوز FRP</Text>
        {STEPS.map((item) => (
          <Pressable
            key={item.step}
            onPress={() => {
              Haptics.selectionAsync();
              setExpanded(expanded === item.step ? null : item.step);
            }}
            style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: item.color + "22" }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>{item.title}</Text>
                {expanded === item.step && (
                  <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                )}
              </View>
              <MaterialCommunityIcons
                name={expanded === item.step ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.mutedForeground}
              />
            </View>
          </Pressable>
        ))}

        {/* Tips */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>نصائح مهمة</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={[styles.tipRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4ade80" />
            <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flexDirection: "row-reverse", alignItems: "center", gap: 10, flex: 1 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  titleText: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right" },
  subtitleText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  scroll: { padding: 16, gap: 10 },
  warnCard: {
    flexDirection: "row-reverse", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6,
  },
  warnText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right", marginTop: 8, marginBottom: 4, textTransform: "uppercase" },
  stepCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  stepRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  stepBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  stepDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 6, lineHeight: 20 },
  tipRow: {
    flexDirection: "row-reverse", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
});
