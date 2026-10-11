import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigate } from "react-router";
import LinearGradient from "react-native-linear-gradient";
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Mail,
  Truck,
  Bike,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Car,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { useUser } from "../context/UserContext";
import api from "../utils/api";
import {
  requestLocationPermission,
  getCityCoords,
  PAKISTANI_CITIES_COORDS,
} from "../utils/locationUtils";

const { width } = Dimensions.get("window");

const VEHICLE_OPTIONS = [
  {
    id: "Motorcycle",
    title: "Motorcycle",
    desc: "Bike / Scooter (Up to 20kg)",
    icon: Bike,
  },
  {
    id: "Car",
    title: "Car / Sedan",
    desc: "Electronics & Fragile Items",
    icon: Car,
  },
  {
    id: "Rickshaw",
    title: "Rickshaw",
    desc: "Medium Goods & Appliances",
    icon: Truck,
  },
  {
    id: "Van",
    title: "Pickup Van / Loader",
    desc: "Heavy Furniture & Large Items",
    icon: Truck,
  },
];

const PAKISTANI_CITIES = [
  "Rawalpindi",
  "Islamabad",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Faisalabad",
  "Multan",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
];

export default function CourierInfoScreen() {
  const navigate = useNavigate();
  const {
    userId,
    userName,
    setUserName,
    userEmail,
    userPhone,
    setUserPhone,
    userCnic,
    setUserCnic,
    userCity,
    setUserCity,
    vehicleType,
    setVehicleType,
    vehiclePlate,
    setVehiclePlate,
    courierLat,
    setCourierLat,
    courierLng,
    setCourierLng,
    setUserRole,
    setIsOnline,
  } = useUser();

  // Profile Form State
  const [name, setName] = useState(userName || "");
  const [phone, setPhone] = useState(userPhone || "");
  const [cnic, setCnic] = useState(userCnic || "");
  const [city, setCity] = useState(userCity || "Rawalpindi");

  // Vehicle Form State
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleType || "Motorcycle");
  const [plateNumber, setPlateNumber] = useState(vehiclePlate || "");

  // GPS Calibration State
  const cityDefault = getCityCoords(userCity || "Rawalpindi");
  const [currentLat, setCurrentLat] = useState(courierLat || cityDefault.latitude);
  const [currentLng, setCurrentLng] = useState(courierLng || cityDefault.longitude);
  const [isGpsAcquired, setIsGpsAcquired] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatusText, setGpsStatusText] = useState("Tap button below to calibrate live GPS");

  const [saving, setSaving] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    // Attempt automatic GPS calibration on mount
    calibrateGpsLocation();
  }, []);

  const calibrateGpsLocation = async () => {
    setIsLocating(true);
    setGpsStatusText("Requesting device GPS permission...");
    try {
      const hasPerm = await requestLocationPermission();
      if (!hasPerm) {
        setGpsStatusText("GPS permission denied. Using city default.");
        setIsLocating(false);
        return;
      }

      setGpsStatusText("Acquiring high-accuracy GPS coordinates...");
      // Trigger WebView GPS acquisition
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: "ACQUIRE_GPS" }));
      }

      // Timeout fallback in case device takes too long
      setTimeout(() => {
        setIsLocating(false);
      }, 7000);
    } catch (err) {
      console.warn("GPS calibration error:", err);
      setIsLocating(false);
      setGpsStatusText("Location error. Tap to retry.");
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "GPS_RESULT") {
        if (data.success && data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          setCurrentLat(lat);
          setCurrentLng(lng);
          setIsGpsAcquired(true);
          setIsLocating(false);
          setGpsStatusText(`GPS Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } else {
          setIsLocating(false);
          setGpsStatusText(data.error || "Could not acquire GPS. Using city center.");
        }
      }
    } catch (e) {
      setIsLocating(false);
    }
  };

  const handleSaveCourierInfo = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Phone Required", "Please enter your contact phone number.");
      return;
    }
    if (!plateNumber.trim()) {
      Alert.alert("Vehicle Plate Required", "Please enter your vehicle registration plate number (e.g. RWP-7788).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: name.trim(),
        phoneNo: phone.trim(),
        city: city,
        cnic: cnic ? cnic.trim() : null,
        vehicleType: selectedVehicle,
        vehiclePlate: plateNumber.trim().toUpperCase(),
        latitude: currentLat,
        longitude: currentLng,
      };

      if (userId) {
        await api.put(`/users/${userId}/courier-info`, payload);
      }

      // Update local Context
      setUserName(name.trim());
      setUserPhone(phone.trim());
      setUserCity(city);
      if (cnic) setUserCnic(cnic.trim());
      setVehicleType(selectedVehicle);
      setVehiclePlate(plateNumber.trim().toUpperCase());
      setCourierLat(currentLat);
      setCourierLng(currentLng);
      setUserRole("Courier");
      setIsOnline(true);

      Alert.alert(
        "Setup Complete! 🛵",
        "Your courier profile, vehicle details, and GPS location have been verified successfully. Welcome to Easy Rent Courier!",
        [
          {
            text: "Launch Courier Radar",
            onPress: () => navigate("/courier-home"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to update courier info:", error);
      const msg = error.response?.data?.message || "Could not save courier details. Please try again.";
      Alert.alert("Save Failed", msg);
    } finally {
      setSaving(false);
    }
  };

  // Hidden WebView code providing HTML5 Geolocation API with Android GPS bridge
  const gpsBridgeHtml = `
    <!DOCTYPE html>
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body>
        <script>
          function getPosition() {
            if (!navigator.geolocation) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'GPS_RESULT',
                success: false,
                error: 'GPS not supported on device'
              }));
              return;
            }
            navigator.geolocation.getCurrentPosition(
              function(pos) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'GPS_RESULT',
                  success: true,
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude
                }));
              },
              function(err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'GPS_RESULT',
                  success: false,
                  error: err.message
                }));
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 }
            );
          }

          document.addEventListener('message', function(e) {
            try {
              var msg = JSON.parse(e.data);
              if (msg.type === 'ACQUIRE_GPS') {
                getPosition();
              }
            } catch(ex) {}
          });
          window.addEventListener('message', function(e) {
            try {
              var msg = JSON.parse(e.data);
              if (msg.type === 'ACQUIRE_GPS') {
                getPosition();
              }
            } catch(ex) {}
          });
          // Run immediately on load
          getPosition();
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden GPS bridge */}
      <View style={{ height: 0, width: 0, opacity: 0 }}>
        <WebView
          ref={webViewRef}
          source={{ html: gpsBridgeHtml }}
          onMessage={handleWebViewMessage}
          geolocationEnabled={true}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Banner */}
        <LinearGradient
          colors={["#9333EA", "#7C3AED", "#6D28D9"]}
          style={styles.headerBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.badgeRow}>
            <View style={styles.statusPill}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.statusPillText}>Courier Rider Onboarding</Text>
            </View>
          </View>
          <Text style={styles.bannerTitle}>Courier Profile & Vehicle</Text>
          <Text style={styles.bannerSubtext}>
            Verify your identity, vehicle details, and device GPS to start accepting deliveries.
          </Text>
        </LinearGradient>

        {/* SECTION 1: Personal Information ("About Yourself") */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={20} color="#9333EA" />
            <Text style={styles.cardTitle}>1. About Yourself (Courier Info)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number (For pickup & dropoff calls)</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="03XX-XXXXXXX"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CNIC Number (National Identity)</Text>
            <View style={styles.inputWrapper}>
              <CreditCard size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cnic}
                onChangeText={setCnic}
                placeholder="XXXXX-XXXXXXX-X"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Operating City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityChipsRow}>
              {PAKISTANI_CITIES.map((c) => {
                const isSelected = city?.toLowerCase() === c.toLowerCase();
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cityChip, isSelected && styles.cityChipActive]}
                    onPress={() => {
                      setCity(c);
                      const coords = getCityCoords(c);
                      if (!isGpsAcquired) {
                        setCurrentLat(coords.latitude);
                        setCurrentLng(coords.longitude);
                      }
                    }}
                  >
                    <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Registered Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: "#F3F4F6" }]}>
              <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
              <Text style={styles.readOnlyText}>{userEmail || "courier@rentused.pk"}</Text>
            </View>
          </View>
        </View>

        {/* SECTION 2: Vehicle Information ("About Vehicle") */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Truck size={20} color="#9333EA" />
            <Text style={styles.cardTitle}>2. About Your Vehicle</Text>
          </View>

          <Text style={styles.inputLabel}>Select Vehicle Type</Text>
          <View style={styles.vehicleGrid}>
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = selectedVehicle === v.id;
              const IconComp = v.icon;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleOptionCard, isSelected && styles.vehicleOptionActive]}
                  onPress={() => setSelectedVehicle(v.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.vehicleIconCircle, isSelected && styles.vehicleIconCircleActive]}>
                    <IconComp size={22} color={isSelected ? "#FFFFFF" : "#9333EA"} />
                  </View>
                  <Text style={[styles.vehicleTitle, isSelected && styles.vehicleTitleActive]}>
                    {v.title}
                  </Text>
                  <Text style={styles.vehicleDesc}>{v.desc}</Text>
                  {isSelected && (
                    <View style={styles.vehicleSelectedBadge}>
                      <CheckCircle2 size={14} color="#9333EA" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <Text style={styles.inputLabel}>Vehicle Registration Plate Number</Text>
            <View style={styles.inputWrapper}>
              <Truck size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontWeight: "700", letterSpacing: 1 }]}
                value={plateNumber}
                onChangeText={(val) => setPlateNumber(val.toUpperCase())}
                placeholder="e.g. RWP-7788 or ICT-1234"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>
            <Text style={styles.helperText}>
              Official license plate of the vehicle you will use for delivery orders.
            </Text>
          </View>
        </View>

        {/* SECTION 3: Live Device GPS Calibration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Navigation size={20} color="#9333EA" />
            <Text style={styles.cardTitle}>3. Live Device GPS Location</Text>
          </View>

          <Text style={styles.gpsExplanation}>
            Easy Rent uses your real-time GPS location to calculate exact route distances and match you with nearby orders in {city}.
          </Text>

          <View style={styles.gpsStatusCard}>
            <View style={styles.gpsCoordsRow}>
              <View style={[styles.gpsDot, isGpsAcquired ? styles.gpsDotActive : styles.gpsDotPending]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsCoordsTitle}>
                  {isGpsAcquired ? "GPS Status: Calibrated & Active" : "GPS Status: Default City Center"}
                </Text>
                <Text style={styles.gpsCoordsSubtitle}>
                  Lat: {currentLat.toFixed(4)} | Lng: {currentLng.toFixed(4)} ({city})
                </Text>
                <Text style={styles.gpsStatusDetail}>{gpsStatusText}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.calibrateBtn, isLocating && styles.calibrateBtnDisabled]}
              onPress={calibrateGpsLocation}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#9333EA" />
              ) : (
                <RefreshCw size={16} color="#9333EA" />
              )}
              <Text style={styles.calibrateBtnText}>
                {isLocating ? "Calibrating Device GPS..." : "Acquire Current GPS Location"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSaveCourierInfo}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Save & Launch Courier Radar</Text>
              <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBanner: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  bannerSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#111827",
  },
  readOnlyText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  helperText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    marginLeft: 2,
  },
  cityChipsRow: {
    paddingVertical: 4,
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cityChipActive: {
    backgroundColor: "#9333EA",
    borderColor: "#7C3AED",
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  cityChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  vehicleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  vehicleOptionCard: {
    width: (width - 64 - 10) / 2,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  vehicleOptionActive: {
    borderColor: "#9333EA",
    backgroundColor: "#FAF5FF",
  },
  vehicleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  vehicleIconCircleActive: {
    backgroundColor: "#9333EA",
  },
  vehicleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 2,
  },
  vehicleTitleActive: {
    color: "#9333EA",
  },
  vehicleDesc: {
    fontSize: 11,
    color: "#9CA3AF",
    lineHeight: 14,
  },
  vehicleSelectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  gpsExplanation: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
    marginBottom: 12,
  },
  gpsStatusCard: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
    borderRadius: 14,
    padding: 14,
  },
  gpsCoordsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  gpsDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 10,
  },
  gpsDotActive: {
    backgroundColor: "#10B981",
  },
  gpsDotPending: {
    backgroundColor: "#F59E0B",
  },
  gpsCoordsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  gpsCoordsSubtitle: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 2,
  },
  gpsStatusDetail: {
    fontSize: 11,
    color: "#6B7280",
  },
  calibrateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C084FC",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  calibrateBtnDisabled: {
    opacity: 0.6,
  },
  calibrateBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9333EA",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9333EA",
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
