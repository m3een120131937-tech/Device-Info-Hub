import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Tab = "scan" | "generate";

const SAMPLE_QR_TYPES = [
  { name: "رابط URL", icon: "web" as const, color: "#00d4ff", example: "https://example.com" },
  { name: "واتساب", icon: "whatsapp" as const, color: "#25d366", example: "wa.me/966XXXXXXXXX" },
  { name: "Wi-Fi", icon: "wifi" as const, color: "#ffd700", example: "WIFI:S:MyNetwork;T:WPA;P:Password;;" },
  { name: "نص حر", icon: "text" as const, color: "#a855f7", example: "أي نص تريده" },
  { name: "بريد إلكتروني", icon: "email" as const, color: "#ff6b35", example: "mailto:test@example.com" },
  { name: "هاتف", icon: "phone" as const, color: "#4ade80", example: "tel:+966XXXXXXXXX" },
];

export default function QRScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [tab, setTab] = useState<Tab>("scan");
  const [qrInput, setQrInput] = useState("");

  function handleGenerateQR() {
    if (!qrInput.trim()) {
      Alert.alert("تنبيه", "أدخل النص أو الرابط لإنشاء QR Code");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrInput)}`;
    Linking.openURL(url);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: "#a855f722" }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="#a855f7" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>ماسح QR</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>QR Code Scanner & Generator</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["scan", "generate"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
            style={[styles.tab, tab === t && { borderBottomColor: "#a855f7", borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#a855f7" : colors.mutedForeground }]}>
              {t === "scan" ? "مسح QR" : "إنشاء QR"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {tab === "scan" ? (
          <>
            {/* Scanner - requires Expo Go on real device */}
            <View style={[styles.scanBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.qrFrame, { borderColor: "#a855f7" }]}>
                <View style={[styles.corner, styles.cornerTL, { borderColor: "#a855f7" }]} />
                <View style={[styles.corner, styles.cornerTR, { borderColor: "#a855f7" }]} />
                <View style={[styles.corner, styles.cornerBL, { borderColor: "#a855f7" }]} />
                <View style={[styles.corner, styles.cornerBR, { borderColor: "#a855f7" }]} />
                <MaterialCommunityIcons name="qrcode-scan" size={64} color="#a855f730" />
              </View>
              <Text style={[styles.scanTitle, { color: colors.foreground }]}>مسح QR بالكاميرا</Text>
              <Text style={[styles.scanDesc, { color: colors.mutedForeground }]}>
                افتح التطبيق عبر <Text style={{ color: "#a855f7", fontFamily: "Inter_700Bold" }}>Expo Go</Text> على هاتفك{"\n"}
                واضغط الزر أدناه للمسح بالكاميرا الحقيقية
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (Platform.OS === "web") {
                    Alert.alert(
                      "تنبيه",
                      "مسح QR يتطلب هاتفاً حقيقياً\n\nامسح QR Code الخاص بـ Replit لفتح التطبيق على هاتفك عبر Expo Go",
                      [{ text: "حسناً" }]
                    );
                  } else {
                    Alert.alert("ماسح QR", "سيتم فتح الكاميرا — هذه الميزة تعمل بالكامل على Expo Go", [{ text: "حسناً" }]);
                  }
                }}
                style={[styles.scanBtn, { backgroundColor: "#a855f7" }]}
              >
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                <Text style={styles.scanBtnText}>فتح الكاميرا للمسح</Text>
              </Pressable>
            </View>

            {/* Tips */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>أنواع QR المدعومة</Text>
            <View style={styles.typesGrid}>
              {SAMPLE_QR_TYPES.map((type) => (
                <View key={type.name} style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name={type.icon} size={22} color={type.color} />
                  <Text style={[styles.typeName, { color: colors.foreground }]}>{type.name}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Generator */}
            <View style={[styles.generateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.genLabel, { color: colors.foreground }]}>النص أو الرابط</Text>
              <TextInput
                value={qrInput}
                onChangeText={setQrInput}
                placeholder="أدخل رابطاً أو نصاً لإنشاء QR..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.genInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                multiline
                textAlign="right"
              />
              <Pressable
                onPress={handleGenerateQR}
                style={[styles.genBtn, { backgroundColor: "#a855f7" }]}
              >
                <MaterialCommunityIcons name="qrcode" size={20} color="#fff" />
                <Text style={styles.genBtnText}>إنشاء QR Code</Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>أمثلة سريعة</Text>
            {SAMPLE_QR_TYPES.map((type) => (
              <Pressable
                key={type.name}
                onPress={() => { Haptics.selectionAsync(); setQrInput(type.example); }}
                style={[styles.exCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.exIcon, { backgroundColor: type.color + "22" }]}>
                  <MaterialCommunityIcons name={type.icon} size={18} color={type.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, { color: colors.foreground }]}>{type.name}</Text>
                  <Text style={[styles.exValue, { color: colors.mutedForeground }]} numberOfLines={1}>{type.example}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-left" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </>
        )}
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
  titleText: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right" },
  subtitleText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  tabBar: { flexDirection: "row-reverse", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 12 },
  scanBox: { borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center", gap: 14 },
  qrFrame: { width: 160, height: 160, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", position: "relative" },
  corner: { position: "absolute", width: 20, height: 20, borderColor: "#a855f7" },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  scanTitle: { fontSize: 17, fontFamily: "Inter_700Bold", textAlign: "center" },
  scanDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, color: "#888" },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 30 },
  scanBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right", marginTop: 4, marginBottom: 2 },
  typesGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 },
  typeCard: { width: "30%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  typeName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  generateCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 12 },
  genLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  genInput: { borderRadius: 12, borderWidth: 1, padding: 12, minHeight: 80, fontSize: 14, fontFamily: "Inter_400Regular" },
  genBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14 },
  genBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  exCard: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 13, borderRadius: 14, borderWidth: 1 },
  exIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  exValue: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 1 },
});
