import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import ToolActionSheet, { copyToClipboard, ToolOption } from "@/components/ToolActionSheet";

const OPTIONS: ToolOption[] = [
  {
    id: "factory-reset",
    title: "إعادة ضبط المصنع",
    subtitle: "Factory Reset",
    icon: "restore",
    color: "#ff6b35",
    warning: "سيُحذف جميع بيانات الجهاز نهائياً",
    auto: {
      description: "سيفتح التطبيق صفحة الإعدادات مباشرةً للوصول لخيار إعادة الضبط",
      steps: [
        "يفتح التطبيق إعدادات الجهاز تلقائياً",
        "توجّه إلى: الإدارة العامة أو النظام",
        "اضغط على 'إعادة الضبط'",
        "اختر 'إعادة ضبط بيانات المصنع'",
        "اضغط 'إعادة الضبط' للتأكيد",
      ],
      actionLabel: "فتح الإعدادات تلقائياً",
      actionIcon: "cog",
      canAct: true,
      onAction: () => Linking.openURL("https://support.google.com/android/answer/6088915"),
    },
    manual: {
      description: "اتبع هذه الخطوات بنفسك من إعدادات الجهاز",
      steps: [
        "افتح تطبيق الإعدادات ⚙️",
        "انتقل إلى 'الإدارة العامة' أو 'النظام'",
        "اضغط على 'إعادة الضبط'",
        "اختر 'إعادة ضبط بيانات المصنع'",
        "اقرأ التحذيرات ثم اضغط 'إعادة الضبط'",
        "أدخل رمز PIN إن طُلب منك",
        "انتظر اكتمال عملية الضبط (~5 دقائق)",
      ],
    },
  },
  {
    id: "recovery-bypass",
    title: "تجاوز عبر Recovery",
    subtitle: "Recovery Mode Bypass",
    icon: "android",
    color: "#ffd700",
    warning: "تأكد من شحن البطارية > 50% قبل البدء",
    auto: {
      description: "سيعرض التطبيق دليلاً مرئياً بتسلسل الأزرار خطوة بخطوة",
      steps: [
        "أطفئ الجهاز تماماً واضغط زر الطاقة 10 ثوانٍ",
        "بعد الإطفاء: اضغط Power + Volume Down معاً",
        "انتظر ظهور شاشة Recovery (عادة 5-10 ثوانٍ)",
        "استخدم أزرار الصوت للتنقل — اختر 'Wipe Data'",
        "اضغط زر الطاقة للتأكيد ثم 'Factory Reset'",
      ],
      actionLabel: "عرض دليل الأزرار",
      actionIcon: "gesture-tap-button",
      canAct: true,
      onAction: () => Linking.openURL("https://www.android.com/intl/ar_ae/"),
    },
    manual: {
      description: "خطوات تفصيلية للدخول لوضع Recovery وتجاوز FRP",
      steps: [
        "أطفئ الجهاز من زر الطاقة → إيقاف تشغيل",
        "اضغط Power + Vol Down (سامسونج) أو Power + Vol Up (آيفون وبعض الأندرويد)",
        "عند ظهور شاشة Recovery استخدم أزرار الصوت للتنقل",
        "اختر 'Apply update from ADB' أو 'Wipe Data'",
        "اختر 'Factory Reset' وأكّد العملية",
        "بعد الانتهاء اختر 'Reboot system now'",
        "سيُعاد تشغيل الجهاز بدون FRP",
      ],
    },
  },
  {
    id: "remove-google",
    title: "إزالة حساب Google",
    subtitle: "Remove Google Account",
    icon: "google",
    color: "#4ade80",
    warning: "أزِل الحساب قبل إعادة الضبط لتجنب FRP",
    auto: {
      description: "سيفتح التطبيق صفحة إعدادات الحسابات مباشرةً",
      steps: [
        "يفتح التطبيق إعدادات حسابات Google",
        "اختر حساب Google المطلوب إزالته",
        "اضغط 'إزالة الحساب' للحذف",
      ],
      actionLabel: "فتح إعدادات الحسابات",
      actionIcon: "account-cog",
      canAct: true,
      onAction: () => Linking.openURL("https://myaccount.google.com/"),
    },
    manual: {
      description: "كيفية إزالة حساب Google يدوياً قبل إعادة الضبط",
      steps: [
        "افتح الإعدادات ← الحسابات والنسخ الاحتياطي",
        "اضغط على 'إدارة الحسابات'",
        "اختر حساب Google من القائمة",
        "اضغط على 'إزالة الحساب'",
        "أكّد الإزالة في نافذة التأكيد",
        "الآن يمكنك إعادة الضبط دون FRP",
      ],
    },
  },
  {
    id: "frp-otg",
    title: "FRP عبر OTG",
    subtitle: "OTG ADB Bypass",
    icon: "usb",
    color: "#00d4ff",
    auto: {
      description: "سينسخ التطبيق أمر ADB جاهز للتنفيذ على حاسوبك",
      steps: [
        "يُنسخ أمر ADB لتجاوز FRP تلقائياً إلى الحافظة",
        "افتح cmd أو Terminal على حاسوبك",
        "الصق الأمر واضغط Enter",
        "الأمر: adb shell content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1",
      ],
      actionLabel: "نسخ أمر ADB",
      actionIcon: "content-copy",
      canAct: true,
      onAction: () =>
        copyToClipboard(
          "adb shell content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1"
        ),
    },
    manual: {
      description: "خطوات تجاوز FRP عبر كابل OTG وبرامج ADB",
      steps: [
        "حمّل ADB من موقع Android Developer",
        "فعّل USB Debugging عبر وضع Recovery إن أمكن",
        "وصّل الجهاز بالحاسوب عبر USB",
        "افتح cmd واكتب: adb devices — تأكد ظهور الجهاز",
        "نفّذ: adb shell content insert --uri content://settings/secure...",
        "أعِد تشغيل الجهاز — سيختفي FRP",
      ],
    },
  },
  {
    id: "odin-samsung",
    title: "أداة Odin (Samsung)",
    subtitle: "Samsung Odin Flash Tool",
    icon: "database",
    color: "#a855f7",
    warning: "يُبطل الضمان على بعض أجهزة Samsung",
    auto: {
      description: "سيفتح التطبيق رابط تحميل Odin الرسمي مباشرةً",
      steps: [
        "يفتح رابط تحميل Odin من المصدر الرسمي",
        "حمّل الإصدار المناسب (Odin 3.14+)",
        "حمّل firmware جهازك من SamFw أو samfrew",
        "أدخل الجهاز في Download Mode",
        "شغّل Odin على Windows وابدأ الفلاش",
      ],
      actionLabel: "فتح رابط Odin",
      actionIcon: "download",
      canAct: true,
      onAction: () => Linking.openURL("https://odindownload.com/"),
    },
    manual: {
      description: "خطوات استخدام Odin لفلاش Samsung وإزالة FRP",
      steps: [
        "حمّل Odin من: odindownload.com",
        "حمّل firmware جهازك من: samfw.com أو samfrew.com",
        "أدخل جهاز Samsung في Download Mode (Power + Vol Down + Home)",
        "وصّل الجهاز بالحاسوب عبر USB",
        "افتح Odin وانتظر ظهور COM port باللون الأزرق",
        "في قسم AP اختر ملف firmware المحمّل (.tar.md5)",
        "اضغط Start وانتظر انتهاء الفلاش (~10 دقائق)",
        "سيُعاد تشغيل الجهاز بدون FRP",
      ],
    },
  },
];

