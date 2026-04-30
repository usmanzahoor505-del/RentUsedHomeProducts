import React from "react";
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
  FlatList,
} from "react-native";
import { useNavigate } from "react-router";
import { Search, Star, MapPin, Eye, LogIn } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import { allProducts } from "../data/products";

const { width } = Dimensions.get("window");

export default function GuestModeHomeScreen() {
  const navigate = useNavigate();

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigate("/product/" + item.id)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={[styles.badge, { backgroundColor: item.bookings && item.bookings.length > 0 ? "#EF4444" : "#22C55E" }]}>
          <Text style={styles.badgeText}>
            {item.bookings && item.bookings.length > 0 ? "Booked" : "Available"}
          </Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Star size={12} color="#FBBF24" fill="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.productPrice}>Rs. {item.price.toLocaleString()}/day</Text>
        <View style={styles.locationRow}>
          <MapPin size={12} color="#9CA3AF" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.guestInfo}>
            <View style={styles.eyeIconBox}>
              <Eye size={20} color="#6B7280" />
            </View>
            <View>
              <View style={styles.guestBadgeRow}>
                <Text style={styles.guestTitle}>Guest Mode</Text>
                <View style={styles.limitedBadge}>
                  <Text style={styles.limitedText}>LIMITED</Text>
                </View>
              </View>
              <Text style={styles.guestSub}>Browsing only</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.signInBtn} 
            onPress={() => navigate("/login")}
          >
            <LogIn size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar - Disabled */}
        <View style={styles.searchBarDisabled}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Sign in to search..."
            style={styles.searchInput}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <LinearGradient
          colors={["#F5F3FF", "#EEF2FF"]}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>Plan Your Rental</Text>
          <Text style={styles.bannerDesc}>
            You can view all listings, but to book, chat, or list products, you need to sign in.
          </Text>
          <TouchableOpacity 
            style={styles.bannerBtn}
            onPress={() => navigate("/login")}
          >
            <Text style={styles.bannerBtnText}>Create Account or Sign In</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* All Listings */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Listings ({allProducts.length})</Text>
          <Text style={styles.listSubTitle}>Sign in to filter</Text>
        </View>

        <FlatList
          data={allProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.productRow}
        />
      </ScrollView>

      {/* Footer CTA */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerBtn}
          onPress={() => navigate("/login")}
        >
          <Text style={styles.footerBtnText}>Sign In to Book & List Products</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  guestInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  guestBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 8,
  },
  limitedBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  limitedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#92400E",
  },
  guestSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  signInBtn: {
    flexDirection: "row",
    backgroundColor: "#9333EA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  searchBarDisabled: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    opacity: 0.6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  banner: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4C1D95",
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 13,
    color: "#5B21B6",
    lineHeight: 18,
    marginBottom: 20,
  },
  bannerBtn: {
    backgroundColor: "#9333EA",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  bannerBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  listSubTitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    width: (width - 56) / 2,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
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
    color: "#4B5563",
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9333EA",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
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
  footerBtn: {
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
  footerBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
