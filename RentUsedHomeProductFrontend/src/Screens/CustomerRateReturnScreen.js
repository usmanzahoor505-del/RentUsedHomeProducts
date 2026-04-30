import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, Upload, CheckCircle, X } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { API_URL } from "../utils/api";
export default function CustomerRateReturnScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ownerRating, setOwnerRating] = useState(0);
  const [productRating, setProductRating] = useState(0);

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);


  const handlePhotoUpload = () => {
    const options = {
      mediaType: "photo",
      selectionLimit: 4 - uploadedPhotos.length,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", "Failed to pick photos");
        return;
      }
      if (response.assets) {
        const newImages = response.assets.map((asset) => asset.uri);
        setUploadedPhotos([...uploadedPhotos, ...newImages]);
      }
    });
  };

  const removePhoto = (index) => {
    const newPhotos = [...uploadedPhotos];
    newPhotos.splice(index, 1);
    setUploadedPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (ownerRating === 0) {
      Alert.alert("Required", "Please rate your experience with the owner.");
      return;
    }
    if (productRating === 0) {
      Alert.alert("Required", "Please rate the product quality.");
      return;
    }
    
    try {
      await axios.put(`${API_URL}/rental/rate-product/${id}`, {
        productRating,
        productReview: comment,
        ownerRating
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Failed to submit rating");
    }
  };

  const StarRating = ({ rating, onRate }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Star
            size={32}
            color={star <= rating ? "#9333EA" : "#E5E7EB"}
            fill={star <= rating ? "#9333EA" : "transparent"}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successWrapper}>
          <View style={styles.successCircle}>
            <CheckCircle size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Rating Submitted!</Text>
          <Text style={styles.successSubtitle}>Thank you for sharing your feedback. This rental is now fully completed.</Text>

          <TouchableOpacity 
            style={styles.successBtn}
            onPress={() => navigate("/my-rentals")}
          >
            <Text style={styles.successBtnText}>Back to My Rentals</Text>
          </TouchableOpacity>
        </View>
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
        <View>
          <Text style={styles.headerTitle}>Rate Your Experience</Text>
          <Text style={styles.headerSubtitle}>Share your feedback about this rental</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Ratings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate Your Experience</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Experience with Owner</Text>
            <StarRating rating={ownerRating} onRate={setOwnerRating} />
          </View>

          <View style={[styles.ratingRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
            <Text style={styles.ratingLabel}>Product Quality & Performance</Text>
            <StarRating rating={productRating} onRate={setProductRating} />
          </View>
        </View>

        {/* Photos & Comments Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Documentation</Text>



          {/* Photo Upload */}
          <Text style={styles.inputLabel}>Upload Photos (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
            {uploadedPhotos.map((uri, idx) => (
              <View key={idx} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.uploadedPhoto} />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(idx)}>
                  <X size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {uploadedPhotos.length < 4 && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePhotoUpload}>
                <Upload size={24} color="#9CA3AF" />
                <Text style={styles.addPhotoText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Comments */}
          <Text style={[styles.inputLabel, { marginTop: 24 }]}>Additional Comments (Optional)</Text>
          <TextInput
            placeholder="Share any additional details about the condition..."
            value={comment}
            onChangeText={setComment}
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Rating</Text>
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
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  ratingRow: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  starRow: {
    flexDirection: "row",
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  conditionValueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9333EA",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  sliderSubText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  conditionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  conditionChip: {
    width: "48%",
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  conditionChipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  photoList: {
    flexDirection: "row",
  },
  photoContainer: {
    position: "relative",
    marginRight: 12,
  },
  uploadedPhoto: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  removePhotoBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "600",
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
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successWrapper: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#9333EA",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
    width: "100%",
  },
  followingBtn: {
    backgroundColor: "#9333EA",
  },
  followBtnText: {
    color: "#9333EA",
    fontWeight: "bold",
    marginLeft: 8,
  },
  followingBtnText: {
    color: "#FFFFFF",
  },
  testModeBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 24,
    alignItems: "center",
  },
  testModeLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9CA3AF",
    marginBottom: 10,
    letterSpacing: 1,
  },
  testModeBtn: {
    width: "100%",
    backgroundColor: "#111827",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  testModeBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  successBtn: {
    width: "100%",
    backgroundColor: "#9333EA",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  successBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
