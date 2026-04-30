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
import { ArrowLeft, Star } from "lucide-react-native";

export default function ProductRatingReviewScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const productInfo = {
    name: "Gaming Laptop",
    image: "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
    ownerName: "Ahmed Khan",
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1: return { text: "Poor", color: "#EF4444" };
      case 2: return { text: "Fair", color: "#F97316" };
      case 3: return { text: "Good", color: "#EAB308" };
      case 4: return { text: "Very Good", color: "#22C55E" };
      case 5: return { text: "Excellent", color: "#9333EA" };
      default: return { text: "Tap a star to rate", color: "#9CA3AF" };
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("Required", "Please select a rating before submitting.");
      return;
    }
    Alert.alert("Success", "Thank you for your feedback!", [
      { text: "OK", onPress: () => navigate("/return-status/" + id) }
    ]);
  };

  const ratingLabel = getRatingLabel();

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
          <Image source={{ uri: productInfo.image }} style={styles.productImage} />
          <Text style={styles.productName}>{productInfo.name}</Text>
          <Text style={styles.ownerText}>Rented from {productInfo.ownerName}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.card}>
          <Text style={styles.questionText}>How was your rental experience?</Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
              >
                <Star
                  size={48}
                  color={star <= rating ? "#FBBF24" : "#E5E7EB"}
                  fill={star <= rating ? "#FBBF24" : "transparent"}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.ratingLabel, { color: ratingLabel.color }]}>
            {ratingLabel.text}
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
          <Text style={styles.hintText}>
            Your review helps other users make better rental decisions
          </Text>
        </View>

        {/* Tips Box */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Rating Tips:</Text>
          <Text style={styles.tipItem}>• Rate the product condition and quality</Text>
          <Text style={styles.tipItem}>• Consider the owner's communication and service</Text>
          <Text style={styles.tipItem}>• Be honest and fair in your review</Text>
        </View>
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitBtnText}>Submit Rating & Review</Text>
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
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  questionText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
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
    height: 150,
    textAlignVertical: "top",
    fontSize: 15,
    color: "#111827",
  },
  hintText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    alignSelf: "flex-start",
  },
  tipsBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4C1D95",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 12,
    color: "#5B21B6",
    lineHeight: 18,
    marginBottom: 2,
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
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
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
