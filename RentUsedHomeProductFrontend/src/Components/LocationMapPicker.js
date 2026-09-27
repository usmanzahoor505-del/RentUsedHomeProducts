import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { X, MapPin, Navigation, Search, Check, Layers } from "lucide-react-native";
import { PAKISTANI_CITIES_COORDS, getCityCoords, requestLocationPermission } from "../utils/locationUtils";

const { width } = Dimensions.get("window");

// Popular preset locations across Pakistan
const QUICK_AREAS = [
  { name: "Rawalpindi (Center)", lat: 33.5973, lng: 73.0479 },
  { name: "Saddar, Rawalpindi", lat: 33.5950, lng: 73.0550 },
  { name: "Bahria Town, RWP", lat: 33.5244, lng: 73.1118 },
  { name: "Islamabad (Center)", lat: 33.6844, lng: 73.0479 },
  { name: "Blue Area, Islamabad", lat: 33.7100, lng: 73.0600 },
  { name: "F-10 / F-11, Islamabad", lat: 33.6930, lng: 72.9990 },
  { name: "DHA Islamabad", lat: 33.5350, lng: 73.1350 },
  { name: "Lahore (Center)", lat: 31.5204, lng: 74.3587 },
  { name: "Gulberg, Lahore", lat: 31.5134, lng: 74.3486 },
  { name: "Karachi (Center)", lat: 24.8607, lng: 67.0011 },
  { name: "Peshawar (Center)", lat: 34.0151, lng: 71.5249 },
  { name: "Faisalabad", lat: 31.4504, lng: 73.1350 },
  { name: "Multan", lat: 30.1575, lng: 71.5249 },
];

const RADIUS_OPTIONS = [2, 3, 4, 5, 10, 15];

export default function LocationMapPicker({
  visible,
  onClose,
  initialLocation,
  onSelectLocation,
  mode = "select", // "select" (for Add Product) or "filter" (for Home/Search)
  nearbyProducts = [],
  autoLocate = true,
}) {
  const webViewRef = useRef(null);

  const defaultCoords = getCityCoords(initialLocation?.address || initialLocation?.city || "Rawalpindi");
  const defaultLat = initialLocation?.latitude || defaultCoords.latitude;
  const defaultLng = initialLocation?.longitude || defaultCoords.longitude;
  const defaultRadius = initialLocation?.radiusKm || 3;
  const defaultAddress = initialLocation?.address || initialLocation?.location || `${defaultCoords.name}, Pakistan`;

  const [selectedLat, setSelectedLat] = useState(defaultLat);
  const [selectedLng, setSelectedLng] = useState(defaultLng);
  const [selectedRadius, setSelectedRadius] = useState(defaultRadius);
  const [address, setAddress] = useState(defaultAddress);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateStatus, setLocateStatus] = useState("");

  useEffect(() => {
    if (visible) {
      const coords = getCityCoords(initialLocation?.address || initialLocation?.city || "Rawalpindi");
      const lat = initialLocation?.latitude || coords.latitude;
      const lng = initialLocation?.longitude || coords.longitude;
      const rad = initialLocation?.radiusKm || 3;
      const addr = initialLocation?.address || initialLocation?.location || `${coords.name}, Pakistan`;
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSelectedRadius(rad);
      setAddress(addr);
      setLocateStatus("");

      // If autoLocate is requested, attempt GPS fetch after modal opens
      if (autoLocate) {
        triggerAutoLocation();
      }
    }
  }, [visible, initialLocation]);

  const triggerAutoLocation = async () => {
    try {
      const hasPerm = await requestLocationPermission();
      if (hasPerm) {
        setIsLocating(true);
        setLocateStatus("Acquiring current GPS location...");
        setTimeout(() => {
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: "LOCATE_NOW" }));
          }
        }, 800);
      }
    } catch {
      setIsLocating(false);
      setLocateStatus("");
    }
  };

  const handleLocateMe = async () => {
    setIsLocating(true);
    setLocateStatus("Finding current location...");
    const hasPerm = await requestLocationPermission();
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: "LOCATE_NOW" }));
    }
    setTimeout(() => {
      setIsLocating(false);
      setLocateStatus("");
    }, 10000);
  };

  // Generate Leaflet HTML
  const generateMapHtml = () => {
    const productsJson = JSON.stringify(nearbyProducts || []);
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map {
      margin: 0; padding: 0; height: 100%; width: 100%; background: #F3E8FF;
    }
    .custom-popup .leaflet-popup-content-wrapper {
      background: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(147, 51, 234, 0.2);
      padding: 6px;
    }
    .popup-title { font-weight: bold; font-size: 13px; color: #111827; }
    .popup-sub { font-size: 11px; color: #9333EA; margin-top: 2px; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var currentLat = ${selectedLat};
    var currentLng = ${selectedLng};
    var currentRadius = ${selectedRadius};
    var mode = "${mode}";
    var nearbyProducts = ${productsJson};

    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([currentLat, currentLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Main Location Pin Marker
    var centerIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    var marker = L.marker([currentLat, currentLng], {
      draggable: true,
      icon: centerIcon
    }).addTo(map);

    // Radius Circle (App Purple Theme: #9333EA)
    var circle = L.circle([currentLat, currentLng], {
      radius: currentRadius * 1000,
      color: '#9333EA',
      fillColor: '#A855F7',
      fillOpacity: 0.22,
      weight: 2.5
    }).addTo(map);

    function updateSelection(lat, lng, radius) {
      currentLat = lat;
      currentLng = lng;
      if (radius !== undefined) currentRadius = radius;

      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      circle.setRadius(currentRadius * 1000);

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'COORDINATES_CHANGED',
        lat: lat,
        lng: lng,
        radiusKm: currentRadius
      }));
    }

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      updateSelection(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      updateSelection(e.latlng.lat, e.latlng.lng);
    });

    // Display nearby product markers if in filter mode
    if (mode === 'filter' && nearbyProducts && nearbyProducts.length > 0) {
      nearbyProducts.forEach(function(p) {
        if (p.latitude && p.longitude) {
          var pMarker = L.circleMarker([p.latitude, p.longitude], {
            radius: 8,
            fillColor: '#9333EA',
            color: '#7C3AED',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
          }).addTo(map);

          var popupContent = '<div class="popup-title">' + (p.title || 'Product') + '</div>' +
                             '<div class="popup-sub">Rs. ' + (p.pricePerDay || 0) + '/day</div>' +
                             (p.distanceKm !== undefined ? '<div class="popup-sub" style="color:#059669">📍 ' + p.distanceKm + ' km away</div>' : '');
          pMarker.bindPopup(popupContent);
        }
      });
    }

    // Geolocation function
    function locateUser() {
      if (!navigator.geolocation) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOCATE_RESULT',
          success: false,
          error: 'Geolocation is not supported by your device'
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function(position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          map.setView([lat, lng], 15);
          updateSelection(lat, lng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOCATE_RESULT',
            success: true,
            lat: lat,
            lng: lng
          }));
        },
        function(err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOCATE_RESULT',
            success: false,
            error: err.message
          }));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
      );
    }

    function handleIncomingMessage(msg) {
      try {
        var data = JSON.parse(msg);
        if (data.type === 'SET_CENTER') {
          map.setView([data.lat, data.lng], 14);
          updateSelection(data.lat, data.lng, data.radiusKm || currentRadius);
        } else if (data.type === 'SET_RADIUS') {
          currentRadius = data.radiusKm;
          circle.setRadius(currentRadius * 1000);
        } else if (data.type === 'LOCATE_NOW') {
          locateUser();
        }
      } catch (err) {}
    }

    window.addEventListener('message', function(e) { handleIncomingMessage(e.data); });
    document.addEventListener('message', function(e) { handleIncomingMessage(e.data); });
  </script>
