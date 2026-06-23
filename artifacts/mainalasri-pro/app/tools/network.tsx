import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const CACHE_KEY = "mainalasri_network_cache";

interface NetInfo {
  publicIp: string;
  country: string;
  city: string;
  isp: string;
  timezone: string;
  latitude: string;
  longitude: string;
  cachedAt?: string;
}

function buildDnsOptions(): ToolOption[] {
  return [
    {
      id: "google-dns",
      title: "Google DNS",
      subtitle: "8.8.8.8 / 8.8.4.4",
      icon: "google",
      color: "#4285f4",
      auto: {
        description: "سينسخ التطبيق عناوين Google DNS إلى الحافظة تلقائياً",
        steps: [
          "يُنسخ DNS الرئيسي: 8.8.8.8 إلى الحافظة",
          "افتح إعدادات الشبكة على جهازك",
          "الصق العنوان في حقل DNS",
        ],
        actionLabel: "نسخ 8.8.8.8",
        actionIcon: "content-copy",
        canAct: true,
        onAction: () => copyToClipboard("8.8.8.8"),
      },
      manual: {
        description: "كيفية تغيير DNS إلى Google DNS يدوياً على Android",
        steps: [
          "افتح الإعدادات ← الاتصالات ← Wi-Fi",
          "اضغط طويلاً على الشبكة المتصل بها",
          "اختر 'تعديل الشبكة' أو 'إعدادات متقدمة'",
          "غيّر إعداد IP من DHCP إلى Static",
          "في حقل DNS 1: أدخل 8.8.8.8",
          "في حقل DNS 2: أدخل 8.8.4.4",
          "اضغط حفظ وأعِد الاتصال بالشبكة",
        ],
      },
    },
    {
      id: "cloudflare-dns",
      title: "Cloudflare DNS",
      subtitle: "1.1.1.1 / 1.0.0.1",
      icon: "cloud",
      color: "#f48120",
      auto: {
        description: "سينسخ التطبيق عناوين Cloudflare DNS الأسرع في العالم",
        steps: [
          "يُنسخ DNS الرئيسي: 1.1.1.1 إلى الحافظة",
          "افتح إعدادات الشبكة على جهازك",
          "الصق العنوان في حقل DNS",
        ],
        actionLabel: "نسخ 1.1.1.1",
        actionIcon: "content-copy",
        canAct: true,
        onAction: () => copyToClipboard("1.1.1.1"),
      },
      manual: {
        description: "تغيير DNS إلى Cloudflare يدوياً (الأسرع عالمياً)",
        steps: [
          "افتح الإعدادات ← الاتصالات ← Wi-Fi",
          "اضغط طويلاً على الشبكة الحالية",
          "اختر 'تعديل الشبكة'",
          "في الإعدادات المتقدمة غيّر IP إلى Static",
          "DNS 1: 1.1.1.1 | DNS 2: 1.0.0.1",
          "للـ IPv6: DNS 1: 2606:4700:4700::1111",
          "اضغط حفظ — Cloudflare أسرع DNS في العالم",
        ],
      },
    },
    {
      id: "opendns",
      title: "OpenDNS",
      subtitle: "208.67.222.222 / 208.67.220.220",
      icon: "shield-check",
      color: "#00c2e0",
      auto: {
        description: "سينسخ التطبيق عناوين OpenDNS (حماية من المواقع الضارة)",
        steps: [
          "يُنسخ DNS الرئيسي: 208.67.222.222 إلى الحافظة",
          "افتح إعدادات الشبكة على جهازك",
          "الصق العنوان في حقل DNS",
        ],
        actionLabel: "نسخ 208.67.222.222",
        actionIcon: "content-copy",
        canAct: true,
        onAction: () => copyToClipboard("208.67.222.222"),
      },
      manual: {
        description: "تغيير DNS إلى OpenDNS للحماية من المحتوى الضار",
        steps: [
          "افتح الإعدادات ← الاتصالات ← Wi-Fi",
          "عدّل الشبكة الحالية وغيّر IP إلى Static",
          "DNS 1: 208.67.222.222",
          "DNS 2: 208.67.220.220",
          "OpenDNS يحجب المواقع الضارة والتصيد الاحتيالي",
          "اضغط حفظ وتحقق من الاتصال",
        ],
      },
    },
    {
      id: "quad9",
      title: "Quad9 DNS",
      subtitle: "9.9.9.9 / 149.112.112.112",
      icon: "numeric-9-box",
      color: "#5f259f",
      auto: {
        description: "سينسخ التطبيق عناوين Quad9 DNS (أمان + خصوصية)",
        steps: [
          "يُنسخ DNS الرئيسي: 9.9.9.9 إلى الحافظة",
          "افتح إعدادات الشبكة على جهازك",
          "الصق العنوان في حقل DNS",
        ],
        actionLabel: "نسخ 9.9.9.9",
        actionIcon: "content-copy",
        canAct: true,
        onAction: () => copyToClipboard("9.9.9.9"),
      },
      manual: {
        description: "تغيير DNS إلى Quad9 للأمان والخصوصية",
        steps: [
          "افتح الإعدادات ← Wi-Fi ← تعديل الشبكة",
          "غيّر IP إلى Static",
          "DNS 1: 9.9.9.9",
          "DNS 2: 149.112.112.112",
          "Quad9 يحجب أكثر من 50 مليون نطاق خطير",
          "لا يحتفظ ببيانات المستخدم — خصوصية كاملة",
        ],
      },
    },
    {
      id: "check-ip",
      title: "فحص عنوان IP",
      subtitle: "IP العام والموقع",
      icon: "earth",
      color: "#4ade80",
      auto: {
        description: "سينسخ التطبيق عنوان IP العام إلى الحافظة إن كان متاحاً",
        steps: [
          "يفتح موقع فحص IP الخارجي",
          "يعرض عنوان IP العام والبلد",
          "يعرض مزود الخدمة والموقع التقريبي",
        ],
        actionLabel: "فتح فحص IP",
        actionIcon: "web",
        canAct: true,
        onAction: () => {
          const { Linking } = require("react-native");
          Linking.openURL("https://ipapi.co/");
        },
      },
      manual: {
        description: "كيفية فحص عنوان IP يدوياً بطرق متعددة",
        steps: [
          "افتح المتصفح وابحث عن: ما هو IP الخاص بي",
          "أو اذهب إلى: ipapi.co أو whatismyip.com",
          "يظهر عنوان IP العام، البلد، المدينة",
          "للتحقق من IP على Android: الإعدادات ← Wi-Fi ← معلومات الشبكة",
          "IP المحلي (192.168.x.x) يختلف عن IP العام",
          "IP العام هو ما يراه الإنترنت — المحلي للشبكة الداخلية",
        ],
      },
    },
  ];
}

