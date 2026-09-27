import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigate } from "react-router";
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Laptop,
  Sofa,
  Wrench,
  UtensilsCrossed,
  MoreHorizontal,
  Filter,
  X,
  Calendar as CalendarIcon,
  Bell,
  Heart,
  ChevronDown,
  Check,
  Navigation,
  Layers,
} from "lucide-react-native";
import DatePicker from "react-native-date-picker";
import { format } from "date-fns";
import { useDateFilter } from "../context/DateFilterContext";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";
import LocationMapPicker from "../Components/LocationMapPicker";
import StarRating from "../Components/StarRating";
import { getCityCoords } from "../utils/locationUtils";

const { width } = Dimensions.get("window");

const categories = [
  { id: 91, name: "Electronics", icon: Laptop, color: "#F3E8FF", textColor: "#9333EA" },
  { id: 92, name: "Furniture", icon: Sofa, color: "#E0E7FF", textColor: "#4F46E5" },
  { id: 93, name: "Tools", icon: Wrench, color: "#FFEDD5", textColor: "#EA580C" },
  { id: 94, name: "Kitchen", icon: UtensilsCrossed, color: "#DCFCE7", textColor: "#16A34A" },
  { id: 95, name: "Others", icon: MoreHorizontal, color: "#F3F4F6", textColor: "#4B5563" },
];

