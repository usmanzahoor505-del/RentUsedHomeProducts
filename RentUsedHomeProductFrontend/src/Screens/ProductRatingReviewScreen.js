import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, User } from "lucide-react-native";
import axios from "axios";
import { API_URL } from "../utils/api";

export default function ProductRatingReviewScreen() {
  const navigate = useNavigate();
  const { id } = useParams(); // This is the Rental ID
  
  const [productRating, setProductRating] = useState(0);
  const [ownerRating, setOwnerRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rentalData, setRentalData] = useState(null);

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      // Assuming there's a GET /api/rental/{id} endpoint or similar
      // If not, we might need to find it in the list.
      const response = await axios.get(`${API_URL}/rental/${id}`);
      setRentalData(response.data);
    } catch (error) {
      console.error("Failed to fetch rental details", error);
      // Fallback dummy data if fetch fails
      setRentalData({
        product: { 
          title: "Product", 
          primaryImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80" 
        },
        owner: { username: "Owner" }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 1: return { text: "Poor", color: "#EF4444" };
      case 2: return { text: "Fair", color: "#F97316" };
      case 3: return { text: "Good", color: "#EAB308" };
      case 4: return { text: "Very Good", color: "#22C55E" };
      case 5: return { text: "Excellent", color: "#9333EA" };
      default: return { text: "Tap a star to rate", color: "#9CA3AF" };
    }
  };

  const handleSubmit = async () => {
    if (productRating === 0 || ownerRating === 0) {
      Alert.alert("Required", "Please provide ratings for both product and owner.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productRating: productRating,
        productReview: review.trim(),
        ownerRating: ownerRating
      };

      console.log("Submitting review for rental:", id, payload);
      await axios.put(`${API_URL}/rental/rate-product/${id}`, payload);

      Alert.alert("✅ Success", "Thank you for your feedback!", [
        { text: "OK", onPress: () => navigate("/return-status/" + id) }
      ]);
    } catch (error) {
      console.error("Failed to submit review", error);
      const msg = error.response?.data?.message || "Something went wrong while submitting your review.";
      Alert.alert("❌ Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Info Card */}
        <View style={styles.card}>
          <Image 
            source={{ uri: rentalData?.product?.primaryImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80" }} 
            style={styles.productImage} 
          />
          <Text style={styles.productName}>{rentalData?.product?.title}</Text>
          <Text style={styles.ownerText}>Rented from {rentalData?.owner?.username}</Text>
        </View>

        {/* Product Rating Section */}
        <View style={styles.card}>
          <Text style={styles.questionText}>How was the Product?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setProductRating(star)}>
                <Star
                  size={40}
                  color={star <= productRating ? "#FBBF24" : "#E5E7EB"}
                  fill={star <= productRating ? "#FBBF24" : "transparent"}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.ratingLabel, { color: getRatingLabel(productRating).color }]}>
            {getRatingLabel(productRating).text}
          </Text>
        </View>

        {/* Owner Rating Section */}
        <View style={styles.card}>
          <Text style={styles.questionText}>How was the Owner's behavior?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setOwnerRating(star)}>
                <Star
                  size={40}
                  color={star <= ownerRating ? "#9333EA" : "#E5E7EB"}
                  fill={star <= ownerRating ? "#9333EA" : "transparent"}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.ratingLabel, { color: getRatingLabel(ownerRating).color }]}>
            {getRatingLabel(ownerRating).text}
          </Text>
        </View>

        {/* Review Section */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Write a Review (Optional)</Text>
          <TextInput
            placeholder="Share your experience with this rental..."
            value={review}
            onChangeText={setReview}
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, (productRating === 0 || ownerRating === 0 || isSubmitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={productRating === 0 || ownerRating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Rating & Review</Text>
          )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  questionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  textArea: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    fontSize: 14,
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
  submitBtn: {
    backgroundColor: "#9333EA",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
