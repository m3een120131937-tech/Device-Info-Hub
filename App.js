import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ========== COLORS & CONSTANTS ==========
const COLORS = {
  primary: '#00CFFF', // Cyan
  secondary: '#A855F7', // Purple
  dark: '#0A0E27',
  darker: '#11152C',
  card: '#1A1F3A',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const LANGUAGE = {
  ar: {
    dashboard: 'لوحة التحكم',
    doctor: 'فحص الجهاز',
    diagnostics: 'الاختبارات',
    tools: 'الأدوات',
    network: 'الشبكة',
    ims: 'IMS',
    usb: 'USB',
    frp: 'FRP',
    ai: 'AI',
    activity: 'النشاط',
    reports: 'التقارير',
    settings: 'الإعدادات',
    about: 'عن التطبيق',
  },
  en: {
    dashboard: 'Dashboard',
    doctor: 'Device Doctor',
    diagnostics: 'Diagnostics',
    tools: 'Tools',
    network: 'Network',
    ims: 'IMS Manager',
    usb: 'USB Technician',
    frp: 'FRP Tools',
    ai: 'AI Assistant',
    activity: 'Activity Manager',
    reports: 'Reports',
    settings: 'Settings',
    about: 'About',
  },
};

// ========== DASHBOARD SCREEN ==========
const DashboardScreen = ({ navigation, language = 'ar' }) => {
  const [batteryLevel, setBatteryLevel] = useState(86);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const checkBattery = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        setBatteryLevel(Math.round(level * 100));
        setIsCharging(state === Battery.BatteryState.CHARGING);
      } catch (e) {
        console.log('Battery error');
      }
    };
    checkBattery();
  }, []);

  const deviceInfo = {
    name: 'Xiaomi 13 Pro',
    brand: 'Xiaomi',
    os: 'Android 14',
    processor: 'Snapdragon 8 Gen 2',
    ram: '12 GB',
    ramUsed: '8.5 GB',
    storage: '256 GB',
    storageUsed: '180 GB',
    ip: '192.168.1.105',
    network: '4G+',
    signal: 85,
  };

  const menuItems = [
    {
      id: 'doctor',
      title: language === 'ar' ? 'فحص الجهاز' : 'Device Doctor',
      icon: 'heart-circle',
      color: COLORS.secondary,
    },
    {
      id: 'diagnostics',
      title: language === 'ar' ? 'الاختبارات' : 'Diagnostics',
      icon: 'pulse',
      color: COLORS.success,
    },
    {
      id: 'tools',
      title: language === 'ar' ? 'الأدوات' : 'Tools Hub',
      icon: 'settings',
      color: COLORS.primary,
    },
    {
      id: 'network',
      title: language === 'ar' ? 'الشبكة' : 'Network Tools',
      icon: 'wifi',
      color: COLORS.info,
    },
    {
      id: 'ims',
      title: 'IMS Manager',
      icon: 'phone',
      color: COLORS.error,
    },
    {
      id: 'usb',
      title: language === 'ar' ? 'USB' : 'USB Technician',
      icon: 'usb',
      color: '#06B6D4',
    },
    {
      id: 'frp',
      title: language === 'ar' ? 'حماية FRP' : 'FRP Tools',
      icon: 'shield-lock',
      color: '#EC4899',
    },
    {
      id: 'ai',
      title: language === 'ar' ? 'مساعد ذكي' : 'AI Assistant',
      icon: 'sparkles',
      color: COLORS.secondary,
    },
    {
      id: 'activity',
      title: language === 'ar' ? 'النشاط' : 'Activity Manager',
      icon: 'list',
      color: '#14B8A6',
    },
    {
      id: 'reports',
      title: language === 'ar' ? 'التقارير' : 'Reports',
      icon: 'document-text',
      color: '#06B6D4',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Mainalasri</Text>
            <Text style={styles.appSub}>Technician Pro</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('settings')}
            style={styles.headerIcon}
          >
            <Ionicons name="settings" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Device Info Card with Glassmorphism */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.deviceName}>{deviceInfo.name}</Text>
              <Text style={styles.deviceInfo}>{deviceInfo.brand}</Text>
              <Text style={styles.deviceInfo}>{deviceInfo.os}</Text>
            </View>
            <Ionicons name="phone-portrait" size={50} color={COLORS.primary} />
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
              <Text style={styles.statValue}>{batteryLevel}%</Text>
              <Text style={styles.statLabel}>
                {language === 'ar' ? 'البطارية' : 'Battery'}
              </Text>
              <Ionicons
                name={isCharging ? 'battery-charging' : 'battery'}
                size={20}
                color={isCharging ? COLORS.success : COLORS.warning}
              />
            </View>

            <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
              <Text style={styles.statValue}>
                {Math.round(
                  (parseFloat(deviceInfo.ramUsed) /
                    parseFloat(deviceInfo.ram)) *
                    100
                )}
                %
              </Text>
              <Text style={styles.statLabel}>
                {language === 'ar' ? 'الذاكرة' : 'RAM'}
              </Text>
              <Ionicons
                name="barbell"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
              <Text style={styles.statValue}>
                {Math.round(
                  (parseFloat(deviceInfo.storageUsed) /
                    parseFloat(deviceInfo.storage)) *
                    100
                )}
                %
              </Text>
              <Text style={styles.statLabel}>
                {language === 'ar' ? 'التخزين' : 'Storage'}
              </Text>
              <Ionicons
                name="folder"
                size={20}
                color={COLORS.info}
              />
            </View>

            <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
              <Text style={styles.statValue}>{deviceInfo.signal}%</Text>
              <Text style={styles.statLabel}>
                {language === 'ar' ? 'الإشارة' : 'Signal'}
              </Text>
              <Ionicons
                name="signal"
                size={20}
                color={COLORS.success}
              />
            </View>
          </View>

          {/* Network Info */}
          <View style={styles.networkBox}>
            <View style={styles.networkItem}>
              <Ionicons
                name="wifi"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.networkText}>{deviceInfo.network}</Text>
            </View>
            <View style={styles.networkItem}>
              <Ionicons
                name="globe"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.networkText}>{deviceInfo.ip}</Text>
            </View>
          </View>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>
          {language === 'ar' ? 'الأدوات' : 'Tools'}
        </Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.id)}
              style={[
                styles.menuCard,
                {
                  backgroundColor: COLORS.card,
                  borderColor: item.color + '33',
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: item.color + '20' },
                ]}
              >
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('dashboard')}
          style={styles.navItem}
        >
          <Ionicons name="home" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('tools')}
          style={styles.navItem}
        >
          <Ionicons name="settings" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('reports')}
          style={styles.navItem}
        >
          <Ionicons name="document-text" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('settings')}
          style={styles.navItem}
        >
          <Ionicons name="settings-sharp" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ========== GENERIC TOOL SCREEN ==========
