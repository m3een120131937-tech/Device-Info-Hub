import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

function buildOptions(): ToolOption[] {
  return [
    {
      id: "show-imei",
      title: "عرض رقم IMEI",
      subtitle: "*#06# — الرقم التسلسلي",
      icon: "sim",
      color: "#00d4ff",
      auto: {
        description: "سيفتح التطبيق تطبيق الهاتف مع الكود جاهزاً للاتصال تلقائياً",
        steps: [
          "يفتح تطبيق الهاتف مباشرةً",
          "يُدخل كود *#06# تلقائياً",
          "يظهر IMEI على الشاشة فوراً",
        ],
        actionLabel: "اتصال بـ *#06# تلقائياً",
        actionIcon: "phone",
        canAct: true,
        onAction: () => Linking.openURL("tel:*%2306%23"),
      },
      manual: {
        description: "كيفية الحصول على IMEI يدوياً بطرق متعددة",
        steps: [
          "افتح تطبيق الهاتف (الاتصالات)",
          "اكتب في لوحة الأرقام: *#06#",
          "اضغط زر الاتصال — يظهر IMEI فوراً",
          "بديل: الإعدادات ← حول الهاتف ← معلومات الجهاز",
          "بديل آخر: انظر خلف الجهاز أو في علبته",
          "احفظ IMEI في مكان آمن لحالات السرقة",
        ],
      },
    },
    {
      id: "phone-info",
      title: "معلومات الهاتف المتقدمة",
      subtitle: "*#*#4636#*#* — بطارية وإحصاءات",
      icon: "information",
      color: "#4ade80",
      auto: {
        description: "سيفتح التطبيق قائمة المعلومات المتقدمة مباشرةً",
        steps: [
          "يفتح تطبيق الهاتف تلقائياً",
          "يُدخل كود *#*#4636#*#*",
          "تظهر قائمة: معلومات الهاتف، البطارية، الإحصاءات",
        ],
        actionLabel: "فتح معلومات متقدمة",
        actionIcon: "phone",
        canAct: true,
        onAction: () => Linking.openURL("tel:*%23*%234636%23*%23*"),
      },
      manual: {
        description: "الوصول لإحصاءات الهاتف المتقدمة يدوياً",
        steps: [
          "افتح تطبيق الهاتف",
          "اكتب: *#*#4636#*#*",
          "ستفتح قائمة بها 4 أقسام",
          "قسم 'معلومات الهاتف': IMEI، حالة الشبكة، نوع الاتصال",
          "قسم 'معلومات البطارية': نسبة الشحن، درجة الحرارة، الصحة",
          "قسم 'إحصاءات البطارية': تاريخ الاستخدام",
          "قسم 'إحصاءات الاستخدام': تفاصيل تشغيل التطبيقات",
        ],
      },
    },
    {
      id: "samsung-test",
      title: "قائمة اختبار Samsung",
      subtitle: "*#0*# — شاشة اللمس والمستشعرات",
      icon: "cellphone-check",
      color: "#a855f7",
      warning: "يعمل على أجهزة Samsung فقط",
      auto: {
        description: "سيفتح قائمة الاختبار الشاملة لأجهزة Samsung",
        steps: [
          "يفتح تطبيق الهاتف",
          "يُدخل كود *#0*# لأجهزة Samsung",
          "تظهر قائمة اختبار شاملة",
        ],
        actionLabel: "فتح اختبار Samsung",
        actionIcon: "phone",
        canAct: true,
        onAction: () => Linking.openURL("tel:*%230*%23"),
      },
      manual: {
        description: "كيفية اختبار مكونات Samsung يدوياً",
        steps: [
          "افتح تطبيق الهاتف على جهاز Samsung",
          "اكتب: *#0*# — ستفتح قائمة اختبار",
          "اختبار الشاشة: تحقق من الألوان والبكسل الميت",
          "اختبار اللمس: تأكد من استجابة كل الشاشة",
          "اختبار المستشعرات: Accelerometer, Gyroscope",
          "اختبار الكاميرا الأمامية والخلفية",
          "اضغط زر الرجوع للخروج من كل اختبار",
        ],
      },
    },
    {
      id: "firmware-info",
      title: "معلومات الـ Firmware",
      subtitle: "*#*#1234#*#* — PDA و CSC",
      icon: "code-braces",
      color: "#ff6b35",
      auto: {
        description: "سيفتح معلومات الـ firmware المفصّلة لجهازك",
        steps: [
          "يفتح تطبيق الهاتف",
          "يُدخل كود *#*#1234#*#*",
          "تظهر: إصدار PDA، إصدار Phone، CSC",
        ],
        actionLabel: "عرض معلومات Firmware",
        actionIcon: "phone",
        canAct: true,
        onAction: () => Linking.openURL("tel:*%23*%231234%23*%23*"),
      },
      manual: {
        description: "الوصول لمعلومات Firmware جهازك يدوياً",
        steps: [
          "افتح تطبيق الهاتف واكتب *#*#1234#*#*",
          "ستظهر: PDA (إصدار نظام الجهاز)",
          "Phone: إصدار نظام اتصالات الباسباند",
          "CSC: كود المنطقة والمشغل",
          "بديل Samsung: الإعدادات ← حول الهاتف ← معلومات البرنامج",
          "استخدم هذه المعلومات للبحث عن firmware مناسب",
        ],
      },
    },
    {
      id: "touch-test",
      title: "اختبار شاشة اللمس",
      subtitle: "*#*#2664#*#* — Touch Screen Test",
      icon: "gesture-tap",
      color: "#ffd700",
      auto: {
        description: "سيفتح اختبار شاشة اللمس مباشرةً",
        steps: [
          "يفتح تطبيق الهاتف",
          "يُدخل كود *#*#2664#*#*",
          "يبدأ اختبار اللمس فوراً",
        ],
        actionLabel: "بدء اختبار اللمس",
        actionIcon: "phone",
        canAct: true,
        onAction: () => Linking.openURL("tel:*%23*%232664%23*%23*"),
      },
      manual: {
        description: "اختبار شاشة اللمس يدوياً للتأكد من سلامتها",
        steps: [
          "اكتب في تطبيق الهاتف: *#*#2664#*#*",
          "يفتح اختبار اللمس — امسح بإصبعك على الشاشة",
          "يجب أن تتتبع الشاشة إصبعك دون فجوات",
          "اختبر زوايا الشاشة الأربع بعناية",
          "اختبر اللمس المتعدد بإصبعين أو أكثر",
          "إن وجدت نقاط لا تستجيب → المس قد يحتاج تبديل",
        ],
      },
    },
  ];
}

