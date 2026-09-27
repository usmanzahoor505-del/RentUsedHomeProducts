import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigate } from "react-router";
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  Package,
  Phone,
  ArrowRight,
  LogOut,
  RefreshCw,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { useUser } from "../context/UserContext";
import api, { API_URL } from "../utils/api";
import { getCityCoords } from "../utils/locationUtils";

const { width } = Dimensions.get("window");

export default function CourierHomeScreen() {
  const navigate = useNavigate();
  const { 
    userId, 
    userName, 
    userCity, 
    userPhone, 
    vehicleType, 
    vehiclePlate, 
    isOnline, 
    setIsOnline, 
    setIsLoggedIn,
    setUserRole,
  } = useUser();

  const cityCoords = getCityCoords(userCity);
  const [courierLat, setCourierLat] = useState(cityCoords.latitude);
  const [courierLng, setCourierLng] = useState(cityCoords.longitude);

  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const webViewRef = useRef(null);

  useEffect(() => {
    fetchCourierData();
  }, [userCity, userId]);

  const fetchCourierData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch available deliveries near this city / coordinates
      const resAvail = await api.get(
        `/deliveries/available?lat=${courierLat}&lng=${courierLng}&city=${userCity || "Rawalpindi"}`
      );
      setAvailableDeliveries(resAvail.data || []);

      // 2. Fetch active delivery for this courier
      if (userId) {
        const resActive = await api.get(`/deliveries/active/${userId}`);
        if (resActive.data?.hasActive) {
          setActiveDelivery(resActive.data.delivery);
        } else {
          setActiveDelivery(null);
        }
      }
    } catch (error) {
      console.error("Failed to load courier data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourierData();
  };

  const handleToggleOnline = async (val) => {
    setIsOnline(val);
    try {
      if (userId) {
        await api.put(`/users/${userId}/courier-status`, {
          isOnline: val,
          latitude: courierLat,
          longitude: courierLng,
        });
      }
    } catch (e) {
      console.warn("Failed to sync online status:", e.message);
    }
  };

  const handleAcceptDelivery = async (deliveryId) => {
    if (!userId) {
      Alert.alert("Error", "Please log in to accept delivery jobs.");
      return;
    }
    setAcceptingId(deliveryId);
    try {
      const res = await api.post(`/deliveries/${deliveryId}/accept`, {
        courierId: userId,
      });
      Alert.alert(
        "Delivery Accepted! 🚀",
        "You have been assigned to this delivery. Head to the owner's location for pickup.",
        [
          {
            text: "View Active Job",
            onPress: () => navigate(`/courier-delivery/${deliveryId}`),
          },
        ]
      );
      fetchCourierData();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to accept delivery.";
      Alert.alert("Could not accept", msg);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setIsLoggedIn(false);
          navigate("/login");
        },
      },
    ]);
  };

  // Leaflet HTML showing Courier location & available delivery pickup pins
  const markersJs = availableDeliveries
    .filter((d) => d.pickupLatitude && d.pickupLongitude)
    .map(
      (d) => `
      L.marker([${d.pickupLatitude}, ${d.pickupLongitude}], {
        icon: L.divIcon({
          className: 'custom-icon',
          html: '<div style="background-color: #9333EA; color: white; width: 32px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📦</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(map).bindPopup("<b>${d.product?.title || 'Package'}</b><br>Fee: Rs. ${d.deliveryFee}<br>Pickup: ${d.owner?.username || 'Owner'}");
    `
    )
    .join("\n");

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

          // Rider GPS Pin
          var riderIcon = L.divIcon({
            className: 'rider-icon',
            html: '<div style="background-color: #10B981; color: white; width: 36px; height: 36px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4);">🛵</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          L.marker([${courierLat}, ${courierLng}], { icon: riderIcon }).addTo(map).bindPopup("<b>Your Location</b> (Rider)");

          // Available Deliveries Markers
          ${markersJs}
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.riderProfileRow}>
            <View style={styles.riderAvatar}>
              <Truck size={22} color="#FFFFFF" />
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.riderName}>{userName || "Rider"}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Courier</Text>
                </View>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleText}>
                  {vehicleType || "Motorcycle"} {vehiclePlate ? `• ${vehiclePlate}` : ""}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Online Status & Customer Switch Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusToggleContainer}>
            <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.statusLabel}>{isOnline ? "Online & Ready" : "Offline"}</Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: "#D1D5DB", true: "#C084FC" }}
              thumbColor={isOnline ? "#9333EA" : "#9CA3AF"}
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
          </View>

          <View style={styles.riderVehicleBadge}>
            <Truck size={14} color="#9333EA" style={{ marginRight: 4 }} />
            <Text style={styles.riderVehicleText}>{vehicleType || "Motorcycle"}{vehiclePlate ? ` • ${vehiclePlate}` : ""}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#9333EA"]} />
        }
      >
        {/* Active Delivery Alert Banner (If Any) */}
        {activeDelivery && (
          <TouchableOpacity
            style={styles.activeDeliveryCard}
            onPress={() => navigate(`/courier-delivery/${activeDelivery.deliveryId}`)}
            activeOpacity={0.85}
          >
            <View style={styles.activeHeader}>
              <View style={styles.activeBadge}>
                <Navigation size={14} color="#FFFFFF" />
                <Text style={styles.activeBadgeText}>ACTIVE JOB IN PROGRESS</Text>
              </View>
              <Text style={styles.activeStatus}>{activeDelivery.status}</Text>
            </View>

            <View style={styles.activeBody}>
              <Text style={styles.activeProductTitle}>
                {activeDelivery.product?.title || "Rental Package"}
              </Text>
              <View style={styles.activeRouteRow}>
                <MapPin size={14} color="#9333EA" />
                <Text style={styles.activeRouteText} numberOfLines={1}>
                  To: {activeDelivery.dropoffAddress || "Renter address"}
                </Text>
              </View>
            </View>

            <View style={styles.resumeBtn}>
              <Text style={styles.resumeBtnText}>Resume Delivery Screen</Text>
              <ChevronRight size={16} color="#9333EA" />
            </View>
          </TouchableOpacity>
        )}

        {/* Live Mini-Map Preview */}
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <View style={styles.mapTitleRow}>
              <MapPin size={16} color="#9333EA" />
              <Text style={styles.mapTitle}>Nearby Delivery Radar ({userCity || "Rawalpindi"})</Text>
            </View>
            <TouchableOpacity style={styles.refreshMapBtn} onPress={handleRefresh}>
              <RefreshCw size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.webViewWrap}>
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              style={styles.webView}
              scrollEnabled={false}
              geolocationEnabled={true}
            />
          </View>
        </View>

        {/* Available Delivery Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Available Jobs ({availableDeliveries.length})
          </Text>
          <Text style={styles.sectionSubtitle}>Sorted by proximity to you</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333EA" />
            <Text style={{ marginTop: 8, color: "#6B7280" }}>Finding nearby delivery requests...</Text>
          </View>
        ) : availableDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Deliveries Available Right Now</Text>
            <Text style={styles.emptySubtext}>
              When renters choose "Doorstep Delivery" in {userCity || "your city"}, new orders will appear here automatically!
            </Text>
            <TouchableOpacity style={styles.emptyRefreshBtn} onPress={handleRefresh}>
              <Text style={styles.emptyRefreshText}>Check for New Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          availableDeliveries.map((item) => {
            const isAccepting = acceptingId === item.deliveryId;
            return (
              <View key={item.deliveryId} style={styles.jobCard}>
                {/* Header: Product & Earnings */}
                <View style={styles.jobCardHeader}>
                  <View style={styles.productThumbBox}>
                    {item.product?.primaryImage ? (
                      <Image
                        source={{ uri: item.product.primaryImage }}
                        style={styles.productThumb}
                      />
                    ) : (
                      <Package size={24} color="#9333EA" />
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.jobProductTitle} numberOfLines={1}>
                      {item.product?.title || "Rental Item"}
                    </Text>
                    <Text style={styles.jobPickupDistance}>
                      📍 {item.distanceToPickupKm > 0 ? `${item.distanceToPickupKm} km from you` : "Near you"}
                    </Text>
                  </View>
                  <View style={styles.feeBadge}>
                    <Text style={styles.feeLabel}>Earn</Text>
                    <Text style={styles.feeAmount}>Rs. {item.deliveryFee}</Text>
                  </View>
                </View>

                {/* Pickup & Dropoff Route Details */}
                <View style={styles.routeContainer}>
                  <View style={styles.routeStep}>
                    <View style={[styles.stepDot, { backgroundColor: "#9333EA" }]} />
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepLabel}>PICKUP FROM OWNER</Text>
                      <Text style={styles.stepName}>{item.owner?.username || "Owner"}</Text>
                      <Text style={styles.stepAddress} numberOfLines={1}>
                        {item.pickupAddress || `${item.owner?.city || userCity}, Pakistan`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routeLine} />

                  <View style={styles.routeStep}>
                    <View style={[styles.stepDot, { backgroundColor: "#10B981" }]} />
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepLabel}>DELIVER TO RENTER</Text>
                      <Text style={styles.stepName}>{item.renter?.username || "Renter"}</Text>
                      <Text style={styles.stepAddress} numberOfLines={1}>
                        {item.dropoffAddress || `${item.renter?.city || userCity}, Pakistan`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Dispute Protection Pill */}
                <View style={styles.disputePill}>
                  <ShieldCheck size={14} color="#7C3AED" />
                  <Text style={styles.disputeText}>
                    3-Point condition inspection required before pickup
                  </Text>
                </View>

                {/* Accept Button */}
                <TouchableOpacity
                  style={[styles.acceptBtn, isAccepting && styles.acceptBtnDisabled]}
                  onPress={() => handleAcceptDelivery(item.deliveryId)}
                  disabled={isAccepting}
                >
                  {isAccepting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.acceptBtnText}>Accept Delivery (Rs. {item.deliveryFee})</Text>
                      <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}

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
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riderProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  riderName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  roleBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9333EA",
  },
  vehicleRow: {
    marginTop: 2,
  },
  vehicleText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOnline: {
    backgroundColor: "#10B981",
  },
  dotOffline: {
    backgroundColor: "#9CA3AF",
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  riderVehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  riderVehicleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9333EA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  activeDeliveryCard: {
    backgroundColor: "#9333EA",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  activeBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  activeStatus: {
    color: "#F3E8FF",
    fontSize: 12,
    fontWeight: "600",
  },
  activeBody: {
    marginTop: 12,
  },
  activeProductTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  activeRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  activeRouteText: {
    color: "#E9D5FF",
    fontSize: 13,
  },
  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
    gap: 4,
  },
  resumeBtnText: {
    color: "#9333EA",
    fontSize: 14,
    fontWeight: "700",
  },
  mapContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  mapTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  refreshMapBtn: {
    padding: 4,
  },
  webViewWrap: {
    height: 180,
    width: "100%",
  },
  webView: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  emptyRefreshBtn: {
    marginTop: 16,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyRefreshText: {
    color: "#9333EA",
    fontWeight: "700",
    fontSize: 13,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  productThumbBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobProductTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  jobPickupDistance: {
    fontSize: 12,
    color: "#9333EA",
    fontWeight: "600",
    marginTop: 2,
  },
  feeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 10,
    color: "#15803D",
    fontWeight: "600",
  },
  feeAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#15803D",
  },
  routeContainer: {
    marginTop: 14,
    paddingLeft: 6,
  },
  routeStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  stepInfo: {
    marginLeft: 10,
    flex: 1,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  stepName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 1,
  },
  stepAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginLeft: 4,
    marginVertical: 2,
  },
  disputePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
    gap: 6,
  },
  disputeText: {
    fontSize: 11,
    color: "#7C3AED",
    fontWeight: "600",
    flex: 1,
  },
  acceptBtn: {
    backgroundColor: "#9333EA",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  acceptBtnDisabled: {
    opacity: 0.6,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
