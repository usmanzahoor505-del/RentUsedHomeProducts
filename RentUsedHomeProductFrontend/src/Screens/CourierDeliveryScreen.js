import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  ExternalLink,
  Package,
  AlertCircle,
  Truck,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { useUser } from "../context/UserContext";
import api from "../utils/api";

const { width } = Dimensions.get("window");

export default function CourierDeliveryScreen() {
  const navigate = useNavigate();
  const { id } = useParams(); // deliveryId
  const { userId, userName } = useUser();

  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [pickupOtpInput, setPickupOtpInput] = useState("");
  const [dropoffOtpInput, setDropoffOtpInput] = useState("");
  
  // 3-Point Condition Photos (Mock / Upload URLs to prevent disputes)
  const [photos, setPhotos] = useState([
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop",
  ]);

  const webViewRef = useRef(null);

  useEffect(() => {
    fetchDeliveryDetails();
    // Auto-stream GPS periodically
    const interval = setInterval(() => {
      streamLiveLocation();
    }, 12000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchDeliveryDetails = async () => {
    try {
      const res = await api.get(`/deliveries/${id}`);
      setDelivery(res.data.delivery);
    } catch (error) {
      console.error("Failed to load delivery details:", error);
      Alert.alert("Error", "Could not load delivery details.");
    } finally {
      setIsLoading(false);
    }
  };

  const streamLiveLocation = async () => {
    if (!delivery || delivery.status === "Delivered") return;
    try {
      // Simulate moving rider coords or use current coords
      const lat = delivery.pickupLatitude ? delivery.pickupLatitude + (Math.random() - 0.5) * 0.005 : 33.5973;
      const lng = delivery.pickupLongitude ? delivery.pickupLongitude + (Math.random() - 0.5) * 0.005 : 73.0479;
      await api.post(`/deliveries/${id}/location`, {
        latitude: lat,
        longitude: lng,
      });
    } catch (e) {
      // Background non-critical
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert("No Phone", "Phone number is not available.");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert("Error", "Cannot make phone calls on this device.");
    });
  };

  const handleOpenMaps = (address, lat, lng) => {
    let url = "";
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || "Pakistan")}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Cannot open maps.");
    });
  };

  // Step 1: Confirm Pickup from Owner with OTP + Condition Photos
  const handleConfirmPickup = async () => {
    if (!pickupOtpInput.trim()) {
      Alert.alert("OTP Required", "Please ask the owner for their 4-digit pickup code.");
      return;
    }
    setSubmitting(true);
    try {
      const photosJson = JSON.stringify(photos);
      const res = await api.post(`/deliveries/${id}/pickup`, {
        pickupOtp: pickupOtpInput.trim(),
        conditionPhotos: photosJson,
      });
      Alert.alert("Pickup Confirmed! ✅", "Product received in good condition. You are now heading to the renter.");
      fetchDeliveryDetails();
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid OTP code. Please try again.";
      Alert.alert("Pickup Verification Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Confirm Dropoff to Renter with OTP
  const handleConfirmDropoff = async () => {
    if (!dropoffOtpInput.trim()) {
      Alert.alert("OTP Required", "Please ask the renter for their 4-digit delivery code.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/deliveries/${id}/dropoff`, {
        dropoffOtp: dropoffOtpInput.trim(),
      });
      Alert.alert("Delivery Completed! 🎉", "Great job! The item has been safely delivered and payment fee recorded.", [
        {
          text: "Back to Jobs",
          onPress: () => navigate("/courier-home"),
        },
      ]);
      fetchDeliveryDetails();
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid OTP code. Please check with renter.";
      Alert.alert("Dropoff Verification Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !delivery) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading delivery details...</Text>
      </SafeAreaView>
    );
  }

  const isPickedUp = delivery.status === "InTransit" || delivery.status === "PickedUp" || delivery.status === "Delivered";
  const isDelivered = delivery.status === "Delivered";

  // Leaflet map showing pickup pin, dropoff pin, and rider pin
  const pickupLat = delivery.pickupLatitude || 33.5973;
  const pickupLng = delivery.pickupLongitude || 73.0479;
  const dropLat = delivery.dropoffLatitude || 33.6000;
  const dropLng = delivery.dropoffLongitude || 73.0550;
  const riderLat = delivery.courierLatitude || pickupLat;
  const riderLng = delivery.courierLongitude || pickupLng;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${riderLat}, ${riderLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Pickup Pin
          var pickupIcon = L.divIcon({
            html: '<div style="background-color: #9333EA; color: white; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white;">📦</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          L.marker([${pickupLat}, ${pickupLng}], { icon: pickupIcon }).addTo(map).bindPopup("Pickup (Owner)");

          // Dropoff Pin
          var dropIcon = L.divIcon({
            html: '<div style="background-color: #EF4444; color: white; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white;">🎯</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          L.marker([${dropLat}, ${dropLng}], { icon: dropIcon }).addTo(map).bindPopup("Dropoff (Renter)");

          // Rider Moving Pin
          var riderIcon = L.divIcon({
            html: '<div style="background-color: #10B981; color: white; width: 36px; height: 36px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">🛵</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          L.marker([${riderLat}, ${riderLng}], { icon: riderIcon }).addTo(map).bindPopup("You (Courier)");

          var group = new L.featureGroup([
            L.marker([${pickupLat}, ${pickupLng}]),
            L.marker([${dropLat}, ${dropLng}]),
            L.marker([${riderLat}, ${riderLng}])
          ]);
          map.fitBounds(group.getBounds().pad(0.3));
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate("/courier-home")}>
          <ArrowLeft size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Delivery #{delivery.deliveryId}</Text>
          <Text style={styles.headerSubtitle}>
            Status: <Text style={{ color: "#9333EA", fontWeight: "700" }}>{delivery.status}</Text>
          </Text>
        </View>
        <View style={styles.feeHeaderBadge}>
          <Text style={styles.feeHeaderAmount}>Rs. {delivery.deliveryFee}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Tracker */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerStep}>
            <View style={[styles.stepCircle, styles.stepCompleted]}>
              <CheckCircle2 size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>Assigned</Text>
          </View>

          <View style={[styles.stepConnector, isPickedUp && styles.connectorActive]} />

          <View style={styles.trackerStep}>
            <View style={[styles.stepCircle, isPickedUp ? styles.stepCompleted : styles.stepCurrent]}>
              {isPickedUp ? <CheckCircle2 size={16} color="#FFFFFF" /> : <Text style={styles.stepNum}>2</Text>}
            </View>
            <Text style={styles.stepTitle}>Picked Up</Text>
          </View>

          <View style={[styles.stepConnector, isDelivered && styles.connectorActive]} />

          <View style={styles.trackerStep}>
            <View style={[styles.stepCircle, isDelivered ? styles.stepCompleted : styles.stepPending]}>
              {isDelivered ? <CheckCircle2 size={16} color="#FFFFFF" /> : <Text style={styles.stepNum}>3</Text>}
            </View>
            <Text style={styles.stepTitle}>Delivered</Text>
          </View>
        </View>

        {/* Live Route Map */}
        <View style={styles.mapCard}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={{ width: "100%", height: 180 }}
            scrollEnabled={false}
          />
        </View>

        {/* Product Summary Box */}
        <View style={styles.productCard}>
          <View style={styles.productThumbWrap}>
            {delivery.product?.primaryImage ? (
              <Image source={{ uri: delivery.product.primaryImage }} style={styles.productThumb} />
            ) : (
              <Package size={28} color="#9333EA" />
            )}
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productTitle}>{delivery.product?.title || "Rental Package"}</Text>
            <Text style={styles.productPrice}>Daily Rate: Rs. {delivery.product?.pricePerDay}/day</Text>
          </View>
        </View>

        {/* SECTION 1: PICKUP FROM OWNER */}
        <View style={[styles.actionSection, isPickedUp && styles.sectionFinished]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionNum, { backgroundColor: isPickedUp ? "#10B981" : "#9333EA" }]}>
              {isPickedUp ? <CheckCircle2 size={14} color="#FFFFFF" /> : <Text style={styles.sectionNumText}>1</Text>}
            </View>
            <Text style={styles.sectionHeading}>
              {isPickedUp ? "Pickup Completed" : "Step 1: Pick Up from Owner"}
            </Text>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactRole}>OWNER / SENDER</Text>
              <Text style={styles.contactName}>{delivery.owner?.username || "Owner"}</Text>
              <Text style={styles.contactAddress}>
                {delivery.pickupAddress || `${delivery.owner?.city || "Rawalpindi"}, Pakistan`}
              </Text>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={() => handleCall(delivery.owner?.phoneNo)}
              >
                <Phone size={18} color="#9333EA" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={() => handleOpenMaps(delivery.pickupAddress, delivery.pickupLatitude, delivery.pickupLongitude)}
              >
                <Navigation size={18} color="#9333EA" />
              </TouchableOpacity>
            </View>
          </View>

          {!isPickedUp && (
            <View style={styles.verificationBox}>
              {/* Dispute Resolution Note */}
              <View style={styles.disputeNotice}>
                <ShieldCheck size={18} color="#9333EA" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.disputeNoticeTitle}>Pre-Pickup Condition Proof</Text>
                  <Text style={styles.disputeNoticeDesc}>
                    Take 3 photos of the item's condition to protect both owner and renter from false damage claims.
                  </Text>
                </View>
              </View>

              {/* Photo Preview Thumbnails */}
              <View style={styles.photosRow}>
                {photos.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrap}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <View style={styles.photoCheckBadge}>
                      <CheckCircle2 size={12} color="#FFFFFF" />
                    </View>
                  </View>
                ))}
              </View>

              {/* Owner OTP Input */}
              <Text style={styles.otpInputLabel}>Enter Owner's 4-Digit Handover Code:</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="e.g. 4829"
                value={pickupOtpInput}
                onChangeText={setPickupOtpInput}
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[styles.primaryActionBtn, submitting && styles.btnDisabled]}
                onPress={handleConfirmPickup}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionBtnText}>Verify OTP & Confirm Pickup</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SECTION 2: DELIVER TO RENTER */}
        <View style={[styles.actionSection, !isPickedUp && styles.sectionDisabled]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionNum, { backgroundColor: isDelivered ? "#10B981" : "#EF4444" }]}>
              {isDelivered ? <CheckCircle2 size={14} color="#FFFFFF" /> : <Text style={styles.sectionNumText}>2</Text>}
            </View>
            <Text style={styles.sectionHeading}>
              {isDelivered ? "Delivery Completed" : "Step 2: Deliver to Renter"}
            </Text>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactRole}>RENTER / RECIPIENT</Text>
              <Text style={styles.contactName}>{delivery.renter?.username || "Renter"}</Text>
              <Text style={styles.contactAddress}>
                {delivery.dropoffAddress || `${delivery.renter?.city || "Rawalpindi"}, Pakistan`}
              </Text>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={() => handleCall(delivery.renter?.phoneNo)}
                disabled={!isPickedUp}
              >
                <Phone size={18} color={isPickedUp ? "#9333EA" : "#D1D5DB"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={() => handleOpenMaps(delivery.dropoffAddress, delivery.dropoffLatitude, delivery.dropoffLongitude)}
                disabled={!isPickedUp}
              >
                <Navigation size={18} color={isPickedUp ? "#9333EA" : "#D1D5DB"} />
              </TouchableOpacity>
            </View>
          </View>

          {isPickedUp && !isDelivered && (
            <View style={styles.verificationBox}>
              <Text style={styles.otpInputLabel}>Enter Renter's 4-Digit Delivery Code:</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="e.g. 7153"
                value={dropoffOtpInput}
                onChangeText={setDropoffOtpInput}
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[styles.completeActionBtn, submitting && styles.btnDisabled]}
                onPress={handleConfirmDropoff}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionBtnText}>Verify OTP & Complete Delivery</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {isDelivered && (
            <View style={styles.deliveredSuccessBanner}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={styles.deliveredSuccessText}>Successfully Delivered to Renter!</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  feeHeaderBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  feeHeaderAmount: {
    color: "#15803D",
    fontSize: 14,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  trackerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trackerStep: {
    alignItems: "center",
    width: 70,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCompleted: {
    backgroundColor: "#10B981",
  },
  stepCurrent: {
    backgroundColor: "#9333EA",
  },
  stepPending: {
    backgroundColor: "#E5E7EB",
  },
  stepNum: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    marginTop: 6,
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  connectorActive: {
    backgroundColor: "#10B981",
  },
  mapCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productThumbWrap: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  productMeta: {
    marginLeft: 12,
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  productPrice: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  actionSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionFinished: {
    borderColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  sectionDisabled: {
    opacity: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionNumText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  contactCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactRole: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  contactName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  contactAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  disputeNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  disputeNoticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
  },
  disputeNoticeDesc: {
    fontSize: 11,
    color: "#6B21A8",
    marginTop: 2,
    lineHeight: 15,
  },
  photosRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  photoThumbWrap: {
    flex: 1,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photoThumb: {
    width: "100%",
    height: "100%",
  },
  photoCheckBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 2,
  },
  otpInputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  otpInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    height: 48,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 8,
    color: "#111827",
    marginBottom: 12,
  },
  primaryActionBtn: {
    backgroundColor: "#9333EA",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  completeActionBtn: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  deliveredSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  deliveredSuccessText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 14,
  },
});
