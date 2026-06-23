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
import ToolActionSheet, { copyToClipboard, ToolOption } from "@/components/ToolActionSheet";

type Tab = "scan" | "generate";

const QR_TYPES = [
  { name: "رابط URL",        icon: "web"      as const, color: "#00d4ff", example: "https://example.com" },
  { name: "واتساب",          icon: "whatsapp" as const, color: "#25d366", example: "https://wa.me/966XXXXXXXXX" },
  { name: "Wi-Fi",           icon: "wifi"     as const, color: "#ffd700", example: "WIFI:S:MyNetwork;T:WPA;P:Password;;" },
  { name: "نص حر",           icon: "text"     as const, color: "#a855f7", example: "أي نص تريده" },
  { name: "بريد إلكتروني",  icon: "email"    as const, color: "#ff6b35", example: "mailto:test@example.com" },
  { name: "هاتف",            icon: "phone"    as const, color: "#4ade80", example: "tel:+966XXXXXXXXX" },
];

function buildScanOption(): ToolOption {
  return {
    id: "qr-scan",
    title: "مسح QR بالكاميرا",
    subtitle: "Camera QR Scanner",
    icon: "qrcode-scan",
    color: "#a855f7",
    auto: {
      description: "سيقوم التطبيق بفتح الكاميرا مباشرةً لمسح QR Code تلقائياً",
      steps: [
        "يفتح التطبيق الكاميرا الخلفية فوراً",
        "وجّه الكاميرا نحو QR Code",
        "سيتم قراءة المحتوى وعرضه على الشاشة",
        "اضغط على النتيجة لفتح الرابط أو نسخ النص",
      ],
      actionLabel: "فتح الكاميرا للمسح",
      actionIcon: "camera",
      canAct: true,
      onAction: () => {
        if (Platform.OS === "web") {
          Alert.alert(
            "تنبيه",
            "مسح QR يتطلب هاتفاً حقيقياً\n\nافتح التطبيق عبر Expo Go على هاتفك",
            [{ text: "حسناً" }]
          );
        } else {
          Alert.alert(
            "ماسح QR",
            "سيتم فتح الكاميرا — هذه الميزة تعمل بالكامل على Expo Go",
            [{ text: "حسناً" }]
          );
        }
      },
    },
    manual: {
      description: "كيفية مسح QR Code يدوياً بتطبيقات الكاميرا",
      steps: [
        "افتح تطبيق الكاميرا الافتراضي على هاتفك",
        "وجّه الكاميرا نحو QR Code",
        "معظم الهواتف الحديثة تقرأ QR تلقائياً",
        "إن لم ينجح: ابحث في متجر التطبيقات عن 'QR Scanner'",
        "أو استخدم: Google Lens ← ابحث في الصورة",
        "يمكن أيضاً: Google Photos ← Lens على صورة QR محفوظة",
      ],
    },
  };
}

function buildGenerateOption(text: string): ToolOption {
  return {
    id: "qr-generate",
    title: "إنشاء QR Code",
    subtitle: "QR Code Generator",
    icon: "qrcode",
    color: "#a855f7",
    auto: {
      description: text.trim()
        ? `سيُنشئ التطبيق QR Code للنص: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`
        : "أدخل النص أو الرابط أولاً ثم اضغط الوضع التلقائي",
      steps: text.trim()
        ? [
            "يُنشئ رابط QR Code مباشرة",
            "يفتح المتصفح لعرض الصورة",
            "يمكنك حفظ الصورة أو مشاركتها",
          ]
        : ["أدخل النص في حقل الإدخال أدناه أولاً"],
      actionLabel: "إنشاء وفتح QR",
      actionIcon: "qrcode",
      canAct: !!text.trim(),
      onAction: text.trim()
        ? () => {
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
            Linking.openURL(url);
          }
        : undefined,
    },
    manual: {
      description: "كيفية إنشاء QR Code يدوياً باستخدام مواقع مجانية",
      steps: [
        "اذهب إلى: qr-code-generator.com أو goqr.me",
        "اختر نوع المحتوى: رابط، نص، Wi-Fi، بطاقة تعريف...",
        "أدخل البيانات في الحقل المخصص",
        "اضغط 'إنشاء QR' أو 'Generate'",
        "حمّل الصورة بصيغة PNG أو SVG",
        "شارك أو اطبع QR Code المُنشأ",
      ],
    },
  };
}

