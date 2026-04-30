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
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
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
} from "lucide-react-native";
import DatePicker from "react-native-date-picker";
import { format } from "date-fns";
import { useDateFilter } from "../context/DateFilterContext";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { API_URL } from "../utils/api";

const { width } = Dimensions.get("window");

const categories = [
  { id: 1, name: "Electronics", icon: Laptop, color: "#F3E8FF", textColor: "#9333EA" },
  { id: 2, name: "Furniture", icon: Sofa, color: "#E0E7FF", textColor: "#4F46E5" },
  { id: 3, name: "Tools", icon: Wrench, color: "#FFEDD5", textColor: "#EA580C" },
  { id: 4, name: "Kitchen", icon: UtensilsCrossed, color: "#DCFCE7", textColor: "#16A34A" },
  { id: 5, name: "Others", icon: MoreHorizontal, color: "#F3F4F6", textColor: "#4B5563" },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { startDate, numberOfDays, hasDatesSelected, getEndDate, setStartDate, setNumberOfDays, clearDates } = useDateFilter();
  const { userCity } = useUser();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempDays, setTempDays] = useState("1");          // User types number of days
  const [tempCategory, setTempCategory] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cityProducts, setCityProducts] = useState([]);

  // Fetch products once on mount
  useEffect(() => {
    fetchProducts();
  }, [userCity]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products`);
      const all = res.data || [];
      // City filter — same city OR no city set on product
      const inCity = all.filter(
        (p) => !p.owner?.city || p.owner.city.toLowerCase() === (userCity || "").toLowerCase()
      );
      setCityProducts(inCity);
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
    clearDates();                     // Clears global context → hides products again
    setSelectedCategory(null);
  };

  const getFilteredProducts = () => {
    // Dates select na ho to empty
    if (!hasDatesSelected) return [];

    // Only "Available" status products
    let filtered = cityProducts.filter((p) => p.status === "Available");

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category?.categoryId === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const renderProduct = ({ item }) => {
    const primaryImage = item.images?.find((img) => img.isPrimary)?.imageUrl ||
                         item.images?.[0]?.imageUrl ||
                         "https://via.placeholder.com/300x200?text=No+Image";
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigate("/product/" + item.productId)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: primaryImage }} style={styles.productImage} />
          <View style={[styles.availableBadge, { backgroundColor: item.status === "Available" ? "#22C55E" : "#EF4444" }]}>
            <Text style={styles.availableText}>{item.status || "Available"}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>{item.avgRating?.toFixed(1) || "New"}</Text>
          </View>
          <Text style={styles.productPrice}>Rs. {item.pricePerDay?.toLocaleString()}/day</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="#9CA3AF" />
            <Text style={styles.locationText}>{item.location || item.owner?.city || "—"}</Text>
          </View>
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
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#9333EA" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationValue}>{userCity || "Karachi"}, Pakistan</Text>
            </View>
          </View>

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
      </View>

      {isLoading ? (
        /* Loading State */
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={{ marginTop: 12, color: "#9CA3AF" }}>Loading products...</Text>
        </View>
      ) : !hasDatesSelected ? (
        /* No Dates Selected State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Filter size={48} color="#9333EA" />
            </View>
            <Text style={styles.emptyTitle}>Select Rental Dates</Text>
            <Text style={styles.emptyDesc}>
              Choose a start date and number of days to see available products in{" "}
              <Text style={styles.highlightText}>{userCity || "Karachi"}</Text>
            </Text>
            <TouchableOpacity
              style={styles.openFilterLargeBtn}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.openFilterBtnText}>Set Dates & Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Products State */
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Summary Banner */}
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

          {/* Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  { backgroundColor: selectedCategory === cat.id ? "#9333EA" : cat.color },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <cat.icon size={28} color={selectedCategory === cat.id ? "#FFFFFF" : cat.textColor} />
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === cat.id ? "#FFFFFF" : "#1F2937" },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Product Grid */}
          <View style={styles.productListHeader}>
            <Text style={styles.productListTitle}>
              Available in {userCity || "Karachi"} ({filteredProducts.length})
            </Text>
            <TrendingUp size={20} color="#9333EA" />
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#9333EA" style={{ marginTop: 40 }} />
          ) : (
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
                  <Text style={styles.noResultsText}>No products found for these dates or category.</Text>
                </View>
              }
            />
          )}
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
});
