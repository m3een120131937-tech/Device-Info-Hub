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
    id: "odin",
    title: "Odin",
    subtitle: "Samsung — أداة الفلاش الرسمية",
    icon: "cellphone-arrow-down",
    color: "#00d4ff",
    warning: "للأجهزة Samsung فقط — يُبطل الضمان",
    auto: {
      description: "سيفتح التطبيق روابط التحميل الرسمية لـ Odin و firmware Samsung",
      steps: [
        "يفتح رابط تحميل Odin 3.14 من المصدر الرسمي",
        "يفتح SamFw لتحميل firmware الجهاز",
        "أدخل جهازك في Download Mode وابدأ الفلاش",
      ],
      actionLabel: "فتح تحميل Odin",
      actionIcon: "download",
      canAct: true,
      onAction: () => Linking.openURL("https://odindownload.com/"),
    },
    manual: {
      description: "خطوات فلاش Samsung عبر Odin على Windows",
      steps: [
        "حمّل Odin من: odindownload.com",
        "حمّل firmware من: samfw.com — ابحث برقم الموديل",
        "فُك ضغط ملف firmware — ستجد ملفات AP, BL, CP, CSC",
        "أدخل الجهاز في Download Mode: Power + Vol Down + Home",
        "وصّل USB — انتظر ظهور COM باللون الأزرق في Odin",
        "اختر ملف AP ثم اضغط Start",
        "انتظر الانتهاء (~10 دقائق) ثم PASS باللون الأخضر",
      ],
    },
  },
  {
    id: "spflashtool",
    title: "SP Flash Tool",
    subtitle: "MediaTek — Scatter Firmware",
    icon: "flash",
    color: "#ffd700",
    warning: "للأجهزة MediaTek MTK فقط",
    auto: {
      description: "سيفتح التطبيق رابط تحميل SP Flash Tool وملف شرح الاستخدام",
      steps: [
        "يفتح رابط تحميل SP Flash Tool الرسمي",
        "حمّل scatter file لجهازك من المنتدى الخاص به",
        "شغّل SP Flash Tool كـ Administrator على Windows",
      ],
      actionLabel: "تحميل SP Flash Tool",
      actionIcon: "download",
      canAct: true,
      onAction: () => Linking.openURL("https://spflashtools.com/"),
    },
    manual: {
      description: "خطوات فلاش MediaTek عبر SP Flash Tool",
      steps: [
        "حمّل SP Flash Tool من: spflashtools.com",
        "حمّل firmware جهازك — ابحث عن scatter file",
        "شغّل flash_tool.exe كـ Administrator",
        "اضغط 'Choose' واختر scatter file من firmware",
        "اختر نوع الفلاش: Download Only أو Firmware Upgrade",
        "اضغط Download ثم وصّل الجهاز المطفأ عبر USB",
        "انتظر انتهاء الفلاش ظهور دائرة خضراء",
      ],
    },
  },
  {
    id: "fastboot-adb",
    title: "Fastboot / ADB",
    subtitle: "جميع الأجهزة — Android SDK",
    icon: "console",
    color: "#4ade80",
    auto: {
      description: "سينسخ التطبيق أوامر ADB الأساسية إلى الحافظة جاهزة للتنفيذ",
      steps: [
        "يُنسخ أمر ADB لإعادة الضبط عبر Fastboot",
        "افتح cmd على حاسوبك والصق الأمر",
        "الأمر: fastboot -w && fastboot reboot",
      ],
      actionLabel: "نسخ أوامر Fastboot",
      actionIcon: "content-copy",
      canAct: true,
      onAction: () => copyToClipboard("fastboot -w && fastboot reboot"),
    },
    manual: {
      description: "خطوات تفعيل ADB و Fastboot وفلاش الجهاز",
      steps: [
        "حمّل Android Platform Tools من: developer.android.com",
        "فعّل Developer Options: اضغط Build Number 7 مرات",
        "فعّل USB Debugging من خيارات المطور",
        "وصّل الجهاز وقبل الاتصال في الجهاز",
        "تحقق: adb devices — يجب ظهور serial number",
        "أدخل Fastboot: adb reboot bootloader",
        "فلاش: fastboot flash system system.img",
        "أعِد التشغيل: fastboot reboot",
      ],
    },
  },
  {
    id: "qfil",
    title: "QFIL / QPST",
    subtitle: "Qualcomm — EDL 9008",
    icon: "chip",
    color: "#a855f7",
    warning: "يتطلب برنامج تشغيل Qualcomm خاص",
    auto: {
      description: "سيفتح التطبيق رابط تحميل QFIL من المصدر الرسمي",
      steps: [
        "يفتح رابط تحميل QFIL / QPST",
        "حمّل برامج تشغيل Qualcomm",
        "أدخل الجهاز في EDL Mode (9008) وابدأ الفلاش",
      ],
      actionLabel: "تحميل QFIL",
      actionIcon: "download",
      canAct: true,
      onAction: () => Linking.openURL("https://qpsttool.com/"),
    },
    manual: {
      description: "خطوات فلاش أجهزة Qualcomm عبر EDL Mode",
      steps: [
        "حمّل QFIL و QPST من: qpsttool.com",
        "حمّل firmware جهازك (ملفات .mbn أو .elf)",
        "ثبّت Qualcomm HS-USB QDLoader 9008 Driver",
        "أدخل الجهاز في EDL: اضغط أزرار خاصة أو كابل EDL",
        "تأكد ظهور الجهاز في Device Manager كـ QDLoader 9008",
        "افتح QFIL واختر ملف prog_emmc_firehose",
        "اضغط Download Content وانتظر الانتهاء",
      ],
    },
  },
  {
    id: "miflash",
    title: "MiFlash",
    subtitle: "Xiaomi — MIUI Fastboot",
    icon: "cellphone-link",
    color: "#ff6b35",
    warning: "للأجهزة Xiaomi / Redmi / POCO فقط",
    auto: {
      description: "سيفتح التطبيق رابط تحميل MiFlash الرسمي من Xiaomi",
      steps: [
        "يفتح رابط تحميل MiFlash الرسمي",
        "حمّل MIUI Fastboot ROM من c.mi.com",
        "أدخل الجهاز في Fastboot وابدأ الفلاش",
      ],
      actionLabel: "تحميل MiFlash",
      actionIcon: "download",
      canAct: true,
      onAction: () => Linking.openURL("https://www.xiaomiflash.com/"),
    },
    manual: {
      description: "خطوات فلاش Xiaomi عبر MiFlash و Fastboot ROM",
      steps: [
        "حمّل MiFlash من: xiaomiflash.com",
        "حمّل Fastboot ROM من c.mi.com/miuidownload",
        "فُك ضغط ROM في مجلد لا يحتوي على مسافات",
        "أدخل الجهاز في Fastboot: Power + Vol Down",
        "وصّل USB وافتح MiFlash — اضغط Refresh",
        "اختر مجلد ROM واختر نوع الفلاش",
        "اضغط Flash وانتظر الانتهاء (~15 دقيقة)",
      ],
    },
  },
];

export default function FlashScreen() {
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
          <View style={[styles.headerIcon, { backgroundColor: "#ffd70022" }]}>
            <MaterialCommunityIcons name="flash" size={22} color="#ffd700" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات الفلاش</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>
              Flash & Firmware Tools
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.warnCard, { backgroundColor: "#ff6b3515", borderColor: "#ff6b3540" }]}>
          <MaterialCommunityIcons name="alert" size={18} color="#ff6b35" />
          <Text style={[styles.warnText, { color: "#ff6b35" }]}>
            الفلاش الخاطئ قد يُبطل الضمان — تأكد من firmware الصحيح
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          اختر أداة الفلاش
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
              <View style={styles.pillsRow}>
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
  pillsRow: { flexDirection: "row-reverse", gap: 5 },
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