export default function FRPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
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
          <View style={[styles.headerIcon, { backgroundColor: "#ff6b3522" }]}>
            <MaterialCommunityIcons name="shield-lock" size={22} color="#ff6b35" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات FRP</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>
              Factory Reset Protection
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.warnCard, { backgroundColor: "#ff6b3515", borderColor: "#ff6b3540" }]}>
          <MaterialCommunityIcons name="alert-circle" size={18} color="#ff6b35" />
          <Text style={[styles.warnText, { color: "#ff6b35" }]}>
            هذه الأدوات للاستخدام على أجهزتك الخاصة فقط
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          اختر الأداة المطلوبة
        </Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          كل أداة تدعم وضعَين: تلقائي ⚡ أو يدوي 📖
        </Text>

        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => {
              Haptics.selectionAsync();
              setSelected(opt);
            }}
            style={[styles.optCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.optRow}>
              <View style={[styles.optIcon, { backgroundColor: opt.color + "22" }]}>
                <MaterialCommunityIcons name={opt.icon as "home"} size={22} color={opt.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optTitle, { color: colors.foreground }]}>{opt.title}</Text>
                {opt.subtitle ? (
                  <Text style={[styles.optSub, { color: colors.mutedForeground }]}>{opt.subtitle}</Text>
                ) : null}
              </View>
              <View style={styles.modePillsRow}>
                <View style={[styles.pill, { backgroundColor: "#ffd70018" }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={11} color="#ffd700" />
                  <Text style={[styles.pillText, { color: "#ffd700" }]}>تلقائي</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: "#00d4ff18" }]}>
                  <MaterialCommunityIcons name="book-open-variant" size={11} color="#00d4ff" />
                  <Text style={[styles.pillText, { color: "#00d4ff" }]}>يدوي</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-left" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>
        ))}
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
  scroll: { padding: 16, gap: 10 },
  warnCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  warnText: { flex: 1, fontSize: 13, fontWeight: "500", textAlign: "right" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hint: { fontSize: 12, textAlign: "right", marginBottom: 4 },
  optCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  optRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  optIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  optTitle: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  optSub: { fontSize: 12, textAlign: "right", marginTop: 1 },
  modePillsRow: { flexDirection: "row-reverse", gap: 5 },
  pill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillText: { fontSize: 10, fontWeight: "600" },
});
