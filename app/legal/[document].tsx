import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEGAL_UPDATED, PRIVACY_SECTIONS, TERMS_SECTIONS } from "../../data/legalDocuments";
import { useTheme } from "../../theme/useTheme";

export default function LegalDocumentScreen() {
  const router = useRouter();
  const { document } = useLocalSearchParams<{ document: string }>();
  const { colors } = useTheme();
  const isPrivacy = document === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name={isPrivacy ? "shield-checkmark-outline" : "document-text-outline"} size={27} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.updated, { color: colors.textSecondary }]}>Last updated {LEGAL_UPDATED}</Text>

        <View style={[styles.ownerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="person-circle-outline" size={21} color={colors.primary} />
          <Text style={[styles.ownerText, { color: colors.textSecondary }]}>Zimbabwe Traditional Recipes · Praise Masunga · praisetechzw@gmail.com</Text>
        </View>

        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>{section.heading}</Text>
            {section.body.split("\n\n").map((paragraph, index) => (
              <Text key={`${section.heading}-${index}`} style={[styles.paragraph, { color: colors.textSecondary }]}>{paragraph}</Text>
            ))}
          </View>
        ))}

        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:praisetechzw@gmail.com?subject=${encodeURIComponent(title)}`)}
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
          <Text style={styles.contactText}>Email us about this policy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "900" },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 44 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: "900", letterSpacing: -0.5 },
  updated: { fontSize: 12, fontWeight: "600", marginTop: 6, marginBottom: 18 },
  ownerCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 15, padding: 13, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 22 },
  ownerText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  section: { marginBottom: 21 },
  sectionHeading: { fontSize: 16, lineHeight: 22, fontWeight: "800", marginBottom: 8 },
  paragraph: { fontSize: 13, lineHeight: 20, marginBottom: 9 },
  contactButton: { minHeight: 48, borderRadius: 15, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 2 },
  contactText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
