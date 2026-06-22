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
  ActivityIndicator 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons'; // مكتبة أيقونات جاهزة في Expo

// --- الشاشات (Screens) ---

// 1. الشاشة الرئيسية
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>مراقب الجهاز الذكي</Text>
      <Text style={styles.subtitle}>مراقبة حالة البطارية والشبكة</Text>
      
      <View style={styles.card}>
        <Ionicons name="battery-charging" size={40} color="#10b981" />
        <Text style={styles.cardTitle}>البطارية</Text>
        <Text style={styles.cardDesc}>مستوى الشحن وحالة التفعيل</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log("تم الضغط على البطارية - الانتقال...");
            navigation.navigate('Battery');
          }}
        >
          <Text style={styles.buttonText}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Ionicons name="wifi" size={40} color="#3b82f6" />
        <Text style={styles.cardTitle}>الشبكة</Text>
        <Text style={styles.cardDesc}>اتصال الإنترنت ونوعه</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log("تم الضغط على الشبكة - الانتقال...");
            navigation.navigate('Network');
          }}
        >
          <Text style={styles.buttonText}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Ionicons name="information-circle" size={40} color="#8b5cf6" />
        <Text style={styles.cardTitle}>معلومات الجهاز</Text>
        <Text style={styles.cardDesc}>نوع الجهاز والإصدار</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log("تم الضغط على معلومات الجهاز - الانتقال...");
            Alert.alert("تنبيه", "هذه الميزة قيد التطوير قريباً!");
            // navigation.navigate('DeviceInfo'); // يمكنك تفعيلها مستقبلاً
          }}
        >
          <Text style={styles.buttonText}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 2. شاشة البطارية
const BatteryScreen = ({ navigation }) => {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isCharging, setIsCharging] = useState(null);

  useEffect(() => {
    const checkBattery = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        
        setBatteryLevel(Math.round(level * 100));
        setIsCharging(state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL);
      } catch (e) {
        Alert.alert("خطأ", "تعذر قراءة بيانات البطارية");
      }
    };
    checkBattery();
    
    // الاستماع للتغييرات
    const subscription = Battery.addBatteryStateListener((state) => {
       // تحديث فوري إذا لزم الأمر
    });
    
    return () => subscription && subscription.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل البطارية</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.batteryBox}>
          <Ionicons name="battery-charging" size={80} color={isCharging ? "#10b981" : "#fbbf24"} />
          <Text style={styles.batteryText}>{batteryLevel !== null ? `${batteryLevel}%` : 'جاري التحميل...'}</Text>
          <Text style={styles.batterySub}>
            {isCharging ? 'الشحن جاري' : 'الاستخدام الطبيعي'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert("تحديث", "تم تحديث البيانات يدوياً")}
        >
          <Text style={styles.buttonText}>تحديث الآن</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 3. شاشة الشبكة
const NetworkScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(null);
  const [type, setType] = useState('جاري الفحص...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const netInfo = await require('@react-native-community/netinfo').fetch();
        setIsConnected(netInfo.isConnected);
        setType(netInfo.type || 'غير معروف');
      } catch (e) {
        setIsConnected(false);
        setType('خطأ في الاتصال');
      }
    };
    checkConnection();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حالة الشبكة</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.networkBox}>
          <Ionicons 
            name={isConnected ? "wifi" : "wifi-outline"} 
            size={80} 
            color={isConnected ? "#3b82f6" : "#ef4444"} 
          />
          <Text style={styles.batteryText}>
            {isConnected === null ? 'جاري الفحص...' : (isConnected ? 'متصل' : 'غير متصل')}
          </Text>
          <Text style={styles.batterySub}>نوع الاتصال: {type.toUpperCase()}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- التطبيق الرئيسي (App) مع التهيئة الصحيحة للملاحة ---

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // نستخدم NavigationContainer فقط إذا كانت المكتبة مثبتة
  // لضمان العمل حتى لو لم تكن مثبتة، نستخدم شرط بسيط
  let NavigationContainer;
  let createNativeStackNavigator;
  
  try {
    // محاولة تحميل مكتبة التنقل
    const navModule = require('@react-navigation/native');
    NavigationContainer = navModule.NavigationContainer;
    const stackModule = require('@react-navigation/native-stack');
    createNativeStackNavigator = stackModule.createNativeStackNavigator;
  } catch (e) {
    // إذا لم تكن مثبتة، نعرض رسالة خطأ
    return (
      <View style={styles.container}>
        <Text style={{color: 'red', textAlign: 'center', padding: 20}}>
          تنبيه: مكتبة التنقل غير مثبتة.
          <Text style={{fontWeight: 'bold', display: 'block', marginTop: 10}}>
            يرجى تشغيل الأمر: npm install @react-navigation/native @react-navigation/native-stack
          </Text>
        </Text>
      </View>
    );
  }

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <ExpoStatusBar style="light" backgroundColor="#0f172a" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Battery" component={BatteryScreen} />
        <Stack.Screen name="Network" component={NetworkScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- الأنماط (Styles) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  batteryText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  batterySub: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 5,
  },
  networkBox: {
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
});