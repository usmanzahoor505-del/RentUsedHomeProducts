import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, User, AlertCircle, Package } from "lucide-react-native";
import { format } from "date-fns";
import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";

export default function ReturnProcessScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rental, setRental] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchRental();
  }, [id]);

  const fetchRental = async () => {
    try {
      const res = await axios.get(`${API_URL}/rental/${id}`);
      setRental(res.data);
    } catch (error) {
      console.error("Fetch Rental Error:", error);
      Alert.alert("Error", "Failed to fetch rental details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !rental) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  const startDate = rental.startDate ? new Date(rental.startDate) : new Date();
  const endDate = rental.endDate ? new Date(rental.endDate) : new Date();
  const totalDays = Math.max(1, Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) || 1);
  const pricePerDay = rental.product?.pricePerDay || (rental.totalAmount ? rental.totalAmount / totalDays : 0);
  const totalAmount = rental.totalAmount != null ? rental.totalAmount : (pricePerDay * totalDays);

  let primaryImage = rental.product?.primaryImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
  if (primaryImage && primaryImage.startsWith('/')) {
    primaryImage = IMAGE_BASE_URL + primaryImage;
  }

  const handleReturn = () => {
    setShowConfirmation(true);
  };

  const handleConfirmReturn = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(`${API_URL}/rental/request-return/${id}`);
      setShowConfirmation(false);
      Alert.alert(
        "✅ Return Request Sent!",
        "Your return request has been submitted to the owner. Once the owner confirms receipt, the rental will be marked completed.",
        [
          { text: "View Status", onPress: () => navigate("/return-status/" + id) }
        ]
      );
    } catch (error) {
      console.error("Return error, trying fallback status update:", error);
      try {
        await axios.put(`${API_URL}/rental/status/${id}`, JSON.stringify("Awaiting_Return"), {
          headers: { "Content-Type": "application/json" }
        });
        setShowConfirmation(false);
        Alert.alert(
          "✅ Return Request Sent!",
          "Your return request has been submitted to the owner.",
          [
            { text: "View Status", onPress: () => navigate("/return-status/" + id) }
          ]
        );
      } catch (err2) {
        Alert.alert("Error", error.response?.data?.message || "Failed to submit return request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Product</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Package size={20} color="#9333EA" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>
          <View style={styles.productRow}>
            <Image source={{ uri: primaryImage }} style={styles.productImg} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{rental.product?.title}</Text>
              <Text style={styles.productPrice}>Rs. {Math.round(pricePerDay).toLocaleString()} / day</Text>
              {rental.product?.location && (
                <Text style={styles.productLocation}>📍 {rental.product.location}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Duration & Amount Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#9333EA" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Rental Duration & Payment</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date:</Text>
            <Text style={styles.infoValue}>{format(startDate, "MMM dd, yyyy")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date:</Text>
            <Text style={styles.infoValue}>{format(endDate, "MMM dd, yyyy")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Days:</Text>
            <Text style={styles.daysValue}>{totalDays} days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Daily Rate:</Text>
            <Text style={styles.infoValue}>Rs. {Math.round(pricePerDay).toLocaleString()} / day</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total Amount Paid:</Text>
            <Text style={styles.totalValue}>Rs. {Math.round(totalAmount).toLocaleString()}</Text>
          </View>
        </View>

        {/* Owner Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#9333EA" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Owner Information</Text>
          </View>
          <View style={styles.ownerRow}>
            <View style={styles.avatarBox}>
              <User size={24} color="#9333EA" />
            </View>
            <View>
              <Text style={styles.ownerName}>{rental.owner?.username}</Text>
              <Text style={styles.ownerRating}>⭐ {(rental.owner?.avgRating || rental.ownerRating || 5).toFixed(1)} Rating</Text>
              {rental.owner?.city && (
                <Text style={styles.ownerCity}>📍 {rental.owner.city}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <View style={styles.instructionHeader}>
            <AlertCircle size={20} color="#6D28D9" style={{ marginRight: 10 }} />
            <Text style={styles.instructionTitle}>Before Returning</Text>
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Ensure the product is in good condition</Text>
            <Text style={styles.bullet}>• Pack all accessories and original items</Text>
            <Text style={styles.bullet}>• Clean the product if needed</Text>
            <Text style={styles.bullet}>• Contact owner for return arrangements</Text>
          </View>
        </View>

        {/* Inline Confirmation Card */}
        {showConfirmation && (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Product Return?</Text>
            <Text style={styles.confirmDesc}>
              By confirming, you acknowledge that you are returning the product to {rental.owner?.username || "the owner"}. Total rental of Rs. {Math.round(totalAmount).toLocaleString()} was paid. The owner will inspect the product and confirm receipt.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmation(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtnInner, isSubmitting && { opacity: 0.7 }]} 
                onPress={handleConfirmReturn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmText}>Confirm Return</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Button */}
      {!showConfirmation && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleReturn}>
            <Text style={styles.confirmBtnText}>Return Product</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9333EA",
  },
  productLocation: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  daysValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9333EA",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  ownerRating: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  ownerCity: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  instructionBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    marginBottom: 20,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4C1D95",
  },
  bulletList: {
    gap: 6,
  },
  bullet: {
    fontSize: 12,
    color: "#5B21B6",
    lineHeight: 18,
  },
  confirmCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FBBF24",
    elevation: 8,
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  confirmBtnInner: {
    flex: 1,
    height: 48,
    backgroundColor: "#9333EA",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  confirmBtn: {
    backgroundColor: "#9333EA",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
