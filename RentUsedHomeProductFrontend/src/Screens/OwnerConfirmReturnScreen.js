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
  ActivityIndicator,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, Upload, CheckCircle, X, AlertCircle } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { API_URL } from "../utils/api";


export default function OwnerConfirmReturnScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [rental, setRental] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerRating, setCustomerRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [condition, setCondition] = useState(8);

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    const fetchRentalData = async () => {
      try {
        const res = await axios.get(`${API_URL}/rental/${id}`);
        setRental(res.data);
      } catch (error) {
        console.error("Failed to fetch rental", error);
        Alert.alert("Error", "Could not load rental details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchRentalData();
  }, [id]);

  const originalCondition = 9;

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

  const handleConfirmReturn = async () => {
    if (customerRating === 0) {
      Alert.alert("Required", "Please rate the customer's behavior.");
      return;
    }
    
    try {
      await axios.put(`${API_URL}/rental/confirm-return/${id}`, {
        renterRating: customerRating,
        renterReview: reviewComment
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Confirm Return Error:", error);
      Alert.alert("Error", "Failed to confirm return.");
    }
  };

  const StarRating = ({ rating, onRate, readonly = false, color = "#9333EA" }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => !readonly && onRate(star)}
          disabled={readonly}
        >
          <Star
            size={readonly ? 20 : 32}
            color={star <= rating ? (readonly ? "#FBBF24" : color) : "#E5E7EB"}
            fill={star <= rating ? (readonly ? "#FBBF24" : color) : "transparent"}
            style={{ marginHorizontal: readonly ? 2 : 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successWrapper}>
          <View style={styles.successCircle}>
            <CheckCircle size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Return Confirmed</Text>
          <Text style={styles.successSubtitle}>The rental has been successfully completed</Text>
          <TouchableOpacity 
            style={styles.successBtn}
            onPress={() => navigate("/home")}
          >
            <Text style={styles.successBtnText}>Go to Home</Text>
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
          <Text style={styles.headerTitle}>Confirm Return Request</Text>
          <Text style={styles.headerSubtitle}>Review and confirm the return</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Item Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Item Summary</Text>
          <View style={styles.itemSummaryRow}>
            <Image 
              source={{ uri: rental?.product?.primaryImage || "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300" }} 
              style={styles.summaryImg} 
            />
            <View>
              <Text style={styles.summaryName}>{rental?.product?.title || "Product"}</Text>
              <Text style={styles.summaryRenter}>Returned by {rental?.renter?.username || "Customer"}</Text>
            </View>
          </View>
        </View>

        {/* Owner Rating Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate the Customer</Text>

          <View style={styles.inputRatingRow}>
            <Text style={styles.inputRatingLabel}>Overall Experience with Customer</Text>
            <StarRating rating={customerRating} onRate={setCustomerRating} />
          </View>

          <Text style={styles.inputLabel}>Review</Text>
          <TextInput
            placeholder="Write a review for the customer..."
            value={reviewComment}
            onChangeText={setReviewComment}
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9CA3AF"
            editable={true}
          />
        </View>


        {/* Condition Assessment */}
        <View style={styles.card}>
          <View style={styles.conditionHeader}>
            <Text style={styles.cardTitle}>Return Condition Assessment</Text>
            <Text style={styles.conditionValueText}>{condition}/10</Text>
          </View>
          
          <View style={styles.comparisonGrid}>
            <View style={styles.comparisonCol}>
              <Text style={styles.smallLabel}>Original Condition:</Text>
              <View style={styles.conditionIndicator}>
                <Text style={styles.conditionIndicatorText}>{originalCondition}/10</Text>
              </View>

            </View>
            <View style={styles.comparisonCol}>
              <Text style={styles.smallLabel}>Current Condition:</Text>
              <View style={[styles.conditionIndicator, { backgroundColor: "#F5F3FF" }]}>
                <Text style={[styles.conditionIndicatorText, { color: "#9333EA" }]}>
                  {condition}/10
                </Text>
              </View>
            </View>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={condition}
            onValueChange={setCondition}
            minimumTrackTintColor="#9333EA"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#9333EA"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderSubText}>Damaged</Text>
            <Text style={styles.sliderSubText}>Excellent</Text>
          </View>


          {/* Condition Decline Alert */}
          {condition < 7 && (
            <View style={styles.warningBox}>
              <AlertCircle size={20} color="#EF4444" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Condition Decreased</Text>
                <Text style={styles.warningText}>Consider documenting the issues with photos and notes as the return condition is lower than expected.</Text>
              </View>
            </View>
          )}

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

          <Text style={[styles.inputLabel, { marginTop: 24 }]}>Additional Notes (Optional)</Text>
          <TextInput
            placeholder="Document any issues or commend customer..."
            value={notes}
            onChangeText={setNotes}
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
            editable={true}
          />
        </View>


      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmBtn} 
          onPress={handleConfirmReturn}
        >
          <Text style={styles.confirmBtnText}>Confirm Return</Text>
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
    paddingBottom: 150,
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
  reviewBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9333EA",
    letterSpacing: 1,
    marginBottom: 16,
  },
  readonlyRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  readonlyLabel: {
    fontSize: 14,
    color: "#111827",
  },
  smallLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  customerConditionBox: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  customerConditionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
  },
  readonlyPhotoList: {
    flexDirection: "row",
    gap: 8,
  },
  readonlyPhoto: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  commentBox: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  commentText: {
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  inputRatingRow: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 20,
  },
  inputRatingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  starRow: {
    flexDirection: "row",
  },
  comparisonGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  comparisonCol: {
    flex: 1,
  },
  conditionIndicator: {
    backgroundColor: "#F3F4F6",
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  conditionIndicatorText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B5563",
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
    marginTop: 10,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  sliderSubText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  conditionSelectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  conditionBtn: {
    width: "48%",
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  conditionBtnText: {
    fontSize: 13,
    fontWeight: "bold",
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
    marginRight: 10,
  },
  uploadedPhoto: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoBtn: {
    width: 70,
    height: 70,
    borderRadius: 12,
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
    height: 100,
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
  confirmBtn: {
    backgroundColor: "#9333EA",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disputeBtn: {
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  disputeBtnText: {
    color: "#EF4444",
    fontSize: 14,
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
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
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
  itemSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  summaryRenter: {
    fontSize: 12,
    color: "#6B7280",
  },
});
