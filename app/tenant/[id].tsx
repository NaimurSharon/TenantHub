/**
 * Tenant Hub Detail Screen — shows tenant info + tabs.
 * Tabs: Transactions, Invoices, Receipts, Credit Memos, Documents, Contacts, Profile
 */
import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Phone,
  Mail,
  Building2,
  User,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { colors, fonts, radii, shadows, spacing } from "@/theme";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/api/types";
import type { Contact, ContactInput } from "@/lib/api/types";

const TABS = [
  "Transactions",
  "Invoices",
  "Receipts",
  "Credit Memos",
  "Documents",
  "Contacts",
  "Profile",
] as const;

type TabName = (typeof TABS)[number];

export default function TenantHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Number(id);

  const [activeTab, setActiveTab] = useState<TabName>("Invoices");

  // Hub data — single request that has everything
  const {
    data: hubData,
    isLoading: hubLoading,
    isError: hubError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["tenant-hub", customerId],
    queryFn: () => api.tenants.hub(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60_000,
    retry: 2,
  });

  // Also fetch tenant detail for the summary card (fast)
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ["tenant", customerId],
    queryFn: () => api.tenants.getById(customerId),
    enabled: !!customerId,
  });

  // Use hub contacts, or fetch separately for mutations
  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ["tenant-contacts", customerId],
    queryFn: () => api.tenants.contacts(customerId),
    enabled: !!customerId && activeTab === "Contacts",
  });

  const isLoading = tenantLoading && hubLoading;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={hubData?.header?.display_name ?? tenant?.name ?? "Tenant Hub"}
        onBack={() => router.back()}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading Tenant Hub...</Text>
        </View>
      ) : (
        <>
          {/* Tenant Summary Card */}
          {(tenant || hubData?.header) && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.tenantName}>{tenant?.name ?? hubData?.header?.display_name ?? ""}</Text>
                  {tenant?.companyName ? (
                    <View style={styles.companyRow}>
                      <Building2 size={13} color={colors.mutedForeground} />
                      <Text style={styles.companyText}>{tenant.companyName}</Text>
                    </View>
                  ) : null}
                  {hubData?.header?.customer_code ? (
                    <Text style={styles.customerCode}>{hubData.header.customer_code}</Text>
                  ) : null}
                </View>
                <View style={styles.summaryRight}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={[
                    styles.balanceValue,
                    (hubData?.header?.current_balance ?? hubData?.summary?.running_balance ?? tenant?.balance ?? 0) > 0 && { color: colors.destructive },
                  ]}>
                    {formatCurrency(hubData?.header?.current_balance ?? hubData?.summary?.running_balance ?? tenant?.balance ?? 0)}
                  </Text>
                </View>
              </View>
              {hubData?.summary && (
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatCurrency(hubData.summary.invoice_total ?? 0)}</Text>
                    <Text style={styles.statLabel}>Invoiced</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatCurrency(hubData.summary.receipt_total ?? 0)}</Text>
                    <Text style={styles.statLabel}>Received</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{hubData.summary.active_lease_count ?? 0}</Text>
                    <Text style={styles.statLabel}>Leases</Text>
                  </View>
                </View>
              )}
              <View style={styles.summaryMeta}>
                {(tenant?.unit || hubData?.units?.[0]?.unit?.unit_name) ? (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>Unit: {tenant?.unit || hubData?.units?.[0]?.unit?.unit_name}</Text>
                  </View>
                ) : null}
                {tenant?.phone ? (
                  <View style={styles.metaChip}>
                    <Phone size={11} color={colors.mutedForeground} />
                    <Text style={styles.metaChipText}>{tenant.phone}</Text>
                  </View>
                ) : null}
                {tenant?.email ? (
                  <View style={styles.metaChip}>
                    <Mail size={11} color={colors.mutedForeground} />
                    <Text style={styles.metaChipText}>{tenant.email}</Text>
                  </View>
                ) : null}
                {hubData?.header?.status ? (
                  <View style={[styles.metaChip, hubData.header.status === "active" && { backgroundColor: colors.successLight }]}>
                    <Text style={[styles.metaChipText, hubData.header.status === "active" && { color: colors.success }]}>
                      {hubData.header.status}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab);
                }}
                style={[
                  styles.tab,
                  activeTab === tab && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tab Content */}
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={colors.primary}
              />
            }
          >
            {activeTab === "Contacts" && (
              <ContactsTab
                customerId={customerId}
                contacts={contacts}
                onRefresh={refetchContacts}
              />
            )}
            {activeTab === "Invoices" && (
              hubLoading ? <TabLoader /> : <DataListTab data={hubData?.invoices ?? []} type="invoice" />
            )}
            {activeTab === "Receipts" && (
              hubLoading ? <TabLoader /> : <DataListTab data={hubData?.receipts ?? []} type="receipt" />
            )}
            {activeTab === "Transactions" && (
              hubLoading ? <TabLoader /> : <DataListTab data={hubData?.transactions ?? []} type="transaction" />
            )}
            {activeTab === "Credit Memos" && (
              hubLoading ? <TabLoader /> : <DataListTab data={hubData?.credit_memos ?? []} type="credit_memo" />
            )}
            {activeTab === "Documents" && (
              hubLoading ? <TabLoader /> : <DataListTab data={hubData?.documents ?? []} type="document" />
            )}
            {activeTab === "Profile" && (tenant || hubData) && <ProfileTab tenant={tenant ?? hubData?.header} summary={hubData?.summary} />}
          </ScrollView>
        </>
      )}
    </View>
  );
}

