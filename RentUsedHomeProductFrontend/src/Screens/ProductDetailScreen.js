import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Shield,
  Heart,
  Bell,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  AlertCircle,
} from "lucide-react-native";
import { format } from "date-fns";
import { useDateFilter } from "../context/DateFilterContext";
import { useUser } from "../context/UserContext";

import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";
import StarRating from "../Components/StarRating";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { startDate, numberOfDays, hasDatesSelected, getEndDate } = useDateFilter();
  const { isLoggedIn, user, userId } = useUser();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailableForDates, setIsAvailableForDates] = useState(true);
  
  const endDate = getEndDate();

  React.useEffect(() => {
    fetchProduct();
  }, [id]);

  React.useEffect(() => {
    if (isLoggedIn && userId && id) {
      checkWishlistStatus();
    }
  }, [id, userId, isLoggedIn]);

  const checkWishlistStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/wishlist/check/${userId}/${id}`);
      setInWishlist(res.data.inWishlist);
    } catch (err) {
      console.error("Failed to check wishlist status:", err);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn || !userId) {
      Alert.alert("Login Required", "Please log in to save items to your wishlist.");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/wishlist/toggle`, {
        userId: userId,
        productId: parseInt(id),
        notifyOnAvailable: true,
      });
      setInWishlist(res.data.inWishlist);
      Alert.alert(
        res.data.inWishlist ? "❤️ Added to Wishlist" : "Removed from Wishlist",
        res.data.message
      );
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      Alert.alert("Error", "Could not update wishlist.");
    }
  };

  React.useEffect(() => {
    if (product && hasDatesSelected && endDate) {
      checkAvailability();
    }
  }, [product, startDate, endDate, hasDatesSelected]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');
      const res = await axios.get(`${API_URL}/rental/availability/${id}?startDate=${formattedStart}&endDate=${formattedEnd}`);
      setIsAvailableForDates(res.data.available);
    } catch (error) {
      console.error("Failed to check availability", error);
      setIsAvailableForDates(false);
    }
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.imageUrl.startsWith('/') ? IMAGE_BASE_URL + img.imageUrl : img.imageUrl) 
    : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleBooking = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (isOwner) {
      Alert.alert("Your Listing", "You cannot rent your own product.");
      return;
    }
    if (!hasDatesSelected) {
      Alert.alert("Date Selection Required", "Please select rental dates on the Home screen first.");
      navigate("/home");
      return;
    }
    navigate("/booking/" + product.productId);
  };

  const isOwner = Boolean(isLoggedIn && userId && (product.userId === userId || product.owner?.userId === userId || product.ownerId === userId));

  return (
    <View style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigate(-1)}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={handleToggleWishlist}
        >
          <Heart size={24} color={inWishlist ? "#EF4444" : "#111827"} fill={inWishlist ? "#EF4444" : "none"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <Image source={{ uri: productImages[currentImageIndex] }} style={styles.mainImage} />
          
          {product.status === "Rented" ? (
            <View style={[styles.badge, { backgroundColor: "#F59E0B" }]}>
              <Text style={styles.badgeText}>Currently Rented</Text>
            </View>
          ) : hasDatesSelected && (
            <View style={[styles.badge, { backgroundColor: isAvailableForDates ? "#22C55E" : "#EF4444" }]}>
              <Text style={styles.badgeText}>{isAvailableForDates ? "Available" : "Not Available"}</Text>
            </View>
          )}

          <View style={styles.dotsContainer}>
            {(product.images && product.images.length > 0 ? product.images : [1]).map((_, index) => (
              <View 
                key={index} 
                style={[styles.dot, index === currentImageIndex && styles.activeDot]} 
              />
            ))}
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.detailsBox}>
          {product.status === "Rented" ? (
            <View style={[styles.statusBanner, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <AlertCircle size={20} color="#D97706" />
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: "#B45309" }]}>
                  Currently Rented Out
                </Text>
                <Text style={styles.statusDates}>
                  Add to your Wishlist below to receive an instant alert when it becomes available!
                </Text>
              </View>
            </View>
          ) : hasDatesSelected && (
            <View style={[styles.statusBanner, { backgroundColor: isAvailableForDates ? "#F0FDF4" : "#FEF2F2", borderColor: isAvailableForDates ? "#DCFCE7" : "#FEE2E2" }]}>
              {isAvailableForDates ? <CalendarCheck size={20} color="#166534" /> : <AlertCircle size={20} color="#991B1B" />}
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: isAvailableForDates ? "#166534" : "#991B1B" }]}>
                  {isAvailableForDates ? "✓ Available for your dates" : "✗ Not available for your dates"}
                </Text>
                <Text style={styles.statusDates}>
                  {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.title}>{product.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <StarRating
                rating={product.avgRating || 0}
                size={15}
                showValue={true}
                showCount={true}
                reviewCount={product.reviewCount || product.reviews?.length || 0}
              />
            </View>
            <View style={styles.locationBox}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.locationText}>{product.location || "Location N/A"}</Text>
            </View>
          </View>

          {/* Owner Details */}
          <TouchableOpacity 
            style={styles.ownerCard}
            onPress={() => navigate("/vendor/" + (product.owner?.userId))}
          >
            <View style={styles.ownerInfo}>
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }]}>
                <Text style={{ fontSize: 20, color: '#6B7280' }}>
                  {product.owner?.username?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
              <View>
                <Text style={styles.ownerName}>{product.owner?.username || "Vendor"}</Text>
                <View style={styles.ownerRating}>
                  <Star size={12} color="#FBBF24" fill="#FBBF24" />
                  <Text style={styles.ownerRatingText}>Owner Profile</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Pricing Card */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Rental Price</Text>
            <Text style={styles.priceValue}>
              Rs. {product.pricePerDay?.toLocaleString() || "0"}
              <Text style={styles.priceUnit}>/day</Text>
            </Text>
          </View>

          {/* Condition & Description */}
          <View style={styles.conditionSection}>
            <View style={styles.conditionHeader}>
              <Text style={styles.conditionTitle}>Condition</Text>
              <Text style={styles.conditionScore}>{product.condition}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>


          {/* Features */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Calendar size={24} color="#9333EA" />
              <Text style={styles.featureLabel}>Advance</Text>
              <Text style={styles.featureValue}>Booking</Text>
            </View>
            <View style={styles.featureItem}>
              <Shield size={24} color="#16A34A" />
              <Text style={styles.featureLabel}>Verified</Text>
              <Text style={styles.featureValue}>Owner</Text>
            </View>
          </View>

          {/* Ratings & Customer Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsSectionHeader}>
              <Text style={styles.reviewsSectionTitle}>Ratings & Reviews</Text>
              <View style={styles.reviewBadge}>
                <Text style={styles.reviewBadgeText}>
                  {product.reviewCount || product.reviews?.length || 0} {((product.reviewCount || product.reviews?.length || 0) === 1) ? "Review" : "Reviews"}
                </Text>
              </View>
            </View>

            {/* Overall Rating Summary Card */}
            <View style={styles.ratingSummaryCard}>
              <Text style={styles.bigRatingScore}>
                {product.avgRating && product.avgRating > 0 ? product.avgRating.toFixed(1) : "0.0"}
              </Text>
              <StarRating
                rating={product.avgRating || 0}
                size={20}
                spacing={3}
                containerStyle={{ marginTop: 6, marginBottom: 6 }}
              />
              <Text style={styles.ratingSubtext}>
                Based on {product.reviewCount || product.reviews?.length || 0} verified {((product.reviewCount || product.reviews?.length || 0) === 1) ? "review" : "reviews"}
              </Text>
            </View>

            {/* Individual Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {product.reviews.map((rev, idx) => (
                  <View key={rev.rentalId || idx} style={styles.reviewItemCard}>
                    <View style={styles.reviewItemHeader}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerAvatarText}>
                          {(rev.renterName || "R")[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.reviewerNameRow}>
                          <Text style={styles.reviewerNameText}>
                            {rev.renterName || "Verified Renter"}
                          </Text>
                          <Text style={styles.verifiedTag}>Verified Renter</Text>
                        </View>
                        <Text style={styles.reviewDateText}>
                          {rev.endDate ? format(new Date(rev.endDate), "MMM dd, yyyy") : "Recent"}
                        </Text>
                      </View>
                    </View>

                    {/* Star Rating for this review */}
                    <View style={styles.reviewStarsRow}>
                      <StarRating
                        rating={rev.productRating || 5}
                        size={13}
                        showValue={true}
                      />
                    </View>

                    {/* Review text */}
                    {rev.productReview ? (
                      <Text style={styles.reviewCommentText}>
                        "{rev.productReview}"
                      </Text>
                    ) : (
                      <Text style={styles.noCommentText}>
                        Left a {rev.productRating || 5}-star rating without additional comments.
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noReviewsBox}>
                <Star size={32} color="#D1D5DB" fill="#F3F4F6" style={{ marginBottom: 8 }} />
                <Text style={styles.noReviewsTitle}>No Reviews Yet</Text>
                <Text style={styles.noReviewsSubtitle}>
                  This product has not received any reviews yet. Rent it and be the first to share your experience!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <SafeAreaView style={styles.footer}>
        {isOwner ? (
          <View style={[styles.bookBtn, { backgroundColor: "#6B7280" }]}>
            <Text style={styles.bookBtnText}>Your Listed Product</Text>
          </View>
        ) : (!isAvailableForDates && hasDatesSelected) || product.status !== "Available" ? (
          <TouchableOpacity 
            style={[styles.bookBtn, styles.notifyBtn]}
            onPress={handleToggleWishlist}
          >
            <Bell size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.bookBtnText}>
              {inWishlist ? "In Wishlist (Alert Active)" : "Notify Me When Available"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.bookBtn}
            onPress={handleBooking}
          >
            <Text style={styles.bookBtnText}>
              {!isLoggedIn ? "Sign In to Book" : !hasDatesSelected ? "Select Dates to Book" : "Book Now"}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  carouselContainer: {
    height: 400,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 100,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  carouselControls: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },
  detailsBox: {
    padding: 24,
    marginTop: -20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  statusBanner: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "center",
  },
  statusInfo: {
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusDates: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  priceCard: {
    backgroundColor: "#F5F3FF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6D28D9",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  priceUnit: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "normal",
  },
  conditionSection: {
    marginBottom: 24,
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  conditionScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9333EA",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#9333EA",
  },
  descriptionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },
  ownerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 24,
    marginBottom: 32,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  ownerRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ownerRatingText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  chatBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    gap: 16,
  },
  featureItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  featureLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
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
  bookBtn: {
    backgroundColor: "#9333EA",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledBtn: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  notifyBtn: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
  },
  reviewsSection: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 22,
  },
  reviewsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  reviewBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewBadgeText: {
    color: "#9333EA",
    fontSize: 12,
    fontWeight: "700",
  },
  ratingSummaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bigRatingScore: {
    fontSize: 38,
    fontWeight: "900",
    color: "#111827",
  },
  ratingSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  reviewsList: {
    gap: 12,
  },
  reviewItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 10,
  },
  reviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reviewerAvatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewerNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reviewDateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },
  reviewStarsRow: {
    marginBottom: 8,
  },
  reviewCommentText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    fontStyle: "italic",
  },
  noCommentText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  noReviewsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noReviewsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  noReviewsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
