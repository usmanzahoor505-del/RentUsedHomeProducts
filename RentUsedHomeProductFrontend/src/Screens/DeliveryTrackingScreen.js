import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  KeyRound,
  ExternalLink,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { useUser } from "../context/UserContext";
import api from "../utils/api";

const { width } = Dimensions.get("window");

export default function DeliveryTrackingScreen() {
  const navigate = useNavigate();
  const { id } = useParams(); // rentalId
  const { userId } = useUser();

  const [deliveryData, setDeliveryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const webViewRef = useRef(null);

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(() => {
      fetchTrackingData(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchTrackingData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.get(`/deliveries/by-rental/${id}`);
      setDeliveryData(res.data);
      setErrorMsg(null);
    } catch (error) {
      console.error("Failed to load tracking data:", error);
      if (showLoading) {
        setErrorMsg("No active delivery found for this rental.");
      }
    } finally {
      if (showLoading) setIsLoading(false);
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Locating courier & shipment...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg || !deliveryData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Package size={48} color="#D1D5DB" />
        <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700", color: "#374151" }}>
          {errorMsg || "Delivery Not Found"}
        </Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigate(-1)}>
          <Text style={styles.backHomeText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOwner = userId === deliveryData.owner?.userId;
  const isRenter = userId === deliveryData.renter?.userId;

  const isAssigned = deliveryData.status !== "Pending";
  const isPickedUp = deliveryData.status === "InTransit" || deliveryData.status === "Delivered";
  const isDelivered = deliveryData.status === "Delivered";

  // Coordinates
  const pickupLat = deliveryData.pickupLatitude || 33.5973;
  const pickupLng = deliveryData.pickupLongitude || 73.0479;
  const dropLat = deliveryData.dropoffLatitude || 33.6000;
  const dropLng = deliveryData.dropoffLongitude || 73.0550;
  const courierLat = deliveryData.courierLatitude || pickupLat;
  const courierLng = deliveryData.courierLongitude || pickupLng;

  // Condition photos parse
  let conditionPhotos = [];
  try {
    if (deliveryData.conditionPhotos) {
      conditionPhotos = JSON.parse(deliveryData.conditionPhotos);
    }
  } catch (e) {
    // fallback
  }

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
          var map = L.map('map', { zoomControl: false }).setView([${courierLat}, ${courierLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Owner Pickup Pin
          var pickupIcon = L.divIcon({
            html: '<div style="background-color: #9333EA; color: white; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white;">📦</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          L.marker([${pickupLat}, ${pickupLng}], { icon: pickupIcon }).addTo(map).bindPopup("Pickup (Owner)");

          // Renter Dropoff Pin
          var dropIcon = L.divIcon({
            html: '<div style="background-color: #EF4444; color: white; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white;">🎯</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          L.marker([${dropLat}, ${dropLng}], { icon: dropIcon }).addTo(map).bindPopup("Destination (Renter)");

          ${
            isAssigned
              ? `
          // Courier Moving Pin
          var courierIcon = L.divIcon({
            html: '<div style="background-color: #10B981; color: white; width: 36px; height: 36px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4);">🛵</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          L.marker([${courierLat}, ${courierLng}], { icon: courierIcon }).addTo(map).bindPopup("<b>${deliveryData.courier?.username || 'Courier Rider'}</b><br>Live GPS Active");
          `
              : ""
          }

          var group = new L.featureGroup([
            L.marker([${pickupLat}, ${pickupLng}]),
            L.marker([${dropLat}, ${dropLng}])
          ]);
          map.fitBounds(group.getBounds().pad(0.35));
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Live Delivery Tracking</Text>
          <Text style={styles.headerSubtitle}>Order #{id}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{deliveryData.status}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Leaflet Map with Live Courier Pin */}
        <View style={styles.mapCard}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={{ width: "100%", height: 210 }}
            scrollEnabled={false}
          />
        </View>

        {/* Courier Driver Card (If Assigned) */}
        {deliveryData.courier ? (
          <View style={styles.courierCard}>
            <View style={styles.courierHeader}>
              <View style={styles.courierAvatar}>
                <Truck size={24} color="#FFFFFF" />
              </View>
              <View style={styles.courierMeta}>
                <View style={styles.courierNameRow}>
                  <Text style={styles.courierName}>{deliveryData.courier.username}</Text>
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color="#15803D" />
                    <Text style={styles.verifiedText}>Verified Partner</Text>
                  </View>
                </View>
                <Text style={styles.courierVehicle}>
                  {deliveryData.courier.vehicleType || "Motorcycle"} • {deliveryData.courier.vehiclePlate || "Courier"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callCourierBtn}
                onPress={() => handleCall(deliveryData.courier.phoneNo)}
              >
                <Phone size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.etaRow}>
              <Clock size={14} color="#9333EA" />
              <Text style={styles.etaText}>
                {isDelivered
                  ? "Delivered successfully"
                  : isPickedUp
                  ? "In Transit — Rider is heading to delivery location"
                  : "Assigned — Rider is heading to owner for pickup"}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.waitingCourierCard}>
            <ActivityIndicator size="small" color="#9333EA" />
            <Text style={styles.waitingCourierText}>
              Searching for nearest available delivery rider...
            </Text>
          </View>
        )}

        {/* ROLE SPECIFIC OTP CODES (Crucial for secure handover) */}
        {isOwner && !isPickedUp && deliveryData.pickupOtp && (
          <View style={styles.otpCard}>
            <View style={styles.otpHeader}>
              <KeyRound size={20} color="#9333EA" />
              <Text style={styles.otpCardTitle}>Your Pickup Handover Code</Text>
            </View>
            <View style={styles.otpCodeBox}>
              <Text style={styles.otpCodeText}>{deliveryData.pickupOtp}</Text>
            </View>
            <Text style={styles.otpInstruction}>
              Give this 4-digit code to the courier after he inspects and takes photos of your item before taking it.
            </Text>
          </View>
        )}

        {isRenter && !isDelivered && deliveryData.dropoffOtp && (
          <View style={styles.otpCard}>
            <View style={styles.otpHeader}>
              <KeyRound size={20} color="#10B981" />
              <Text style={[styles.otpCardTitle, { color: "#10B981" }]}>Your Delivery Handover Code</Text>
            </View>
            <View style={[styles.otpCodeBox, { borderColor: "#A7F3D0", backgroundColor: "#ECFDF5" }]}>
              <Text style={[styles.otpCodeText, { color: "#059669" }]}>{deliveryData.dropoffOtp}</Text>
            </View>
            <Text style={styles.otpInstruction}>
              Share this 4-digit code with the courier rider when he arrives at your doorstep to confirm you received the item.
            </Text>
          </View>
        )}

        {/* Condition Inspection Photos (Crucial Proof for Owner & Renter) */}
        {conditionPhotos.length > 0 && (
          <View style={styles.photosSection}>
            <View style={styles.photosSectionHeader}>
              <ShieldCheck size={18} color="#9333EA" />
              <Text style={styles.photosSectionTitle}>Courier Condition Inspection</Text>
            </View>
            <Text style={styles.photosSubtitle}>
              Timestamped photos taken by courier at pickup to verify initial item condition:
            </Text>
            <View style={styles.photosGrid}>
              {conditionPhotos.map((url, idx) => (
                <View key={idx} style={styles.inspectionPhotoWrap}>
                  <Image source={{ uri: url }} style={styles.inspectionPhoto} />
                  <View style={styles.photoIndexBadge}>
                    <Text style={styles.photoIndexText}>Photo {idx + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delivery Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>Delivery Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product:</Text>
            <Text style={styles.detailVal}>{deliveryData.product?.title || "Rental Item"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Address:</Text>
            <Text style={styles.detailVal}>{deliveryData.pickupAddress}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.detailVal}>{deliveryData.dropoffAddress}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Fee:</Text>
            <Text style={[styles.detailVal, { color: "#15803D", fontWeight: "700" }]}>
              Rs. {deliveryData.deliveryFee}
            </Text>
          </View>
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
    padding: 20,
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
  },
  statusPill: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: "#9333EA",
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mapCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  courierCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courierHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  courierAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
  },
  courierMeta: {
    flex: 1,
    marginLeft: 12,
  },
  courierNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  courierName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },
  courierVehicle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
  callCourierBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 6,
  },
  etaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B21A8",
  },
  waitingCourierCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  waitingCourierText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  otpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
    alignItems: "center",
  },
  otpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  otpCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9333EA",
  },
  otpCodeBox: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1.5,
    borderColor: "#C084FC",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 10,
  },
  otpCodeText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 10,
    color: "#7C3AED",
  },
  otpInstruction: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 16,
  },
  photosSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  photosSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  photosSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  photosSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 10,
  },
  photosGrid: {
    flexDirection: "row",
    gap: 10,
  },
  inspectionPhotoWrap: {
    flex: 1,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  inspectionPhoto: {
    width: "100%",
    height: "100%",
  },
  photoIndexBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoIndexText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailVal: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  backHomeBtn: {
    marginTop: 16,
    backgroundColor: "#9333EA",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backHomeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