/* ── Tab Loader ───────────────────────────────────────── */
function TabLoader() {
  return (
    <View style={styles.emptyTab}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.emptyText, { marginTop: 8 }]}>Loading records...</Text>
    </View>
  );
}

/* ── Contacts Tab ─────────────────────────────────────── */
function ContactsTab({
  customerId,
  contacts,
  onRefresh,
}: {
  customerId: number;
  contacts: Contact[];
  onRefresh: () => void;
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactInput>({
    contact_name: "",
    designation: "",
    email: "",
    mobile: "",
    is_primary: false,
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: (input: ContactInput) => api.tenants.createContact(customerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-contacts", customerId] });
      Toast.show({ type: "success", text1: "Contact created" });
      resetForm();
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ContactInput> }) =>
      api.tenants.updateContact(customerId, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-contacts", customerId] });
      Toast.show({ type: "success", text1: "Contact updated" });
      resetForm();
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (contactId: number) => api.tenants.deleteContact(customerId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-contacts", customerId] });
      Toast.show({ type: "success", text1: "Contact deleted" });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.message }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setForm({ contact_name: "", designation: "", email: "", mobile: "", is_primary: false, is_active: true });
  };

  const startEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({
      contact_name: c.contact_name,
      designation: c.designation ?? "",
      email: c.email ?? "",
      mobile: c.mobile ?? "",
      is_primary: c.is_primary,
      is_active: c.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.contact_name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, input: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <View>
      {/* Add button */}
      {!showForm && (
        <Pressable
          onPress={() => setShowForm(true)}
          style={styles.addContactBtn}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={styles.addContactText}>Add Contact</Text>
        </Pressable>
      )}

      {/* Form */}
      {showForm && (
        <View style={styles.contactForm}>
          <Text style={styles.formTitle}>
            {editingContact ? "Edit Contact" : "New Contact"}
          </Text>
          <Input
            label="Name"
            value={form.contact_name}
            onChangeText={(v) => setForm({ ...form, contact_name: v })}
            placeholder="Contact name"
          />
          <Input
            label="Designation"
            value={form.designation ?? ""}
            onChangeText={(v) => setForm({ ...form, designation: v })}
            placeholder="e.g. Manager"
          />
          <Input
            label="Email"
            value={form.email ?? ""}
            onChangeText={(v) => setForm({ ...form, email: v })}
            placeholder="email@example.com"
            keyboardType="email-address"
          />
          <Input
            label="Mobile"
            value={form.mobile ?? ""}
            onChangeText={(v) => setForm({ ...form, mobile: v })}
            placeholder="+971..."
            keyboardType="phone-pad"
          />
          <View style={styles.formActions}>
            <Button variant="outline" size="sm" onPress={resetForm} style={{ flex: 1, marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onPress={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{ flex: 1 }}
            >
              {editingContact ? "Update" : "Create"}
            </Button>
          </View>
        </View>
      )}

      {/* Contact List */}
      {contacts.length === 0 && !showForm ? (
        <View style={styles.emptyTab}>
          <User size={32} color={colors.mutedForeground} />
          <Text style={styles.emptyText}>No contacts yet</Text>
        </View>
      ) : (
        contacts.map((c) => (
          <View key={c.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{c.contact_name}</Text>
              {c.designation ? (
                <Text style={styles.contactDetail}>{c.designation}</Text>
              ) : null}
              {c.email ? (
                <Text style={styles.contactDetail}>{c.email}</Text>
              ) : null}
              {c.mobile ? (
                <Text style={styles.contactDetail}>{c.mobile}</Text>
              ) : null}
              {c.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
            <View style={styles.contactActions}>
              <Pressable onPress={() => startEdit(c)} hitSlop={8} style={styles.contactActionBtn}>
                <Pencil size={15} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => deleteMutation.mutate(c.id)}
                hitSlop={8}
                style={styles.contactActionBtn}
              >
                <Trash2 size={15} color={colors.destructive} />
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

/* ── Generic Data List Tab ─────────────────────────────── */
function DataListTab({ data, type }: { data: any[]; type: string }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Text style={styles.emptyText}>No {type.replace("_", " ")}s found</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.tabCount}>{data.length} record{data.length !== 1 ? "s" : ""}</Text>
      {data.slice(0, 50).map((item, idx) => {
        const label = item.number ?? item.invoice_no ?? item.receipt_no ?? item.label ?? `#${item.id ?? idx + 1}`;
        const amount = Number(item.total_amount ?? item.amount ?? item.balance_amount ?? 0);
        const date = item.date ?? item.invoice_date ?? item.receipt_date ?? item.sort_date ?? item.created_at;
        const dateStr = date ? date.split("T")[0] : "";
        const status = item.status ?? "";
        const invoiceType = item.invoice_type ?? "";

        return (
          <View key={item.id ?? idx} style={styles.dataCard}>
            <View style={styles.dataCardRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.dataCardLabel} numberOfLines={1}>{label}</Text>
                {invoiceType ? <Text style={styles.dataCardType}>{invoiceType}</Text> : null}
              </View>
              <Text style={[styles.dataCardValue, amount < 0 && { color: colors.destructive }]}>
                {formatCurrency(Math.abs(amount))}
              </Text>
            </View>
            <View style={styles.dataCardFooter}>
              {dateStr ? <Text style={styles.dataCardDate}>{dateStr}</Text> : null}
              {status ? (
                <View style={[
                  styles.statusChip,
                  status === "paid" && styles.statusPaid,
                  status === "posted" && styles.statusPosted,
                ]}>
                  <Text style={[
                    styles.statusText,
                    status === "paid" && styles.statusTextPaid,
                    status === "posted" && styles.statusTextPosted,
                  ]}>
                    {status}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
      {data.length > 50 && (
        <Text style={styles.moreText}>Showing first 50 of {data.length}</Text>
      )}
    </View>
  );
}

/* ── Profile Tab ──────────────────────────────────────── */
function ProfileTab({ tenant, summary }: { tenant: any; summary?: any }) {
  const fields = [
    { label: "Name", value: tenant.name ?? tenant.display_name },
    { label: "Company", value: tenant.companyName ?? tenant.contact_person },
    { label: "Unit", value: tenant.unit },
    { label: "Phone", value: tenant.phone },
    { label: "Email", value: tenant.email },
    { label: "Status", value: tenant.status },
  ].filter((f) => f.value);

  const summaryFields = summary ? [
    { label: "Invoice Total", value: formatCurrency(summary.invoice_total ?? 0) },
    { label: "Receipt Total", value: formatCurrency(summary.receipt_total ?? 0) },
    { label: "Running Balance", value: formatCurrency(summary.running_balance ?? 0) },
    { label: "Outstanding", value: formatCurrency(summary.outstanding_amount ?? 0) },
    { label: "Active Leases", value: String(summary.active_lease_count ?? 0) },
    { label: "Units", value: String(summary.unit_count ?? 0) },
    { label: "Next Expiry", value: summary.next_expiry_date ?? "-" },
  ] : [];

  return (
    <View>
      <View style={styles.profileContainer}>
        <Text style={styles.profileSectionTitle}>Tenant Info</Text>
        {fields.map((f) => (
          <View key={f.label} style={styles.profileRow}>
            <Text style={styles.profileLabel}>{f.label}</Text>
            <Text style={styles.profileValue}>{f.value}</Text>
          </View>
        ))}
      </View>
      {summaryFields.length > 0 && (
        <View style={[styles.profileContainer, { marginTop: 12 }]}>
          <Text style={styles.profileSectionTitle}>Financial Summary</Text>
          {summaryFields.map((f) => (
            <View key={f.label} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{f.label}</Text>
              <Text style={styles.profileValue}>{f.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: radii.lg,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.card,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLeft: { flex: 1, marginRight: 12 },
  summaryRight: { alignItems: "flex-end" },
  tenantName: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground },
  customerCode: { fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  companyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.mutedForeground },
  balanceLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground },
  balanceValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.success, marginTop: 2 },
  summaryStats: { flexDirection: "row", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSoft, gap: 0 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
  summaryMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  metaChipText: { fontFamily: fonts.medium, fontSize: 11, color: colors.foregroundSoft },

  // Tabs
  tabScroll: {
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    flexGrow: 0,
    height: 44,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 4,
    height: 44,
  },
  tab: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.foregroundSoft,
  },
  tabTextActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  // Tab Content
  tabContent: { flex: 1, marginTop: 12, paddingHorizontal: 16 },

  // Empty state
  emptyTab: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { fontFamily: fonts.medium, fontSize: 14, color: colors.mutedForeground },

  // Data cards (invoices, receipts, transactions)
  dataCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  dataCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  dataCardLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.foreground },
  dataCardType: { fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  dataCardValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.success },
  dataCardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  dataCardDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedForeground },
  dataCardDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.foregroundSoft, marginTop: 4 },
  tabCount: { fontFamily: fonts.medium, fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  moreText: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedForeground, textAlign: "center", marginTop: 8, marginBottom: 16 },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
  },
  statusPaid: { backgroundColor: colors.successLight },
  statusPosted: { backgroundColor: "#EEF2FF" },
  statusText: { fontFamily: fonts.medium, fontSize: 11, color: colors.foregroundSoft },
  statusTextPaid: { color: colors.success },
  statusTextPosted: { color: "#4F46E5" },

  // Contacts
  addContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    alignSelf: "flex-start",
  },
  addContactText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
  contactCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  contactInfo: { flex: 1 },
  contactName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.foreground },
  contactDetail: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  primaryBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  primaryBadgeText: { fontFamily: fonts.medium, fontSize: 10, color: colors.primary },
  contactActions: { justifyContent: "center", gap: 12 },
  contactActionBtn: { padding: 4 },

  // Contact Form
  contactForm: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground, marginBottom: 14 },
  formActions: { flexDirection: "row", gap: 10, marginTop: 8 },

  // Profile
  profileContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileSectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground, marginBottom: 10 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  profileLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.mutedForeground },
  profileValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.foreground },
});