</body>
</html>
    `;
  };

  // Reverse Geocode coordinates to human-readable address
  const fetchAddress = async (lat, lng) => {
    try {
      // Find nearest preset first for instant feedback
      let closestPreset = null;
      let minDistance = 999999;
      QUICK_AREAS.forEach((q) => {
        const d = Math.hypot(q.lat - lat, q.lng - lng);
        if (d < minDistance) {
          minDistance = d;
          closestPreset = q;
        }
      });

      if (minDistance < 0.015 && closestPreset) {
        setAddress(closestPreset.name);
        return;
      }

      // Reverse geocode via OSM Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "RentUsedProductsApp/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.residential;
        const city = data.address?.city || data.address?.town || data.address?.county || "Rawalpindi";
        const formatted = suburb ? `${suburb}, ${city}` : (data.display_name?.split(",").slice(0, 3).join(",") || city);
        setAddress(formatted);
      }
    } catch {
      // Fallback
      setAddress(lat > 33.65 ? "Islamabad, Pakistan" : "Rawalpindi, Pakistan");
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "COORDINATES_CHANGED") {
        const lat = parseFloat(data.lat.toFixed(5));
        const lng = parseFloat(data.lng.toFixed(5));
        setSelectedLat(lat);
        setSelectedLng(lng);
        fetchAddress(lat, lng);
      } else if (data.type === "LOCATE_RESULT") {
        setIsLocating(false);
        if (data.success) {
          setLocateStatus("Location updated to your current GPS position");
          setTimeout(() => setLocateStatus(""), 3500);
        } else {
          setLocateStatus("Could not fetch GPS. Using city location.");
          setTimeout(() => setLocateStatus(""), 3500);
        }
      }
    } catch (err) {
      console.error("WebView message error:", err);
    }
  };

  // Quick Preset Selection
  const handleSelectArea = (area) => {
    setSelectedLat(area.lat);
    setSelectedLng(area.lng);
    setAddress(area.name);
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_CENTER",
          lat: area.lat,
          lng: area.lng,
          radiusKm: selectedRadius,
        })
      );
    }
  };

  // Radius Chip Selection
  const handleSelectRadius = (rad) => {
    setSelectedRadius(rad);
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_RADIUS",
          radiusKm: rad,
        })
      );
    }
  };

  // Search Area by name
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Pakistan"
        )}&limit=1`,
        { headers: { "User-Agent": "RentUsedProductsApp/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const name = data[0].display_name.split(",").slice(0, 2).join(",");
          setSelectedLat(lat);
          setSelectedLng(lng);
          setAddress(name);
          if (webViewRef.current) {
            webViewRef.current.postMessage(
              JSON.stringify({
                type: "SET_CENTER",
                lat: lat,
                lng: lng,
                radiusKm: selectedRadius,
              })
            );
          }
        }
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (onSelectLocation) {
      onSelectLocation({
        latitude: selectedLat,
        longitude: selectedLng,
        radiusKm: selectedRadius,
        address: address,
      });
    }
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {mode === "filter" ? "Filter by Nearby Radius" : "Pin Product Location & Radius"}
            </Text>
            <Text style={styles.headerSub}>Tap on map or use GPS to locate your area</Text>
          </View>
          <TouchableOpacity onPress={handleConfirm} style={styles.doneBtn}>
            <Check size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search area (e.g. Saddar, F-10, Bahria Town)..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#9333EA" />
            ) : (
              <TouchableOpacity onPress={handleSearch} style={styles.searchGoBtn}>
                <Text style={styles.searchGoText}>Search</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Area Presets */}
        <View style={styles.presetScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
            {QUICK_AREAS.map((area) => {
              const isSelected =
                Math.abs(selectedLat - area.lat) < 0.005 && Math.abs(selectedLng - area.lng) < 0.005;
              return (
                <TouchableOpacity
                  key={area.name}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => handleSelectArea(area)}
                >
                  <MapPin size={12} color={isSelected ? "#FFFFFF" : "#9333EA"} style={{ marginRight: 4 }} />
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>{area.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: generateMapHtml() }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            geolocationEnabled={true}
            onMessage={handleWebViewMessage}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9333EA" />
                <Text style={styles.loadingText}>Loading Interactive Map...</Text>
              </View>
            )}
          />

          {/* Floating Current Location (GPS) Button */}
          <TouchableOpacity
            style={[styles.gpsFloatingBtn, isLocating && styles.gpsFloatingBtnActive]}
            onPress={handleLocateMe}
            activeOpacity={0.8}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Navigation size={22} color="#9333EA" />
            )}
          </TouchableOpacity>

          {/* Location Status Toast Banner */}
          {locateStatus ? (
            <View style={styles.statusToast}>
              <Text style={styles.statusToastText}>{locateStatus}</Text>
            </View>
          ) : null}
        </View>

        {/* Radius Selector & Address Card */}
        <View style={styles.bottomCard}>
          <View style={styles.radiusHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Layers size={18} color="#9333EA" style={{ marginRight: 6 }} />
              <Text style={styles.radiusLabel}>
                {mode === "filter" ? "Search Radius:" : "Delivery / Availability Radius:"}
              </Text>
            </View>
            <Text style={styles.radiusValue}>{selectedRadius} km</Text>
          </View>

          {/* Radius Chips */}
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusChip, selectedRadius === r && styles.radiusChipActive]}
                onPress={() => handleSelectRadius(r)}
              >
                <Text style={[styles.radiusChipText, selectedRadius === r && styles.radiusChipTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Address Display */}
          <View style={styles.addressDisplayRow}>
            <MapPin size={18} color="#9333EA" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>Selected Location</Text>
              <Text style={styles.addressSubtitle} numberOfLines={2}>
                {address || `${selectedLat}, ${selectedLng}`}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Navigation size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.confirmBtnText}>
              {mode === "filter" ? `Apply Filter (Within ${selectedRadius} km)` : `Confirm Location (${selectedRadius} km)`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  headerSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  doneBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#9333EA",
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1F2937",
    paddingVertical: 0,
  },
  searchGoBtn: {
    backgroundColor: "#9333EA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  searchGoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  presetScrollWrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  presetScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  presetChipActive: {
    backgroundColor: "#9333EA",
    borderColor: "#7C3AED",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9333EA",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#F3E8FF",
  },
  gpsFloatingBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  gpsFloatingBtnActive: {
    backgroundColor: "#9333EA",
    borderColor: "#7C3AED",
  },
  statusToast: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusToastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  radiusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  radiusValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9333EA",
  },
  radiusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  radiusChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  radiusChipActive: {
    backgroundColor: "#9333EA",
    borderColor: "#7C3AED",
  },
  radiusChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  radiusChipTextActive: {
    color: "#FFFFFF",
  },
  addressDisplayRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  addressSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1F2937",
    marginTop: 1,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9333EA",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
