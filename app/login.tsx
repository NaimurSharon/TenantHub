/**
 * Login Screen
 */
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { fonts } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Please enter email and password" });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      const { token, user } = await api.auth.login(email.trim(), password);
      setAuth(token, user);
      router.replace("/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Please check your credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.branding}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>KT</Text>
          </View>
          <Text style={styles.appName}>KADER TOWER</Text>
          <Text style={styles.tagline}>Property Management System</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Sign In</Text>
          <Text style={styles.cardSub}>Enter your credentials to continue</Text>

          {/* Email Field */}
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="admin@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password Field */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#94A3B8" />
              ) : (
                <Eye size={20} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>

          {/* === LOGIN BUTTON === */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Clear */}
          <TouchableOpacity
            onPress={() => { setEmail(""); setPassword(""); }}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text style={styles.clearBtnText}>Clear Fields</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footer}>Powered by SiscoTek  ·  </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://dev.kadertower.com/payment-terms")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  branding: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: "#FFFFFF",
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: "#0F172A",
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: "#0F172A",
    paddingVertical: 0,
  },
  loginButton: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  loginButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  clearBtn: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  clearBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#94A3B8",
    textDecorationLine: "underline",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  footer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#94A3B8",
  },
  privacyLink: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#2563EB",
    textDecorationLine: "underline",
  },
});
