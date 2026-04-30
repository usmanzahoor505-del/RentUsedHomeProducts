import React from "react";
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
import { ArrowLeft, Star, Clock, CheckCircle, Package, User } from "lucide-react-native";

import axios from "axios";
import { API_URL } from "../utils/api";
import { ActivityIndicator } from "react-native";

export default function RenterProfileScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [renterProfile, setRenterProfile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      fetchRenterData();
    }
  }, [id]);

  const fetchRenterData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/users/profile/${id}`);
      setRenterProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch renter data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !renterProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color="#9333EA" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Renter Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
            <User size={40} color="#9CA3AF" />
          </View>
          <Text style={styles.renterName}>{renterProfile.username}</Text>
          <View style={styles.memberRow}>
            <Clock size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
            <Text style={styles.memberText}>Joined Platform</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Star size={18} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.statValue}>{renterProfile.avgRenterRating || 0}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Package size={18} color="#9333EA" />
              <Text style={styles.statValue}>{renterProfile.reviewsAsRenter?.length || 0}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
            <View style={styles.statBox}>
              <CheckCircle size={18} color="#16A34A" />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>On-time</Text>
            </View>
          </View>
        </View>

        {/* trust badge */}
        <View style={styles.trustBanner}>
          <View style={styles.trustIconBox}>
            <CheckCircle size={20} color="#FFFFFF" />
          </View>
          <View style={styles.trustInfo}>
            <Text style={styles.trustTitle}>Highly Rated Renter</Text>
            <Text style={styles.trustDesc}>This customer has a track record of returning items in excellent condition.</Text>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Owner Feedbacks</Text>
            <Text style={styles.reviewCount}>{renterProfile.reviewsAsRenter?.length || 0} reviews</Text>
          </View>

          {renterProfile.reviewsAsRenter && renterProfile.reviewsAsRenter.length > 0 ? (
            renterProfile.reviewsAsRenter.map((review) => (
              <View key={review.rentalId} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.ownerAvatarSmall}>
                    <User size={16} color="#6B7280" />
                  </View>
                  <View style={styles.ownerReviewInfo}>
                    <Text style={styles.ownerNameText}>{review.ownerName}</Text>
                  </View>
                  <View style={styles.reviewRatingBox}>
                    <Star size={12} color="#FBBF24" fill="#FBBF24" />
                    <Text style={styles.reviewRatingValue}>{review.renterRating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{review.renterReview || "No comment provided."}"</Text>
                <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#6B7280", fontStyle: "italic" }}>No reviews yet.</Text>
          )}
        </View>

        {/* Verification Info */}
        <View style={styles.verificationCard}>
          <Text style={styles.verifTitle}>Verification Status</Text>
          <View style={styles.verifRow}>
            <View style={styles.verifItem}>
              <CheckCircle size={14} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={styles.verifText}>Identity Verified</Text>
            </View>
            <View style={styles.verifItem}>
              <CheckCircle size={14} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={styles.verifText}>Phone Verified</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>History is generated based on previous rental completions on this platform.</Text>
      </View>
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
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
  },
  renterName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  memberText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 24,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  trustBanner: {
    flexDirection: "row",
    backgroundColor: "#9333EA",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  trustIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trustInfo: {
    flex: 1,
  },
  trustTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  trustDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  reviewCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ownerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  ownerReviewInfo: {
    flex: 1,
  },
  ownerNameText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  reviewProductText: {
    fontSize: 11,
    color: "#6B7280",
  },
  reviewRatingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reviewRatingValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#CA8A04",
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  verificationCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  verifTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 10,
  },
  verifRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  verifItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifText: {
    fontSize: 12,
    color: "#15803D",
  },
  footer: {
    padding: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerNote: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
});