const ToolScreen = ({ title, navigation, features, language = 'ar' }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      {/* Header */}
      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {features &&
          features.map((feature, idx) => (
            <View
              key={idx}
              style={[
                styles.featureCard,
                { borderLeftColor: feature.color || COLORS.primary },
              ]}
            >
              <View style={styles.featureHeader}>
                <Ionicons
                  name={feature.icon}
                  size={24}
                  color={feature.color || COLORS.primary}
                />
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
              <Text style={styles.featureDesc}>{feature.description}</Text>

              {feature.data && (
                <View style={styles.featureData}>
                  {feature.data.map((item, i) => (
                    <View key={i} style={styles.dataRow}>
                      <Text style={styles.dataLabel}>{item.label}</Text>
                      <Text style={styles.dataValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {feature.buttons && (
                <View style={styles.buttonGroup}>
                  {feature.buttons.map((btn, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.actionButton,
                        { backgroundColor: btn.color || COLORS.primary },
                      ]}
                      onPress={btn.onPress}
                    >
                      <Ionicons
                        name={btn.icon}
                        size={16}
                        color={COLORS.text}
                      />
                      <Text style={styles.buttonText}>{btn.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ========== INDIVIDUAL SCREENS ==========

const DeviceDoctorScreen = ({ navigation }) => {
  const features = [
    {
      icon: 'pulse',
      title: 'فحص صحة الجهاز',
      description: 'اختبار شامل لجميع مكونات الجهاز',
      color: COLORS.success,
      data: [
        { label: 'حالة البطارية', value: 'ممتازة' },
        { label: 'درجة الحرارة', value: '42°C' },
        { label: 'الذاكرة', value: '8.5 GB / 12 GB' },
      ],
      buttons: [
        {
          icon: 'flash',
          label: 'فحص سريع',
          color: COLORS.info,
          onPress: () =>
            Alert.alert('✅', 'الفحص السريع اكتمل بنجاح'),
        },
        {
          icon: 'checkmark-circle',
          label: 'فحص كامل',
          color: COLORS.success,
          onPress: () =>
            Alert.alert('✅', 'الفحص الكامل قيد التنفيذ...'),
        },
      ],
    },
  ];

  return (
    <ToolScreen
      title="فحص الجهاز"
      navigation={navigation}
      features={features}
    />
  );
};

const DiagnosticsScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState({});

  const tests = [
    { id: 'display', name: 'الشاشة', icon: 'eye' },
    { id: 'touch', name: 'اللمس', icon: 'hand-left' },
    { id: 'speaker', name: 'السماعة', icon: 'volume-high' },
    { id: 'mic', name: 'الميكروفون', icon: 'mic' },
    { id: 'camera', name: 'الكاميرا', icon: 'camera' },
    { id: 'vibration', name: 'الاهتزاز', icon: 'flash' },
  ];

  const runTest = (testId) => {
    setTestResults({ ...testResults, [testId]: 'passed' });
    Alert.alert('✅ نجح', `اختبار ${testId} نجح`);
  };

  const features = [
    {
      icon: 'settings',
      title: 'الاختبارات المتاحة',
      description: 'اضغط على أي اختبار لتشغيله',
      color: COLORS.primary,
      data: tests.map((test) => ({
        label: test.name,
        value: testResults[test.id]
          ? '✅ نجح'
          : 'قيد الانتظار',
      })),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>الاختبارات</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.testGrid}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={[
                styles.testCard,
                {
                  backgroundColor: testResults[test.id]
                    ? COLORS.success + '20'
                    : COLORS.card,
                  borderColor: testResults[test.id]
                    ? COLORS.success
                    : COLORS.primary,
                },
              ]}
              onPress={() => runTest(test.id)}
            >
              <Ionicons
                name={test.icon}
                size={32}
                color={
                  testResults[test.id]
                    ? COLORS.success
                    : COLORS.primary
                }
              />
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testStatus}>
                {testResults[test.id] ? '✅ نجح' : 'اختبر'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ToolsHubScreen = ({ navigation }) => {
  const features = [
    {
      icon: 'usb',
      title: 'أدوات USB',
      description: 'إدارة اتصال USB والتعريفات',
      color: '#06B6D4',
      buttons: [
        {
          icon: 'flash',
          label: 'USB Debugging',
          color: COLORS.info,
          onPress: () =>
            Alert.alert('✅', 'تم تفعيل USB Debugging'),
        },
      ],
    },
    {
      icon: 'trash',
      title: 'تنظيف الجهاز',
      description: 'حذف الملفات المؤقتة والقوائم',
      color: COLORS.error,
      buttons: [
        {
          icon: 'flash',
          label: 'تنظيف سريع',
          color: COLORS.warning,
          onPress: () =>
            Alert.alert('✅', 'تم تنظيف 2.5 GB'),
        },
      ],
    },
  ];

  return (
    <ToolScreen
      title="أدوات"
      navigation={navigation}
      features={features}
    />
  );
};

const NetworkToolsScreen = ({ navigation }) => {
  const features = [
    {
      icon: 'wifi',
      title: 'Wi-Fi',
      description: 'معلومات وإعدادات الشبكة اللاسلكية',
      color: COLORS.info,
      data: [
        { label: 'الشبكة', value: 'WiFi-Home' },
        { label: 'السرعة', value: '54 Mbps' },
        { label: 'قوة الإشارة', value: '-45 dBm' },
      ],
    },
    {
      icon: 'phone',
      title: 'شبكة الجوال',
      description: '4G / 5G / LTE',
      color: COLORS.primary,
      data: [
        { label: 'نوع الشبكة', value: '4G LTE' },
        { label: 'قوة الإشارة', value: '85%' },
        { label: 'الشركة', value: 'STC' },
      ],
    },
  ];

  return (
    <ToolScreen
      title="أدوات الشبكة"
      navigation={navigation}
      features={features}
    />
  );
};

const IMSManagerScreen = ({ navigation }) => {
  const features = [
    {
      icon: 'phone',
      title: 'IMS Registration',
      description: 'حالة تسجيل IMS',
      color: COLORS.success,
      data: [
        { label: 'الحالة', value: 'مسجل ✅' },
        { label: 'VoLTE', value: 'مفعل' },
        { label: 'VoWiFi', value: 'مفعل' },
        { label: 'RCS', value: 'غير مفعل' },
      ],
      buttons: [
        {
          icon: 'refresh',
          label: 'إعادة التسجيل',
          color: COLORS.info,
          onPress: () =>
            Alert.alert('✅', 'تم إعادة تسجيل IMS'),
        },
      ],
    },
  ];

  return (
    <ToolScreen
      title="IMS Manager"
      navigation={navigation}
      features={features}
    />
  );
};

const USBTechnicianScreen = ({ navigation }) => {
  const features = [
    {
      icon: 'usb',
      title: 'أنماط USB',
      description: 'اختر نمط الاتصال المناسب',
      color: '#06B6D4',
      data: [
        { label: 'MTP', value: 'نقل الملفات' },
        { label: 'PTP', value: 'كاميرا' },
        { label: 'ADB', value: 'تطوير' },
        { label: 'Tethering', value: 'نقطة اتصال' },
      ],
      buttons: [
        {
          icon: 'flash',
          label: 'تفعيل ADB',
          color: COLORS.info,
          onPress: () =>
            Alert.alert('⚠️', 'لا توجد صلاحيات كافية'),
        },
      ],
    },
  ];

  return (
    <ToolScreen
      title="USB Technician"
      navigation={navigation}
      features={features}
    />
  );
};

const FRPToolsScreen = ({ navigation }) => {
  const features = [
    {
      icon: 'shield',
      title: 'حالة FRP',
      description: 'معلومات حماية إعادة التعيين',
      color: COLORS.primary,
      data: [
        { label: 'FRP Status', value: 'مفعل' },
        { label: 'حساب Google', value: 'user@gmail.com' },
        { label: 'الجهاز المرتبط', value: 'Xiaomi 13 Pro' },
      ],
      buttons: [
        {
          icon: 'lock-open',
          label: 'دليل الإزالة',
          color: COLORS.warning,
          onPress: () =>
            Alert.alert(
              'دليل',
              '1. افتح الإعدادات\n2. اذهب للحسابات\n3. أضف حساب Google جديد'
            ),
        },
      ],
    },
  ];

  return (
    <ToolScreen
      title="FRP Tools"
      navigation={navigation}
      features={features}
    />
  );
};

const AIAssistantScreen = ({ navigation }) => {
  const [suggestions, setSuggestions] = useState([
    {
      title: 'تحسين الأداء',
      description: 'أغلق التطبيقات التي تستهلك بطاريتك',
      icon: 'lightning-bolt',
    },
    {
      title: 'تنظيف الذاكرة',
      description: 'لديك 2.5 GB ملفات مؤقتة يمكن حذفها',
      icon: 'trash',
    },
    {
      title: 'حفظ البطارية',
      description: 'فعّل وضع توفير الطاقة للحصول على وقت أكثر',
      icon: 'battery',
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>مساعد ذكي</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.aiContainer}>
          {suggestions.map((sug, idx) => (
            <View
              key={idx}
              style={[
                styles.suggestionCard,
                { backgroundColor: COLORS.card },
              ]}
            >
              <Ionicons
                name={sug.icon}
                size={28}
                color={COLORS.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle}>{sug.title}</Text>
                <Text style={styles.suggestionDesc}>{sug.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ActivityManagerScreen = ({ navigation }) => {
  const [apps, setApps] = useState([
    {
      name: 'WhatsApp',
      memory: '245 MB',
      icon: 'chatbubble',
    },
    {
      name: 'Chrome',
      memory: '512 MB',
      icon: 'open',
    },
    {
      name: 'YouTube',
      memory: '356 MB',
      icon: 'play-circle',
    },
    {
      name: 'Gmail',
      memory: '128 MB',
      icon: 'mail',
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>مدير النشاط</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {apps.map((app, idx) => (
          <View
            key={idx}
            style={[
              styles.appCard,
              { backgroundColor: COLORS.card },
            ]}
          >
            <Ionicons
              name={app.icon}
              size={32}
              color={COLORS.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>{app.name}</Text>
              <Text style={styles.appMemory}>{app.memory}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('✅', `تم إيقاف ${app.name}`)
              }
              style={[
                styles.stopButton,
                { backgroundColor: COLORS.error + '20' },
              ]}
            >
              <Ionicons
                name="close"
                size={16}
                color={COLORS.error}
              />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ReportsScreen = ({ navigation }) => {
  const [showReport, setShowReport] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>التقارير</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.reportCard, { backgroundColor: COLORS.card }]}
          onPress={() => setShowReport(true)}
        >
          <Ionicons
            name="document-text"
            size={40}
            color={COLORS.primary}
          />
          <Text style={styles.reportTitle}>تقرير جهازي</Text>
          <Text style={styles.reportDate}>
            تم الإنشاء: 26/06/2026
          </Text>
        </TouchableOpacity>

        <View style={styles.reportContent}>
          <Text style={styles.reportHeading}>
            معلومات الجهاز
          </Text>
          <View style={styles.reportItem}>
            <Text style={styles.reportLabel}>اسم الجهاز:</Text>
            <Text style={styles.reportValue}>Xiaomi 13 Pro</Text>
          </View>
          <View style={styles.reportItem}>
            <Text style={styles.reportLabel}>نظام التشغيل:</Text>
            <Text style={styles.reportValue}>Android 14</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: COLORS.primary },
            ]}
            onPress={() =>
              Alert.alert('✅', 'تم تصدير التقرير كـ PDF')
            }
          >
            <Ionicons name="download" size={18} color={COLORS.dark} />
            <Text style={styles.exportText}>تصدير PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsScreen = ({ navigation }) => {
  const [language, setLanguage] = useState('ar');
  const [darkMode, setDarkMode] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>الإعدادات</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>
            التطبيق
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: COLORS.card },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="language"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>اللغة</Text>
            </View>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  {
                    backgroundColor:
                      language === 'ar'
                        ? COLORS.primary
                        : COLORS.darker,
                  },
                ]}
                onPress={() => setLanguage('ar')}
              >
                <Text
                  style={{
                    color: language === 'ar'
                      ? COLORS.dark
                      : COLORS.text,
                  }}
                >
                  العربية
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  {
                    backgroundColor:
                      language === 'en'
                        ? COLORS.primary
                        : COLORS.darker,
                  },
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text
                  style={{
                    color: language === 'en'
                      ? COLORS.dark
                      : COLORS.text,
                  }}
                >
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: COLORS.card },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="moon"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>
                الوضع الليلي
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: darkMode
                    ? COLORS.primary
                    : COLORS.darker,
                },
              ]}
            >
              <Ionicons
                name={darkMode ? 'moon' : 'sunny'}
                size={16}
                color={COLORS.dark}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const AboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />

      <View style={styles.toolHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.toolTitle}>عن التطبيق</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.aboutContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="phone-portrait" size={60} color={COLORS.primary} />
          </View>

          <Text style={styles.appTitle}>Mainalasri Technician Pro</Text>
          <Text style={styles.appVersion}>الإصدار 1.0.0</Text>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              تطبيق احترافي لفنيي صيانة الهواتف الذكية.
              يوفر أدوات متقدمة لفحص وتشخيص وإصلاح أجهزة
              Android.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>المطور:</Text>
              <Text style={styles.infoValue}>
                Mainalasri Development
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>البريد:</Text>
              <Text style={styles.infoValue}>
                info@mainalasri.pro
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الموقع:</Text>
              <Text style={styles.infoValue}>
                www.mainalasri.pro
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ========== MAIN APP ==========
export default function App() {
  let NavigationContainer;
  let createNativeStackNavigator;

  try {
    const navModule = require('@react-navigation/native');
    NavigationContainer = navModule.NavigationContainer;
    const stackModule = require('@react-navigation/native-stack');
    createNativeStackNavigator = stackModule.createNativeStackNavigator;
  } catch (e) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.error, textAlign: 'center', padding: 20 }}>
          خطأ: المكتبات غير مثبتة
        </Text>
      </View>
    );
  }

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <ExpoStatusBar style="light" backgroundColor={COLORS.dark} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.dark },
        }}
      >
        <Stack.Screen name="dashboard" component={DashboardScreen} />
        <Stack.Screen name="doctor" component={DeviceDoctorScreen} />
        <Stack.Screen name="diagnostics" component={DiagnosticsScreen} />
        <Stack.Screen name="tools" component={ToolsHubScreen} />
        <Stack.Screen name="network" component={NetworkToolsScreen} />
        <Stack.Screen name="ims" component={IMSManagerScreen} />
        <Stack.Screen name="usb" component={USBTechnicianScreen} />
        <Stack.Screen name="frp" component={FRPToolsScreen} />
        <Stack.Screen name="ai" component={AIAssistantScreen} />
        <Stack.Screen name="activity" component={ActivityManagerScreen} />
        <Stack.Screen name="reports" component={ReportsScreen} />
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="about" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appSub: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  headerIcon: {
    padding: 8,
  },
  glassCard: {
    backgroundColor: COLORS.card + 'CC',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    backdropFilter: 'blur(10px)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deviceInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.darker,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  networkBox: {
    backgroundColor: COLORS.darker,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkText: {
    fontSize: 12,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 12,
  },
  menuCard: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '33',
  },
  navItem: {
    padding: 8,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '33',
  },
  backButton: {
    padding: 8,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  featureData: {
    backgroundColor: COLORS.darker,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '33',
  },
  dataLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dataValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 12,
  },
  testCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  testName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  testStatus: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  aiContainer: {
    marginVertical: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  suggestionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  appName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appMemory: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
  },
  reportDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  reportContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  reportHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '33',
  },
  reportLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  reportValue: {
    fontSize: 11,
    color: COLORS.text,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  exportText: {
    color: COLORS.dark,
    fontWeight: '600',
    fontSize: 12,
  },
  settingSection: {
    marginVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appVersion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  aboutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    width: '100%',
  },
  aboutText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  infoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '33',
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});