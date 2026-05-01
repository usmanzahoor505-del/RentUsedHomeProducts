import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, MapPin, Calendar, Package, User } from "lucide-react-native";

import axios from "axios";
import { API_URL } from "../utils/api";

export default function VendorProfileScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFollowed, setIsFollowed] = React.useState(false);
  const [vendorProfile, setVendorProfile] = React.useState(null);
  const [listedProducts, setListedProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("listings");

  React.useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  const fetchVendorData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/users/profile/${id}`),
        axios.get(`${API_URL}/products/byuser/${id}`)
      ]);
      setVendorProfile(profileRes.data);
      setListedProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to fetch vendor data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !vendorProfile) {
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
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vendor Info Card */}
        <View style={styles.card}>
          <View style={styles.vendorTop}>
            <View style={[styles.vendorAvatar, { justifyContent: 'center', alignItems: 'center' }]}>
              <User size={40} color="#9CA3AF" />
            </View>
            <View style={styles.vendorBasicInfo}>
              <Text style={styles.vendorName}>{vendorProfile.username}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.locationText}>{vendorProfile.city || "Pakistan"}</Text>
              </View>
              <View style={styles.memberRow}>
                <Calendar size={12} color="#9CA3AF" />
                <Text style={styles.memberText}>Member since 2024</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: "#F5F3FF" }]}>
              <Star size={16} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.statValue}>{vendorProfile.avgOwnerRating?.toFixed(1) || 0}</Text>
              <Text style={styles.statLabel}>As Owner</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: "#EFF6FF" }]}>
              <Star size={16} color="#2563EB" fill="#2563EB" />
              <Text style={styles.statValue}>{vendorProfile.avgRenterRating?.toFixed(1) || 0}</Text>
              <Text style={styles.statLabel}>As Renter</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: "#F0FDF4" }]}>
              <Package size={16} color="#16A34A" />
              <Text style={styles.statValue}>{listedProducts.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "listings" && styles.activeTab]} 
            onPress={() => setActiveTab("listings")}
          >
            <Text style={[styles.tabText, activeTab === "listings" && styles.activeTabText]}>Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "owner_reviews" && styles.activeTab]} 
            onPress={() => setActiveTab("owner_reviews")}
          >
            <Text style={[styles.tabText, activeTab === "owner_reviews" && styles.activeTabText]}>Owner Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "renter_reviews" && styles.activeTab]} 
            onPress={() => setActiveTab("renter_reviews")}
          >
            <Text style={[styles.tabText, activeTab === "renter_reviews" && styles.activeTabText]}>Customer Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "listings" && (
          <View style={styles.section}>
            {listedProducts.length > 0 ? (
              listedProducts.map((product) => (
                <TouchableOpacity
                  key={product.productId}
                  style={styles.productListCard}
                  onPress={() => navigate("/product/" + product.productId)}
                >
                  <Image 
                    source={{ uri: product.images && product.images.length > 0 ? product.images[0].imageUrl : "https://via.placeholder.com/100" }} 
                    style={styles.listProductImage} 
                  />
                  <View style={styles.listProductInfo}>
                    <Text style={styles.listProductName} numberOfLines={1}>{product.title}</Text>
                    <View style={styles.listRatingRow}>
                      <Star size={12} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.listRatingText}>{product.avgRating || 0}</Text>
                    </View>
                    <Text style={styles.listProductPrice}>Rs. {product.pricePerDay}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No products listed.</Text>
            )}
          </View>
        )}

        {activeTab === "owner_reviews" && (
          <View style={styles.section}>
            {vendorProfile.reviewsAsOwner && vendorProfile.reviewsAsOwner.length > 0 ? (
              vendorProfile.reviewsAsOwner.map((review) => (
                <View key={review.rentalId} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.renterName}</Text>
                    <View style={styles.reviewRating}>
                      <Star size={14} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.reviewRatingValue}>{review.productRating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.productReview || "No comment."}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No owner reviews yet.</Text>
            )}
          </View>
        )}

        {activeTab === "renter_reviews" && (
          <View style={styles.section}>
            {vendorProfile.reviewsAsRenter && vendorProfile.reviewsAsRenter.length > 0 ? (
              vendorProfile.reviewsAsRenter.map((review) => (
                <View key={review.rentalId} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.ownerName} (Owner)</Text>
                    <View style={styles.reviewRating}>
                      <Star size={14} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.reviewRatingValue}>{review.renterRating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.renterReview || "No comment."}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No customer reviews yet.</Text>
            )}
          </View>
        )}
      </ScrollView>
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
  vendorTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  vendorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  vendorBasicInfo: {
    marginLeft: 16,
    flex: 1,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  followingBtn: {
    backgroundColor: "#9333EA",
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9333EA",
  },
  followingBtnText: {
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#F5F3FF",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#9333EA",
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 20,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  reviewProduct: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  productListCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  listProductImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  listProductInfo: {
    marginLeft: 12,
    flex: 1,
  },
  listProductName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  listRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  listRatingText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  listProductPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9333EA",
  },
  listPriceUnit: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "normal",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAvailable: {
    backgroundColor: "#DCFCE7",
  },
  statusRented: {
    backgroundColor: "#FEE2E2",
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
