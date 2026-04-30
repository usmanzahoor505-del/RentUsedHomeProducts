import React, { useEffect } from "react";
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
import { CheckCircle, Calendar, User, MapPin } from "lucide-react-native";
import { useDateFilter } from "../context/DateFilterContext";
import { format } from "date-fns";
import axios from "axios";
import { API_URL } from "../utils/api";
import { ActivityIndicator } from "react-native";

export default function BookingConfirmationScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [booking, setBooking] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await axios.get(`${API_URL}/rental/${id}`);
        setBooking(res.data);
      } catch (error) {
        console.error("Failed to fetch rental confirmation", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchRental();

    const timer = setTimeout(() => {
      navigate("/home");
    }, 10000); 

    return () => clearTimeout(timer);
  }, [id, navigate]);

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <CheckCircle size={60} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={styles.successTitle}>Request Sent!</Text>
          <Text style={styles.successSubtitle}>
            Your booking request has been sent to the owner
          </Text>
        </View>

        {/* Confirmation Card */}
        <View style={styles.card}>
          <Image source={{ uri: booking.product?.primaryImage || "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&h=600" }} style={styles.productImage} />
          
          <View style={styles.cardContent}>
            <Text style={styles.productName}>{booking.product?.title}</Text>
            <Text style={styles.productPrice}>Total Rs. {booking.totalAmount?.toLocaleString()}</Text>

            {/* Duration Section */}
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color="#9333EA" style={{ marginRight: 8 }} />
                <Text style={styles.sectionLabel}>Rental Duration</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Start Date:</Text>
                <Text style={styles.infoValue}>{format(start, "MMM dd, yyyy")}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>End Date:</Text>
                <Text style={styles.infoValue}>{format(end, "MMM dd, yyyy")}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Total Days:</Text>
                <Text style={styles.totalDays}>{diffDays} {diffDays > 1 ? "days" : "day"}</Text>
              </View>
            </View>

            {/* Owner Section */}
            <View style={[styles.infoSection, { backgroundColor: "#F5F3FF" }]}>
              <View style={styles.sectionHeader}>
                <User size={18} color="#9333EA" style={{ marginRight: 8 }} />
                <Text style={styles.sectionLabel}>Owner Information</Text>
              </View>
              <Text style={styles.ownerName}>{booking.owner?.username}</Text>
              <View style={styles.ownerSubRow}>
                <MapPin size={12} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.ownerLocation}>Location details...</Text>
              </View>
              <Text style={styles.ownerRating}>
                Rating: {booking.ownerRating || 0} ⭐ 
              </Text>
            </View>

            {/* Status Status */}
            <View style={styles.statusBox}>
              <View style={styles.statusDot} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Status: Pending Request</Text>
                <Text style={styles.statusDesc}>
                  The owner will review your request and respond soon
                </Text>
              </View>
            </View>

            <Text style={styles.disclaimer}>
              Payment will be arranged offline with the owner once your request is accepted.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigate("/home")}
          >
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => navigate("/my-rentals")}
          >
            <Text style={styles.secondaryBtnText}>View My Requests</Text>
          </TouchableOpacity>
        </View>
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
    padding: 24,
    alignItems: "center",
  },
  successBox: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginBottom: 32,
  },
  productImage: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 24,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: "#9333EA",
    fontWeight: "600",
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoKey: {
    fontSize: 13,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  totalDays: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9333EA",
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  ownerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ownerLocation: {
    fontSize: 12,
    color: "#6B7280",
  },
  ownerRating: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
    marginTop: 6,
    marginRight: 10,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
  },
  statusDesc: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
  btnGroup: {
    width: "100%",
    gap: 12,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: "#9333EA",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9333EA",
  },
  secondaryBtnText: {
    color: "#9333EA",
    fontSize: 16,
    fontWeight: "bold",
  },
});
