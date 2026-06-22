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

const CACHE_KEY = "mainalasri_network_cache";

interface NetInfo {
  publicIp: string;
  country: string;
  city: string;
  isp: string;
  timezone: string;
  latitude: string;
  longitude: string;
  org: string;
  cachedAt?: string;
}

const DNS_LIST = [
  { name: "Google DNS",  primary: "8.8.8.8",          secondary: "8.8.4.4",           color: "#4285f4" },
  { name: "Cloudflare",  primary: "1.1.1.1",           secondary: "1.0.0.1",           color: "#f48120" },
  { name: "OpenDNS",     primary: "208.67.222.222",    secondary: "208.67.220.220",    color: "#00c2e0" },
  { name: "Quad9",       primary: "9.9.9.9",           secondary: "149.112.112.112",   color: "#5f259f" },
];

export default function NetworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;

  const [netInfo, setNetInfo] = useState<NetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadCached(): Promise<NetInfo | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw) as NetInfo;
    } catch {}
    return null;
  }

  async function saveCache(data: NetInfo) {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
  }

  async function loadData() {
    setLoading(true);
    setOffline(false);
    setFromCache(false);

    // 1. Show cached data immediately while fetching
    const cached = await loadCached();
    if (cached) {
      setNetInfo(cached);
      setFromCache(true);
      setLoading(false);
    }

    // 2. Try to fetch fresh data
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
        org:       data.asn            ?? "--",
        cachedAt:  new Date().toLocaleTimeString("ar-SA"),
      };
      setPingMs(elapsed);
      setNetInfo(fresh);
      setFromCache(false);
      saveCache(fresh);
    } catch {
      // Offline or timeout — keep showing cached data if available
      if (!cached) setOffline(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.backBtn}>
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
        {/* Offline banner */}
        {offline && (
          <View style={[styles.offlineBanner, { backgroundColor: "#ff6b3520", borderColor: "#ff6b3550" }]}>
            <MaterialCommunityIcons name="wifi-off" size={16} color="#ff6b35" />
            <Text style={[styles.offlineText, { color: "#ff6b35" }]}>لا يوجد اتصال بالإنترنت — تحقق من الشبكة</Text>
          </View>
        )}

        {/* Cached banner */}
        {fromCache && !offline && (
          <View style={[styles.cacheBanner, { backgroundColor: "#ffd70020", borderColor: "#ffd70050" }]}>
            <MaterialCommunityIcons name="cached" size={14} color="#ffd700" />
            <Text style={[styles.cacheText, { color: "#ffd700" }]}>
              يتم تحميل البيانات... آخر تحديث: {netInfo?.cachedAt ?? "غير معروف"}
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
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>لا يوجد اتصال ولا بيانات محفوظة</Text>
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
                  <Text style={[styles.pingText, { color: "#4ade80" }]}>الاستجابة: {pingMs}ms</Text>
                </View>
              )}
              {fromCache && (
                <View style={styles.pingRow}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#4ade8099" />
                  <Text style={[styles.pingText, { color: "#4ade8099" }]}>محفوظ مسبقاً</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Net Details */}
        {netInfo && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>تفاصيل الاتصال</Text>
            <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { label: "الدولة",          value: netInfo.country,   icon: "earth"          as const, color: "#4ade80" },
                { label: "المدينة",          value: netInfo.city,      icon: "map-marker"     as const, color: "#00d4ff" },
                { label: "مزود الخدمة",     value: netInfo.isp,       icon: "office-building" as const, color: "#a855f7" },
                { label: "المنطقة الزمنية", value: netInfo.timezone,  icon: "clock-outline"  as const, color: "#ffd700" },
                { label: "خط العرض",        value: netInfo.latitude,  icon: "latitude"       as const, color: "#ff6b35" },
                { label: "خط الطول",        value: netInfo.longitude, icon: "longitude"      as const, color: "#ff6b35" },
              ].map((row, i, arr) => (
                <View key={row.label} style={[styles.detailRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={1}>{row.value}</Text>
                  <View style={styles.detailLabelRow}>
                    <MaterialCommunityIcons name={row.icon} size={13} color={row.color} />
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* DNS */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>خوادم DNS الموصى بها</Text>
        {DNS_LIST.map((dns) => (
          <View key={dns.name} style={[styles.dnsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dnsIcon, { backgroundColor: dns.color + "22" }]}>
              <MaterialCommunityIcons name="dns" size={18} color={dns.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dnsName, { color: colors.foreground }]}>{dns.name}</Text>
              <Text style={[styles.dnsIps, { color: colors.mutedForeground }]}>{dns.primary} • {dns.secondary}</Text>
            </View>
          </View>
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
  refreshBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 10 },
  offlineBanner: { flexDirection: "row-reverse", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  offlineText: { fontSize: 13, fontWeight: "500", textAlign: "right", flex: 1 },
  cacheBanner: { flexDirection: "row-reverse", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, borderWidth: 1 },
  cacheText: { fontSize: 12, textAlign: "right", flex: 1 },
  ipCard: { borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center", gap: 6 },
  ipLabel: { fontSize: 12, fontWeight: "500" },
  ipValue: { fontSize: 26, fontWeight: "bold" },
  pingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  pingText: { fontSize: 12 },
  errorBox: { alignItems: "center", gap: 10, paddingVertical: 8 },
  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 8, marginBottom: 4 },
  detailsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  detailRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  detailLabelRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600", maxWidth: "55%" },
  dnsCard: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  dnsIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  dnsName: { fontSize: 14, fontWeight: "600", textAlign: "right" },
  dnsIps: { fontSize: 12, textAlign: "right", marginTop: 2 },
});