export default function IMEIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [device, setDevice] = useState<DeviceData | null>(null);
  const [selected, setSelected] = useState<ToolOption | null>(null);

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
        { label: "الذاكرة الكلية", value: device.totalRam, icon: "memory" as const, color: "#4ade80" },
        { label: "جهاز حقيقي", value: device.isDevice ? "نعم ✓" : "محاكي", icon: "check-circle" as const, color: device.isDevice ? "#4ade80" : "#ff6b35" },
      ]
    : [];

  const OPTIONS = buildOptions();

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
          <View style={[styles.headerIcon, { backgroundColor: "#00d4ff22" }]}>
            <MaterialCommunityIcons name="sim" size={22} color="#00d4ff" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات IMEI</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>
              Device & IMEI Information
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {/* Device info card */}
        {rows.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              معلومات الجهاز الحالي
            </Text>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {rows.map((row, i) => (
                <View
                  key={row.label}
                  style={[
                    styles.infoRow,
                    i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value}</Text>
                  <View style={styles.infoLabelRow}>
                    <MaterialCommunityIcons name={row.icon} size={14} color={row.color} />
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          أكواد USSD والأدوات
        </Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          كل كود يدعم وضعَين: تلقائي ⚡ أو يدوي 📖
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
                <MaterialCommunityIcons name={opt.icon as "home"} size={20} color={opt.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optTitle, { color: colors.foreground }]}>{opt.title}</Text>
                {opt.subtitle ? (
                  <Text style={[styles.optSub, { color: opt.color }]}>{opt.subtitle}</Text>
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hint: { fontSize: 12, textAlign: "right", marginBottom: 2 },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  infoLabelRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 14, fontWeight: "600", textAlign: "left" },
  optCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  optRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  optIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  optTitle: { fontSize: 14, fontWeight: "600", textAlign: "right" },
  optSub: { fontSize: 12, textAlign: "right", marginTop: 1, fontWeight: "500" },
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