const pakistaniCities = [
  "Rawalpindi",
  "Islamabad",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Faisalabad",
  "Multan",
  "Quetta",
  "Sialkot",
  "All Cities",
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { startDate, numberOfDays, hasDatesSelected, getEndDate, setStartDate, setNumberOfDays, clearDates } = useDateFilter();
  const { userCity, setUserCity, userId, isLoggedIn } = useUser();
  const initialCoords = getCityCoords(userCity);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempDays, setTempDays] = useState("1");          // User types number of days
  const [tempCategory, setTempCategory] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cityProducts, setCityProducts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Map & Radius Filter State (strictly locked to registered user city)
  const [showMapFilter, setShowMapFilter] = useState(false);
  const [nearbyFilterActive, setNearbyFilterActive] = useState(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState(3);
  const [searchLat, setSearchLat] = useState(initialCoords.latitude);
  const [searchLng, setSearchLng] = useState(initialCoords.longitude);
  const [searchLocationName, setSearchLocationName] = useState(userCity || initialCoords.name);

  // Fetch products once on mount & when city changes
  useEffect(() => {
    const coords = getCityCoords(userCity);
    setSearchLat(coords.latitude);
    setSearchLng(coords.longitude);
    setSearchLocationName(userCity || coords.name);
    fetchProducts();
    if (isLoggedIn && userId) {
      fetchUnreadNotifications();
    }
  }, [userCity, userId, isLoggedIn]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notification/unread-count/${userId}`);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (error) {
      // Non-critical
    }
  };

  const fetchProducts = async (useNearby = nearbyFilterActive, radius = searchRadiusKm, lat = searchLat, lng = searchLng) => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/products`;
      if (useNearby && lat && lng) {
        url = `${API_URL}/products?lat=${lat}&lng=${lng}&radiusKm=${radius}`;
      }
      const res = await axios.get(url);
      const all = res.data || [];

      if (useNearby) {
        setCityProducts(all);
      } else {
        const currentCity = (userCity || "Rawalpindi").trim().toLowerCase();
        // Filter by city: match product location OR owner city
        const inCity = all.filter((p) => {
          if (!currentCity || currentCity === "all" || currentCity === "all cities") return true;
          const prodLoc = (p.location || "").trim().toLowerCase();
          const ownerCity = (p.owner?.city || "").trim().toLowerCase();
          return prodLoc.includes(currentCity) || ownerCity.includes(currentCity);
        });
        setCityProducts(inCity);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error.message);
      setCityProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Called when user taps "Apply Filters"
  const handleApplyFilters = () => {
    const days = Math.max(1, parseInt(tempDays) || 1);
    setStartDate(tempStartDate);      // Save to global context
    setNumberOfDays(days);            // End date = startDate + days - 1 (auto via getEndDate)
    setSelectedCategory(tempCategory);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setTempStartDate(new Date());
    setTempDays("1");
    setTempCategory(null);
    clearDates();
    setSelectedCategory(null);
  };

  const getFilteredProducts = () => {
    // Show Available and Rented products (excluding current user's own products to avoid user leakage)
    let filtered = cityProducts.filter((p) => {
      // Avoid user leakage: do not show products created/owned by the logged-in user
      if (isLoggedIn && userId) {
        const ownerId = p.userId || p.owner?.userId || p.ownerId;
        if (ownerId === userId) return false;
      }
      return p.status === "Available" || p.status === "Rented";
    });

    // Category filter: match by ID or Category Name
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        if (typeof selectedCategory === "number") {
          return p.category?.categoryId === selectedCategory;
        }
        return p.category?.categoryName?.toLowerCase() === String(selectedCategory).toLowerCase();
      });
    }

    // Search filter: matches title, location, or category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.category?.categoryName?.toLowerCase().includes(q)
      );
    }

    // Rank: Maximum Reviews Descending, then Nearest Distance Ascending
    filtered.sort((a, b) => {
      const revA = a.reviewCount || 0;
      const revB = b.reviewCount || 0;
      if (revB !== revA) {
        return revB - revA; // Maximum reviews first (descending)
      }
      const distA = (a.distanceKm !== undefined && a.distanceKm !== null) ? a.distanceKm : 999999;
      const distB = (b.distanceKm !== undefined && b.distanceKm !== null) ? b.distanceKm : 999999;
      return distA - distB; // Nearest distance first (ascending)
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const renderProduct = ({ item }) => {
    let primaryImage = item.images?.find((img) => img.isPrimary)?.imageUrl ||
                         item.images?.[0]?.imageUrl ||
                         "https://via.placeholder.com/300x200?text=No+Image";
    
    if (primaryImage && primaryImage.startsWith('/')) {
      primaryImage = IMAGE_BASE_URL + primaryImage;
    }

    const isAvailable = item.status === "Available";
    const badgeColor = isAvailable ? "#22C55E" : item.status === "Rented" ? "#F59E0B" : "#EF4444";

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigate("/product/" + item.productId)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: primaryImage }} style={styles.productImage} />
          <View style={[styles.availableBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.availableText}>{item.status || "Available"}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
          <View style={styles.ratingRow}>
            <StarRating
              rating={item.avgRating || 0}
              size={12}
              showValue={true}
              showCount={true}
              reviewCount={item.reviewCount || 0}
            />
          </View>
          <Text style={styles.productPrice}>Rs. {item.pricePerDay?.toLocaleString()}/day</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="#9CA3AF" />
            <Text style={styles.locationText}>{item.location || item.owner?.city || "—"}</Text>
          </View>
          {item.distanceKm !== undefined && item.distanceKm !== null && (
            <View style={styles.distanceBadgeRow}>
              <Navigation size={11} color="#9333EA" />
              <Text style={styles.distanceBadgeText}>{item.distanceKm} km away</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const renderEndDatePreview = () => {
    const days = Math.max(1, parseInt(tempDays) || 1);
    const endPreview = new Date(tempStartDate);
    endPreview.setDate(endPreview.getDate() + days - 1);
    return (
      <View style={styles.durationDisplay}>
        <Text style={styles.durationText}>
          {"End Date: "}
          <Text style={styles.durationHighlight}>
            {format(endPreview, "MMM dd, yyyy")}
          </Text>
          {"   Total: "}
          <Text style={styles.durationHighlight}>
            {String(days) + (days === 1 ? " Day" : " Days")}
          </Text>
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.locationPinCircle}>
              <MapPin size={18} color="#9333EA" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Location (Tap to change)</Text>
              <Text style={styles.locationValue}>
                {(!userCity || userCity === "All") ? "All Cities" : userCity}, Pakistan
              </Text>
            </View>
            <ChevronDown size={16} color="#9333EA" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Search for items..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Nearby Map & Radius Filter Bar */}
        <View style={styles.nearbyFilterBar}>
          <TouchableOpacity
            style={[styles.mapFilterBtn, nearbyFilterActive && styles.mapFilterBtnActive]}
            onPress={() => setShowMapFilter(true)}
          >
            <MapPin size={13} color={nearbyFilterActive ? "#FFFFFF" : "#9333EA"} style={{ marginRight: 4 }} />
            <Text style={[styles.mapFilterBtnText, nearbyFilterActive && styles.mapFilterBtnTextActive]}>
              {nearbyFilterActive ? `${searchRadiusKm} km (${searchLocationName.split(",")[0]})` : "Nearby Map"}
            </Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyChipsRow}>
            <TouchableOpacity
              style={[styles.nearbyChip, !nearbyFilterActive && styles.nearbyChipActive]}
              onPress={() => {
                setNearbyFilterActive(false);
                fetchProducts(false);
              }}
            >
              <Text style={[styles.nearbyChipText, !nearbyFilterActive && styles.nearbyChipTextActive]}>All</Text>
            </TouchableOpacity>
            {[2, 3, 4, 5, 10].map((r) => {
              const isActive = nearbyFilterActive && searchRadiusKm === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.nearbyChip, isActive && styles.nearbyChipActive]}
                  onPress={() => {
                    setNearbyFilterActive(true);
                    setSearchRadiusKm(r);
                    fetchProducts(true, r, searchLat, searchLng);
                  }}
                >
                  <Text style={[styles.nearbyChipText, isActive && styles.nearbyChipTextActive]}>
                    {r} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {isLoading ? (
        /* Loading State */
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={{ marginTop: 12, color: "#9CA3AF" }}>Loading products...</Text>
        </View>
      ) : (
        /* Products State */
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Summary Banner */}
          {hasDatesSelected && (
            <View style={styles.dateSummary}>
              <View style={styles.greenDot} />
              <Text style={styles.dateSummaryText}>
                {format(startDate, "MMM dd, yyyy")}
                {" to "}
                {format(getEndDate(), "MMM dd, yyyy")}
                {"   "}
                <Text style={{ fontWeight: "800" }}>
                  {"(" + String(numberOfDays) + (numberOfDays === 1 ? " Day)" : " Days)")}
                </Text>
              </Text>
            </View>
          )}

          {/* Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => {
              const isCatActive = selectedCategory === cat.id || selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    { backgroundColor: isCatActive ? "#9333EA" : cat.color },
                  ]}
                  onPress={() => setSelectedCategory(isCatActive ? null : cat.id)}
                >
                  <cat.icon size={28} color={isCatActive ? "#FFFFFF" : cat.textColor} />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isCatActive ? "#FFFFFF" : "#1F2937" },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Product Grid */}
          <View style={styles.productListHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productListTitle}>
                Available in {userCity || "Rawalpindi"} ({filteredProducts.length})
              </Text>
              <View style={styles.sortingIndicatorRow}>
                <TrendingUp size={12} color="#9333EA" style={{ marginRight: 4 }} />
                <Text style={styles.sortingIndicatorText}>
                  {nearbyFilterActive
                    ? `Within ${searchRadiusKm} km • Ranked by Most Reviews`
                    : "Ranked by Most Reviews"}
                </Text>
              </View>
            </View>
          </View>

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.productId?.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  No products available in {(!userCity || userCity === "All") ? "any city" : userCity}.
                </Text>
                {userCity && userCity !== "All" && (
                  <TouchableOpacity
                    style={[styles.openFilterLargeBtn, { marginTop: 14, paddingVertical: 10, paddingHorizontal: 20, alignSelf: "center" }]}
                    onPress={() => setUserCity("All")}
                  >
                    <Text style={styles.openFilterBtnText}>Show Products in All Cities</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Rental Period */}
              <View style={styles.filterSection}>
                <Text style={styles.modalSectionTitle}>Rental Period</Text>

                {/* Start Date */}
                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {format(tempStartDate, "MMM dd, yyyy")}
                  </Text>
                  <CalendarIcon size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Number of Days */}
                <Text style={[styles.inputLabel, { marginTop: 15 }]}>Number of Days</Text>
                <View style={styles.daysInputRow}>
                  <TouchableOpacity
                    style={styles.daysBtn}
                    onPress={() => setTempDays((d) => String(Math.max(1, parseInt(d || "1") - 1)))}
                  >
                    <Text style={styles.daysBtnText}>{"  -  "}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.daysInput}
                    keyboardType="number-pad"
                    value={tempDays}
                    onChangeText={(v) => setTempDays(v.replace(/[^0-9]/g, ""))}
                    maxLength={3}
                  />
                  <TouchableOpacity
                    style={styles.daysBtn}
                    onPress={() => setTempDays((d) => String((parseInt(d || "1") || 0) + 1))}
                  >
                    <Text style={styles.daysBtnText}>{"  +  "}</Text>
                  </TouchableOpacity>
                </View>

                {/* Auto-calculated End Date Preview */}
                {renderEndDatePreview()}
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.modalSectionTitle}>Category</Text>
                <View style={styles.categoryChips}>
                  <TouchableOpacity
                    style={[styles.chip, !tempCategory && styles.activeChip]}
                    onPress={() => setTempCategory(null)}
                  >
                    <Text style={[styles.chipText, !tempCategory && styles.activeChipText]}>All</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, tempCategory === cat.id && styles.activeChip]}
                      onPress={() => setTempCategory(cat.id)}
                    >
                      <Text style={[styles.chipText, tempCategory === cat.id && styles.activeChipText]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DatePicker — Modal ke bahar (Android nested modal issue fix) */}
      <DatePicker
        modal
        open={showDatePicker}
        date={tempStartDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setTempStartDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* City Picker Modal */}
      <Modal
        visible={showCityModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: 480 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location / City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ marginVertical: 10 }}>
              {pakistaniCities.map((city) => {
                const isSelected =
                  (city === "All Cities" && (!userCity || userCity === "All")) ||
                  userCity?.toLowerCase() === city.toLowerCase();
                return (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.cityOption,
                      isSelected && styles.cityOptionSelected,
                    ]}
                    onPress={() => {
                      const newCity = city === "All Cities" ? "All" : city;
                      setUserCity(newCity);
                      const coords = getCityCoords(newCity);
                      setSearchLat(coords.latitude);
                      setSearchLng(coords.longitude);
                      setSearchLocationName(newCity === "All" ? "Pakistan" : coords.name);
                      setShowCityModal(false);
                    }}
                  >
                    <MapPin
                      size={18}
                      color={isSelected ? "#9333EA" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.cityOptionText,
                        isSelected && styles.cityOptionTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                    {isSelected && <Check size={18} color="#9333EA" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Interactive Map & Radius Filter Modal */}
      <LocationMapPicker
        visible={showMapFilter}
        onClose={() => setShowMapFilter(false)}
        initialLocation={{
          latitude: searchLat,
          longitude: searchLng,
          radiusKm: searchRadiusKm,
          address: searchLocationName,
          city: userCity || "Rawalpindi",
        }}
        onSelectLocation={(loc) => {
          setSearchLat(loc.latitude);
          setSearchLng(loc.longitude);
          setSearchRadiusKm(loc.radiusKm);
          setSearchLocationName(loc.address);
          setNearbyFilterActive(true);
          fetchProducts(true, loc.radiusKm, loc.latitude, loc.longitude);
        }}
        mode="filter"
        nearbyProducts={cityProducts}
        autoLocate={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationContainerLocked: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  locationInfo: {
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    position: "relative",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  searchRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#111827",
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#9333EA",
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FAF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 15,
  },
  highlightText: {
    color: "#9333EA",
    fontWeight: "700",
  },
  subDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 30,
  },
  openFilterLargeBtn: {
    flexDirection: "row",
    backgroundColor: "#9333EA",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  openFilterBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  dateSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  greenDot: {
    width: 8,
    height: 8,
    backgroundColor: "#22C55E",
    borderRadius: 4,
    marginRight: 8,
  },
  dateSummaryText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "600",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  categoriesScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryBtn: {
    width: 85,
    height: 85,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  productListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 16,
  },
  productListTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  productCard: {
    width: (width - 56) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  availableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  availableText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#9333EA",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  noResults: {
    padding: 40,
    alignItems: "center",
  },
  noResultsText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  modalBody: {
    padding: 25,
  },
  filterSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 54,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateText: {
    fontSize: 15,
    color: "#111827",
  },
  durationDisplay: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  durationText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
  durationHighlight: {
    fontWeight: "800",
    color: "#7C3AED",
  },
  daysInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  daysBtn: {
    width: 52,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  daysBtnText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#9333EA",
  },
  daysInput: {
    flex: 1,
    height: 54,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    margin: 5,
    minWidth: 80,
    alignItems: "center",
  },
  activeChip: {
    backgroundColor: "#9333EA",
  },
  chipText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  radioItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeRadio: {
    backgroundColor: "#F0FDFA",
    borderColor: "#10B981",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  activeRadioCircle: {
    borderColor: "#10B981",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  resetBtn: {
    flex: 1,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    marginRight: 10,
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B5563",
  },
  applyBtn: {
    flex: 2,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9333EA",
    borderRadius: 15,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  cityOptionSelected: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#9333EA",
  },
  cityOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  cityOptionTextSelected: {
    color: "#9333EA",
    fontWeight: "700",
  },
  nearbyFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  mapFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    marginRight: 8,
  },
  mapFilterBtnActive: {
    backgroundColor: "#9333EA",
    borderColor: "#7C3AED",
  },
  mapFilterBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9333EA",
  },
  mapFilterBtnTextActive: {
    color: "#FFFFFF",
  },
  nearbyChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nearbyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  nearbyChipActive: {
    backgroundColor: "#9333EA",
    borderColor: "#7C3AED",
  },
  nearbyChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  nearbyChipTextActive: {
    color: "#FFFFFF",
  },
  distanceBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9333EA",
    marginLeft: 3,
  },
  reviewCountText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  sortingIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  sortingIndicatorText: {
    fontSize: 11,
    color: "#9333EA",
    fontWeight: "600",
  },
  cityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#F9FAFB",
  },
  cityOptionSelected: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  cityOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },
  cityOptionTextSelected: {
    color: "#9333EA",
    fontWeight: "700",
  },
});
