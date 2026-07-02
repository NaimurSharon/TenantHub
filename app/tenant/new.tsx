/**
 * Add New Tenant — form matching the real POST /customers API.
 * Required: display_name, customer_type
 * Optional: contact_person, email, phone, address, national_id_no, trade_license_no
 */
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

import { colors, fonts, radii, shadows } from "@/theme";
import { useCreateTenant } from "@/hooks/queries/useTenantQuery";
import { createTenantSchema } from "@/lib/validation";

const CUSTOMER_TYPES = [
  { key: "individual", label: "Individual" },
  { key: "company", label: "Company" },
] as const;

export default function AddTenantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createMutation = useCreateTenant();

  const [form, setForm] = useState({
    display_name: "",
    customer_type: "individual" as "individual" | "company",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    national_id_no: "",
    trade_license_no: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = async () => {
    const parsed = createTenantSchema.safeParse({
      display_name: form.display_name.trim(),
      customer_type: form.customer_type,
      contact_person: form.contact_person.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      national_id_no: form.national_id_no.trim() || undefined,
      trade_license_no: form.trade_license_no.trim() || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const field = e.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Strip undefined values so we only send non-empty fields
    const payload = Object.fromEntries(
      Object.entries(parsed.data).filter(([_, v]) => v !== undefined && v !== "")
    );

    createMutation.mutate(payload, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Tenant created successfully" });
        router.back();
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const status = err?.status;
        const msg = err?.message ?? "Unknown error";
        if (status === 422 && err?.body?.errors) {
          const fieldErrors: Record<string, string> = {};
          const serverErrors = err.body.errors;
          Object.keys(serverErrors).forEach((key) => {
            fieldErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key];
          });
          setErrors(fieldErrors);
          Toast.show({ type: "error", text1: "Please fix the highlighted fields" });
        } else if (status === 500) {
          Toast.show({
            type: "error",
            text1: "Server unavailable",
            text2: "Customer creation is not available on this server. Contact your administrator.",
            visibilityTime: 6000,
          });
        } else {
          Toast.show({ type: "error", text1: "Failed to create tenant", text2: msg });
        }
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Tenant</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Customer Type Toggle */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Type *</Text>
          <View style={styles.typeRow}>
            {CUSTOMER_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => updateField("customer_type", t.key)}
                style={[
                  styles.typeBtn,
                  form.customer_type === t.key && styles.typeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    form.customer_type === t.key && styles.typeBtnTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Name Fields */}
        <Input
          label="Display Name *"
          placeholder="e.g. Acme Corporation or Rowshon Ali"
          value={form.display_name}
          onChangeText={(v) => updateField("display_name", v)}
          error={errors.display_name}
        />

        <Input
          label="Contact Person"
          placeholder="e.g. John Doe / Owner"
          value={form.contact_person}
          onChangeText={(v) => updateField("contact_person", v)}
          error={errors.contact_person}
        />

        <Input
          label="Email Address"
          placeholder="e.g. corporate@company.com"
          value={form.email}
          onChangeText={(v) => updateField("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Phone Number"
          placeholder="e.g. 0501234567"
          value={form.phone}
          onChangeText={(v) => updateField("phone", v)}
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Input
          label="Address"
          placeholder="e.g. Level 2, Kader Tower"
          value={form.address}
          onChangeText={(v) => updateField("address", v)}
          multiline
          error={errors.address}
        />

        {form.customer_type === "individual" ? (
          <Input
            label="National ID / Passport Number"
            placeholder="e.g. 784-1992-..."
            value={form.national_id_no}
            onChangeText={(v) => updateField("national_id_no", v)}
            error={errors.national_id_no}
          />
        ) : (
          <Input
            label="Trade License Number"
            placeholder="e.g. TL-100234"
            value={form.trade_license_no}
            onChangeText={(v) => updateField("trade_license_no", v)}
            error={errors.trade_license_no}
          />
        )}

        {/* Save Button */}
        <Button
          onPress={handleSave}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.saveBtn}
        >
          Save Tenant
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    ...shadows.soft,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.foregroundSoft,
    marginBottom: 6,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.foregroundSoft,
  },
  typeBtnTextActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  saveBtn: {
    marginTop: 12,
    marginBottom: 40,
  },
});
