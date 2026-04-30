import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { CheckCircle, Clock, Star, ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ReturnStatusScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.successCircle}>
            <CheckCircle size={64} color="#FFFFFF" />
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Returned Successfully</Text>
          <Text style={styles.cardSubtitle}>Your return has been registered</Text>

          {/* Alert Box */}
          <View style={styles.alertBox}>
            <Clock size={20} color="#D97706" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Awaiting Owner Confirmation</Text>
              <Text style={styles.alertText}>
                The owner will review the product condition and confirm the return. You will be notified once confirmed.
              </Text>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Owner Reviews Product</Text>
                <Text style={styles.stepDesc}>The owner will check the condition of the returned item</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Return Confirmed</Text>
                <Text style={styles.stepDesc}>Once confirmed, you'll be notified via app</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Rate Your Experience</Text>
                <Text style={styles.stepDesc}>Share your feedback about the rental Process</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity 
            style={styles.rateBtn}
            onPress={() => navigate("/ratings")}
          >
            <Star size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.rateBtnText}>Rate Now</Text>
            <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeBtn}
            onPress={() => navigate("/home")}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <Text style={styles.footerNote}>
          You can track your rental history and returns in the "My Rentals" section
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 32,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  alertBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: "#B45309",
    lineHeight: 18,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9333EA",
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: "#6B7280",
  },
  rateBtn: {
    backgroundColor: "#9333EA",
    height: 60,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  rateBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeBtn: {
    backgroundColor: "#FFFFFF",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9333EA",
  },
  homeBtnText: {
    color: "#9333EA",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerNote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});
