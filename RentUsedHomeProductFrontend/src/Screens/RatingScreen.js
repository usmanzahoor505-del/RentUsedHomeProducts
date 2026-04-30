import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import { useNavigate } from "react-router";
import { ArrowLeft, Star, ThumbsUp, Menu, X } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function RatingScreen() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("rateVendor");

  // Rating states
  const [ratings, setRatings] = useState({
    vendor: 0,
    customer: 0,
    product: 0,
  });
  const [review, setReview] = useState("");

  const ratingCategories = [
    { id: "rateVendor", name: "Rate Vendor", description: "Rate the product owner" },
    { id: "rateCustomer", name: "Rate Customer", description: "Rate the renter" },
    { id: "rateProduct", name: "Rate Product", description: "Rate the product quality" },
    { id: "history", name: "Review History", description: "View all reviews" },
  ];

  const reviewHistory = [
    {
      id: 1,
      type: "received",
      from: "Hassan Ali",
      rating: 5,
      review: "Excellent product owner! Very cooperative and the laptop was in perfect condition.",
      product: "Gaming Laptop",
      date: "Jan 20, 2026",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      type: "given",
      to: "Ayesha Raza",
      rating: 5,
      review: "Great renter! Took good care of the item and returned on time.",
      product: "Power Drill",
      date: "Jan 15, 2026",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      type: "product",
      product: "Gaming Laptop",
      rating: 5,
      review: "Amazing performance! Perfect for gaming and video editing.",
      date: "Jan 20, 2026",
      avatar: "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100&h=100",
    },
  ];

  const trustScore = 4.9;
  const totalReviews = 156;

  const renderStars = (type, currentRating) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRatings({ ...ratings, [type]: star })}
          >
            <Star
              size={32}
              color={star <= currentRating ? "#FBBF24" : "#E5E7EB"}
              fill={star <= currentRating ? "#FBBF24" : "transparent"}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = () => {
    Alert.alert("Success", "Rating submitted successfully!");
    setRatings({ vendor: 0, customer: 0, product: 0 });
    setReview("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setSidebarOpen(true)}>
          <Menu size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Trust Score Banner */}
        <LinearGradient
          colors={["#2563EB", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.trustBanner}
        >
          <View>
            <Text style={styles.trustLabel}>Your Trust Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>{trustScore}</Text>
              <View>
                <View style={styles.smallStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      color={s <= Math.round(trustScore) ? "#FBBF24" : "rgba(255,255,255,0.3)"}
                      fill={s <= Math.round(trustScore) ? "#FBBF24" : "transparent"}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text style={styles.countText}>{totalReviews} reviews</Text>
              </View>
            </View>
          </View>
          <ThumbsUp size={48} color="rgba(255,255,255,0.2)" />
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.content}>
          {activeSection === "rateVendor" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rate the Vendor</Text>
              <Text style={styles.cardSubtitle}>How was your experience with Ahmed Khan?</Text>

              <View style={styles.userRow}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }}
                  style={styles.userAvatar}
                />
                <View>
                  <Text style={styles.userName}>Ahmed Khan</Text>
                  <Text style={styles.userRole}>Gaming Laptop Owner</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Rating</Text>
                {renderStars("vendor", ratings.vendor)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Write a Review</Text>
                <TextInput
                  placeholder="Share your experience..."
                  value={review}
                  onChangeText={setReview}
                  style={styles.textArea}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, ratings.vendor === 0 && styles.submitBtnDisabled]} 
                onPress={handleSubmit}
                disabled={ratings.vendor === 0}
              >
                <Text style={styles.submitBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeSection === "rateCustomer" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rate the Customer</Text>
              <Text style={styles.cardSubtitle}>How was your experience with Hassan Ali?</Text>

              <View style={styles.userRow}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }}
                  style={styles.userAvatar}
                />
                <View>
                  <Text style={styles.userName}>Hassan Ali</Text>
                  <Text style={styles.userRole}>Rented Gaming Laptop</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Rating</Text>
                {renderStars("customer", ratings.customer)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Write a Review</Text>
                <TextInput
                  placeholder="Share your experience..."
                  value={review}
                  onChangeText={setReview}
                  style={styles.textArea}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, ratings.customer === 0 && styles.submitBtnDisabled]} 
                onPress={handleSubmit}
                disabled={ratings.customer === 0}
              >
                <Text style={styles.submitBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeSection === "rateProduct" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rate the Product</Text>
              <Text style={styles.cardSubtitle}>How was the product quality?</Text>

              <View style={styles.userRow}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1640955014216-75201056c829?w=100&h=100&fit=crop" }}
                  style={[styles.userAvatar, { borderRadius: 12 }]}
                />
                <View>
                  <Text style={styles.userName}>Gaming Laptop</Text>
                  <Text style={styles.userRole}>By Ahmed Khan</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Rating</Text>
                {renderStars("product", ratings.product)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Write a Review</Text>
                <TextInput
                  placeholder="Share your experience..."
                  value={review}
                  onChangeText={setReview}
                  style={styles.textArea}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, ratings.product === 0 && styles.submitBtnDisabled]} 
                onPress={handleSubmit}
                disabled={ratings.product === 0}
              >
                <Text style={styles.submitBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeSection === "history" && (
            <View style={styles.historyList}>
              {reviewHistory.map((rev) => (
                <View key={rev.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Image source={{ uri: rev.avatar }} style={styles.historyAvatar} />
                    <View style={styles.historyInfo}>
                      <View style={styles.historyTopRow}>
                        <Text style={styles.historyName}>
                          {rev.type === "received" ? `From ${rev.from}` : rev.type === "given" ? `To ${rev.to}` : rev.product}
                        </Text>
                        <View style={[styles.typeBadge, { backgroundColor: rev.type === "received" ? "#EFF6FF" : rev.type === "given" ? "#DCFCE7" : "#F3E8FF" }]}>
                          <Text style={[styles.typeText, { color: rev.type === "received" ? "#1E40AF" : rev.type === "given" ? "#166534" : "#6B21A8" }]}>
                            {rev.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.historySub}>{rev.product} • {rev.date}</Text>
                      <View style={styles.miniStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            color={s <= rev.rating ? "#FBBF24" : "#E5E7EB"}
                            fill={s <= rev.rating ? "#FBBF24" : "transparent"}
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.historyReview}>{rev.review}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sidebar Navigation */}
      <Modal
        visible={sidebarOpen}
        animationType="none"
        transparent={true}
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBlur} 
            activeOpacity={1} 
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Rating Options</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <View style={styles.sidebarContent}>
              {ratingCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sidebarItem, activeSection === cat.id && styles.sidebarItemActive]}
                  onPress={() => {
                    setActiveSection(cat.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Text style={[styles.sidebarItemName, activeSection === cat.id && styles.sidebarItemNameActive]}>
                    {cat.name}
                  </Text>
                  <Text style={[styles.sidebarItemDesc, activeSection === cat.id && styles.sidebarItemDescActive]}>
                    {cat.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    height: 60,
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
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  trustBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  trustLabel: {
    color: "#DBEAFE",
    fontSize: 14,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 12,
  },
  smallStars: {
    flexDirection: "row",
    marginBottom: 4,
  },
  countText: {
    fontSize: 12,
    color: "#DBEAFE",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  userRole: {
    fontSize: 13,
    color: "#6B7280",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    fontSize: 15,
    color: "#111827",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyList: {
    gap: 16,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  historyHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  historyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  historySub: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  miniStars: {
    flexDirection: "row",
  },
  historyReview: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  modalBlur: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    width: 300,
    backgroundColor: "#FFFFFF",
    height: "100%",
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sidebarContent: {
    padding: 16,
    gap: 12,
  },
  sidebarItem: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
  },
  sidebarItemActive: {
    backgroundColor: "#2563EB",
  },
  sidebarItemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  sidebarItemNameActive: {
    color: "#FFFFFF",
  },
  sidebarItemDesc: {
    fontSize: 12,
    color: "#6B7280",
  },
  sidebarItemDescActive: {
    color: "#DBEAFE",
  },
});
