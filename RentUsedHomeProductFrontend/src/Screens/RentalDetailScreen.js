import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, User, Star, Package, AlertCircle } from "lucide-react-native";
import { Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";

export default function RentalDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRental();
  }, [id]);

  const fetchRental = async () => {
    try {
      const res = await axios.get(`${API_URL}/rental/${id}`);
      const item = res.data;
      
      const start = item.startDate ? new Date(item.startDate) : new Date();
      const end = item.endDate ? new Date(item.endDate) : new Date();
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

      let primaryImage = item.product?.primaryImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
      if (primaryImage.startsWith('/')) {
        primaryImage = IMAGE_BASE_URL + primaryImage;
      }

      setRental({
        id: item.rentalId,
        productImage: primaryImage,
        productName: item.product?.title || "Product",
        status: item.status?.toLowerCase() || "pending",
        totalAmount: item.totalAmount || 0,
        startDate: start.toLocaleDateString(),
        endDate: end.toLocaleDateString(),
        numberOfDays: diffDays,
        pricePerDay: item.product?.pricePerDay || 0,
        ownerName: item.owner?.username || "Owner",
        ownerRating: item.ownerRating || 0,
        canReturn: item.status?.toLowerCase() === "active"
      });
    } catch (error) {
      console.error("Fetch Rental Error:", error);
      Alert.alert("Error", "Could not load rental details. Please check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.errorContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!rental) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Rental not found</Text>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtnError}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleReturnClick = () => {
    Alert.alert(
      "Confirm Return",
      "Are you sure you want to request a return for this item? The owner will be notified to confirm receipt.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send Request", 
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/rental/status/${rental.id}`, "Awaiting_Return", {
                headers: { "Content-Type": "application/json" }
              });
              setRental({ ...rental, status: "awaiting_return", canReturn: false });
              Alert.alert("Request Sent", "Your return request has been sent to the owner.");
            } catch (error) {
              console.error("Failed to request return", error);
              Alert.alert("Error", "Failed to send return request");
            }
          } 
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return { bg: "#EFF6FF", text: "#1D4ED8" };
      case "completed":
        return { bg: "#DCFCE7", text: "#15803D" };
      case "awaiting_return":
        return { bg: "#FEF9C3", text: "#A16207" };
      case "return_approved":
        return { bg: "#F5F3FF", text: "#7C3AED" };
      default:
        return { bg: "#F3F4F6", text: "#4B5563" };
    }
  };

  const statusStyle = getStatusStyle(rental.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rental Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Card */}
        <View style={styles.card}>
          <Image source={{ uri: rental.productImage }} style={styles.productImage} />
          <View style={styles.cardInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.productName}>{rental.productName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {rental.status}
                </Text>
              </View>
            </View>

            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Total Amount Paid</Text>
              <Text style={styles.amountValue}>Rs. {rental.totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Duration Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#9333EA" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Rental Duration</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date:</Text>
            <Text style={styles.infoValue}>{rental.startDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date:</Text>
            <Text style={styles.infoValue}>{rental.endDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Days:</Text>
            <Text style={styles.daysValue}>{rental.numberOfDays} days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price per Day:</Text>
            <Text style={styles.infoValue}>Rs. {rental.pricePerDay.toLocaleString()}</Text>
          </View>
        </View>

        {/* Owner Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#9333EA" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Owner Information</Text>
          </View>
          
          <View style={styles.ownerBox}>
            <View style={styles.avatarCircle}>
              <User size={30} color="#9333EA" />
            </View>
            <View>
              <Text style={styles.ownerName}>{rental.ownerName}</Text>
              <View style={styles.ownerRatingRow}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.ownerRatingText}>
                  {rental.ownerRating} <Text style={styles.ratingLabel}>Owner Rating</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Banners */}
        {rental.canReturn && rental.status === "active" && (
          <View style={styles.alertBanner}>
            <View style={styles.alertHeader}>
              <AlertCircle size={20} color="#6D28D9" style={{ marginRight: 10 }} />
              <Text style={styles.alertTitle}>Ready to Return?</Text>
            </View>
            <Text style={styles.alertDesc}>
              Make sure the product is in good condition and packed with all accessories before return.
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Contact owner for pickup</Text>
              <Text style={styles.bulletItem}>• Clean the product if needed</Text>
              <Text style={styles.bulletItem}>• Pack all original accessories</Text>
            </View>
          </View>
        )}

        {rental.status === "completed" && (
          <View style={styles.completedBanner}>
            <Package size={40} color="#16A34A" style={{ marginBottom: 10 }} />
            <Text style={styles.completedTitle}>Rental Completed</Text>
            <Text style={styles.completedDesc}>
              This rental has been successfully completed and rated.
            </Text>
          </View>
        )}


      </ScrollView>

      {/* Footer Return Button */}
      {rental.canReturn && rental.status === "active" && (
        <SafeAreaView style={styles.footer}>
          <TouchableOpacity 
            style={styles.returnBtn}
            onPress={handleReturnClick}
          >
            <Text style={styles.returnBtnText}>Return Item</Text>
          </TouchableOpacity>
        </SafeAreaView>
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
    alignItems: "center",
    marginRight: 10,
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
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 20,
  },
  productImage: {
    width: "100%",
    height: 240,
  },
  cardInfo: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  amountCard: {
    backgroundColor: "#F5F3FF",
    padding: 16,
    borderRadius: 16,
  },
  amountLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9333EA",
  },
  section: {
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 10,
  },
  ownerBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  ownerRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ownerRatingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 5,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "normal",
  },
  alertBanner: {
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4C1D95",
  },
  alertDesc: {
    fontSize: 13,
    color: "#5B21B6",
    lineHeight: 18,
    marginBottom: 12,
  },
  bulletList: {
    gap: 4,
  },
  bulletItem: {
    fontSize: 12,
    color: "#5B21B6",
  },
  completedBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    alignItems: "center",
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 4,
  },
  completedDesc: {
    fontSize: 12,
    color: "#15803D",
    textAlign: "center",
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
  returnBtn: {
    backgroundColor: "#9333EA",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  returnBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
  },
  backBtnError: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#9333EA",
    borderRadius: 10,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