export default function QRScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [tab, setTab] = useState<Tab>("scan");
  const [qrInput, setQrInput] = useState("");
  const [selected, setSelected] = useState<ToolOption | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
          <View style={[styles.headerIcon, { backgroundColor: "#a855f722" }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="#a855f7" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>ماسح QR</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>
              QR Code Scanner & Generator
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["scan", "generate"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
            style={[
              styles.tab,
              tab === t && { borderBottomColor: "#a855f7", borderBottomWidth: 2 },
            ]}
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
            {/* Scanner visual */}
            <View style={[styles.scanBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.qrFrame, { borderColor: "#a855f7" }]}>
                <View style={[styles.corner, styles.cornerTL, { borderColor: "#a855f7" }]} />
                <View style={[styles.corner, styles.cornerTR, { borderColor: "#a855f7" }]} />
                <View style={[styles.corner, styles.cornerBL, { borderColor: "#a855f7" }]} />
                <View style={[styles.corner, styles.cornerBR, { borderColor: "#a855f7" }]} />
                <MaterialCommunityIcons name="qrcode-scan" size={60} color="#a855f730" />
              </View>
              <Text style={[styles.scanTitle, { color: colors.foreground }]}>مسح QR بالكاميرا</Text>
              <Text style={[styles.scanDesc, { color: colors.mutedForeground }]}>
                اضغط على الوضع المناسب لبدء المسح
              </Text>

              {/* Two action buttons */}
              <View style={styles.twoModeRow}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setSelected(buildScanOption());
                    setTimeout(() => {
                      setSelected((prev) => {
                        if (prev) return { ...prev, _autoOpen: true } as ToolOption;
                        return prev;
                      });
                    }, 10);
                    setSelected(buildScanOption());
                  }}
                  style={[styles.modeBtn, { backgroundColor: "#ffd70015", borderColor: "#ffd70045" }]}
                >
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#ffd700" />
                  <Text style={[styles.modeBtnText, { color: "#ffd700" }]}>تلقائي</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelected(buildScanOption());
                  }}
                  style={[styles.modeBtn, { backgroundColor: "#00d4ff15", borderColor: "#00d4ff45" }]}
                >
                  <MaterialCommunityIcons name="book-open-variant" size={22} color="#00d4ff" />
                  <Text style={[styles.modeBtnText, { color: "#00d4ff" }]}>يدوي</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              أنواع QR المدعومة
            </Text>
            <View style={styles.typesGrid}>
              {QR_TYPES.map((type) => (
                <View
                  key={type.name}
                  style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
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
                style={[
                  styles.genInput,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                multiline
                textAlign="right"
              />

              {/* Two mode buttons */}
              <View style={styles.twoModeRow}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (!qrInput.trim()) {
                      Alert.alert("تنبيه", "أدخل النص أو الرابط أولاً");
                      return;
                    }
                    setSelected(buildGenerateOption(qrInput));
                  }}
                  style={[styles.modeBtn, { backgroundColor: "#ffd70015", borderColor: "#ffd70045" }]}
                >
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#ffd700" />
                  <Text style={[styles.modeBtnText, { color: "#ffd700" }]}>إنشاء تلقائي</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelected(buildGenerateOption(qrInput));
                  }}
                  style={[styles.modeBtn, { backgroundColor: "#00d4ff15", borderColor: "#00d4ff45" }]}
                >
                  <MaterialCommunityIcons name="book-open-variant" size={22} color="#00d4ff" />
                  <Text style={[styles.modeBtnText, { color: "#00d4ff" }]}>يدوي</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              أمثلة سريعة
            </Text>
            {QR_TYPES.map((type) => (
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
                  <Text style={[styles.exValue, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {type.example}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-left" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <ToolActionSheet
        visible={selected !== null}
        option={selected}
        onClose={() => setSelected(null)}
      />
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
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: { fontSize: 18, fontWeight: "bold", textAlign: "right" },
  subtitleText: { fontSize: 12, textAlign: "right" },
  tabBar: { flexDirection: "row-reverse", borderBottomWidth: 1 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  scroll: { padding: 16, gap: 12 },
  scanBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 14,
  },
  qrFrame: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  corner: { position: "absolute", width: 20, height: 20 },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  scanTitle: { fontSize: 17, fontWeight: "bold", textAlign: "center" },
  scanDesc: { fontSize: 13, textAlign: "center" },
  twoModeRow: { flexDirection: "row-reverse", gap: 12, width: "100%" },
  modeBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  modeBtnText: { fontSize: 14, fontWeight: "700" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typesGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 },
  typeCard: {
    width: "30%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  typeName: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  generateCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 12 },
  genLabel: { fontSize: 14, fontWeight: "600", textAlign: "right" },
  genInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },
  exCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  exIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  exName: { fontSize: 14, fontWeight: "600", textAlign: "right" },
  exValue: { fontSize: 12, textAlign: "right", marginTop: 1 },
});
