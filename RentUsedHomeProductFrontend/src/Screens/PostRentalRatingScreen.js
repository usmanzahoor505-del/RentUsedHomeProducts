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
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, User, Package, AlertCircle } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";

export default function PostRentalRatingScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Customer Rating States
  const [productRating, setProductRating] = useState(0);
  const [ownerRating, setOwnerRating] = useState(0);
  const [customerReview, setCustomerReview] = useState("");

  // Owner Rating States
  const [customerBehaviorRating, setCustomerBehaviorRating] = useState(0);
  const [returnConditionRating, setReturnConditionRating] = useState(0);
  const [ownerReview, setOwnerReview] = useState("");

  const rentalInfo = {
    productName: "Gaming Laptop",
    productImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
    ownerName: "Ahmed Khan",
    customerName: "Fatima Ali",
    originalCondition: 9, // Out of 10
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return "Tap to rate";
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    if (rating === 5) return "Excellent";
    return "";
  };

  const handleSubmit = () => {
    // Validate
    if (productRating === 0 || ownerRating === 0 || customerBehaviorRating === 0 || returnConditionRating === 0) {
      Alert.alert("Incomplete", "Please complete all rating sections for both Customer and Owner.");
      return;
    }

    Alert.alert("Success", "Complete rating submitted successfully!", [
      { text: "OK", onPress: () => navigate("/return-status/" + id) }
    ]);
  };

  const StarRating = ({ rating, onRate, color = "#FBBF24" }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Star
            size={36}
            color={star <= rating ? color : "#E5E7EB"}
            fill={star <= rating ? color : "transparent"}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post-Rental Rating</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Info Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: rentalInfo.productImage }} style={styles.productImg} />
          <Text style={styles.productName}>{rentalInfo.productName}</Text>
          <Text style={styles.rentalRoles}>
            Owner: {rentalInfo.ownerName} • Customer: {rentalInfo.customerName}
          </Text>
        </View>

        {/* CUSTOMER SECTION */}
        <LinearGradient colors={["#DDD6FE", "#C084FC"]} style={styles.sectionWrapper}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#9333EA" }]}>
                <User size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Customer Section</Text>
                <Text style={styles.sectionSubtitle}>Rate your rental experience</Text>
              </View>
            </View>

            <View style={styles.ratingBox}>
              <Text style={styles.ratingQuestion}>How was the product quality?</Text>
              <StarRating rating={productRating} onRate={setProductRating} color="#9333EA" />
              <Text style={[styles.ratingLabel, { color: "#9333EA" }]}>{getRatingLabel(productRating)}</Text>
            </View>

            <View style={styles.ratingBox}>
              <Text style={styles.ratingQuestion}>How was the owner's service?</Text>
              <StarRating rating={ownerRating} onRate={setOwnerRating} color="#9333EA" />
              <Text style={[styles.ratingLabel, { color: "#9333EA" }]}>{getRatingLabel(ownerRating)}</Text>
            </View>

            <Text style={styles.inputLabel}>Your Review (Optional)</Text>
            <TextInput
              placeholder="Share your experience..."
              value={customerReview}
              onChangeText={setCustomerReview}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </LinearGradient>

        {/* OWNER SECTION */}
        <LinearGradient colors={["#BFDBFE", "#60A5FA"]} style={styles.sectionWrapper}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#2563EB" }]}>
                <Package size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Owner Section</Text>
                <Text style={styles.sectionSubtitle}>Rate the customer & return condition</Text>
              </View>
            </View>

            <View style={styles.ratingBox}>
              <Text style={styles.ratingQuestion}>How was the customer's behavior?</Text>
              <StarRating rating={customerBehaviorRating} onRate={setCustomerBehaviorRating} color="#2563EB" />
              <Text style={[styles.ratingLabel, { color: "#2563EB" }]}>{getRatingLabel(customerBehaviorRating)}</Text>
            </View>

            {/* Condition Info */}
            <View style={styles.conditionPreview}>
              <View style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>Original Condition:</Text>
                <Text style={styles.conditionValue}>{rentalInfo.originalCondition}/10</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${rentalInfo.originalCondition * 10}%` }]} />
              </View>
            </View>

            <View style={styles.ratingBox}>
              <Text style={styles.ratingQuestion}>Return condition vs. original state</Text>
              <StarRating rating={returnConditionRating} onRate={setReturnConditionRating} color="#2563EB" />
              <Text style={[styles.ratingLabel, { color: "#2563EB" }]}>{getRatingLabel(returnConditionRating)}</Text>
            </View>

            {/* Warning Box */}
            {returnConditionRating > 0 && returnConditionRating < rentalInfo.originalCondition / 2 && (
              <View style={styles.warningBox}>
                <AlertCircle size={20} color="#EF4444" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>Condition Declined</Text>
                  <Text style={styles.warningText}>Item returned in significantly worse condition. Please document below.</Text>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Owner's Feedback (Optional)</Text>
            <TextInput
              placeholder="Document issues or commend customer..."
              value={ownerReview}
              onChangeText={setOwnerReview}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </LinearGradient>

        {/* Guidelines */}
        <View style={styles.guidelinesBox}>
          <Text style={styles.guideTitle}>Rating Guidelines:</Text>
          <Text style={styles.guideItem}>• Customer: Rate quality and owner service</Text>
          <Text style={styles.guideItem}>• Owner: Rate behavior and return state</Text>
          <Text style={styles.guideItem}>• Both sections must be completed</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, (productRating === 0 || ownerRating === 0 || customerBehaviorRating === 0 || returnConditionRating === 0) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>Submit Complete Rating</Text>
        </TouchableOpacity>
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
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  productImg: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  rentalRoles: {
    fontSize: 12,
    color: "#6B7280",
  },
  sectionWrapper: {
    padding: 2,
    borderRadius: 26,
    marginBottom: 24,
  },
  sectionInner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  ratingBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  ratingQuestion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    height: 100,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#111827",
  },
  conditionPreview: {
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  conditionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563EB",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#B91C1C",
    lineHeight: 18,
  },
  guidelinesBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  guideItem: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
    lineHeight: 18,
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
  submitBtn: {
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
  submitBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