export default function NetworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;

  const [netInfo, setNetInfo] = useState<NetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [selected, setSelected] = useState<ToolOption | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadCached(): Promise<NetInfo | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw) as NetInfo;
    } catch {}
    return null;
  }

  async function saveCache(data: NetInfo) {
    try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
  }

  async function loadData() {
    setLoading(true);
    setOffline(false);
    setFromCache(false);

    const cached = await loadCached();
    if (cached) { setNetInfo(cached); setFromCache(true); setLoading(false); }

    try {
      const start = Date.now();
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(8000) });
      const elapsed = Date.now() - start;
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      const fresh: NetInfo = {
        publicIp:  data.ip             ?? "غير متاح",
        country:   data.country_name   ?? "غير معروف",
        city:      data.city           ?? "غير معروف",
        isp:       data.org            ?? "غير معروف",
        timezone:  data.timezone       ?? "غير معروف",
        latitude:  data.latitude  ? String(data.latitude)  : "--",
        longitude: data.longitude ? String(data.longitude) : "--",
        cachedAt:  new Date().toLocaleTimeString("ar-SA"),
      };
      setPingMs(elapsed);
      setNetInfo(fresh);
      setFromCache(false);
      saveCache(fresh);
    } catch {
      if (!cached) setOffline(true);
    } finally {
      setLoading(false);
    }
  }

  const OPTIONS = buildDnsOptions();

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
          <View style={[styles.headerIcon, { backgroundColor: "#4ade8022" }]}>
            <MaterialCommunityIcons name="wifi" size={22} color="#4ade80" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: colors.foreground }]}>أدوات الشبكة</Text>
            <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>Network Tools & IP Info</Text>
          </View>
        </View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); loadData(); }}
          style={[styles.refreshBtn, { backgroundColor: colors.muted }]}
        >
          <MaterialCommunityIcons name="refresh" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {offline && (
          <View style={[styles.offlineBanner, { backgroundColor: "#ff6b3520", borderColor: "#ff6b3550" }]}>
            <MaterialCommunityIcons name="wifi-off" size={16} color="#ff6b35" />
            <Text style={[styles.offlineText, { color: "#ff6b35" }]}>لا يوجد اتصال بالإنترنت</Text>
          </View>
        )}

        {fromCache && !offline && (
          <View style={[styles.cacheBanner, { backgroundColor: "#ffd70020", borderColor: "#ffd70050" }]}>
            <MaterialCommunityIcons name="cached" size={14} color="#ffd700" />
            <Text style={[styles.cacheText, { color: "#ffd700" }]}>
              آخر تحديث: {netInfo?.cachedAt ?? "--"}
            </Text>
          </View>
        )}

        {/* IP Card */}
        <View style={[styles.ipCard, { backgroundColor: "#4ade8015", borderColor: "#4ade8040" }]}>
          {loading && !netInfo ? (
            <ActivityIndicator color="#4ade80" size="large" />
          ) : offline && !netInfo ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="wifi-off" size={36} color={colors.mutedForeground} />
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>لا يوجد اتصال</Text>
              <Pressable onPress={loadData} style={[styles.retryBtn, { backgroundColor: "#4ade8030" }]}>
                <Text style={{ color: "#4ade80", fontWeight: "600" }}>إعادة المحاولة</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.ipLabel, { color: "#4ade80" }]}>عنوان IP العام</Text>
              <Text style={[styles.ipValue, { color: "#4ade80" }]}>{netInfo?.publicIp}</Text>
              {pingMs !== null && (
                <View style={styles.pingRow}>
                  <MaterialCommunityIcons name="timer-outline" size={14} color="#4ade80" />
                  <Text style={[styles.pingText, { color: "#4ade80" }]}>{pingMs}ms</Text>
                </View>
              )}
            </>
          )}
        </View>

        {netInfo && (
          <>
            <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { label: "الدولة",    value: netInfo.country,   icon: "earth"           as const, color: "#4ade80" },
                { label: "المدينة",   value: netInfo.city,      icon: "map-marker"      as const, color: "#00d4ff" },
                { label: "مزود الخدمة", value: netInfo.isp,    icon: "office-building" as const, color: "#a855f7" },
                { label: "المنطقة الزمنية", value: netInfo.timezone, icon: "clock-outline" as const, color: "#ffd700" },
                { label: "الإحداثيات", value: `${netInfo.latitude} / ${netInfo.longitude}`, icon: "crosshairs-gps" as const, color: "#ff6b35" },
              ].map((row, i, arr) => (
                <View
                  key={row.label}
                  style={[
                    styles.detailRow,
                    i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={1}>
                    {row.value}
                  </Text>
                  <View style={styles.detailLabelRow}>
                    <MaterialCommunityIcons name={row.icon} size={13} color={row.color} />
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          أدوات الشبكة و DNS
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
  refreshBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 10 },
  offlineBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  offlineText: { fontSize: 13, fontWeight: "500", textAlign: "right", flex: 1 },
  cacheBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cacheText: { fontSize: 12, textAlign: "right", flex: 1 },
  ipCard: { borderRadius: 18, borderWidth: 1, padding: 22, alignItems: "center", gap: 6 },
  ipLabel: { fontSize: 12, fontWeight: "500" },
  ipValue: { fontSize: 24, fontWeight: "bold" },
  pingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  pingText: { fontSize: 12 },
  errorBox: { alignItems: "center", gap: 10, paddingVertical: 8 },
  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  detailsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  detailRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  detailLabelRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600", maxWidth: "55%" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hint: { fontSize: 12, textAlign: "right", marginBottom: 2 },
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
