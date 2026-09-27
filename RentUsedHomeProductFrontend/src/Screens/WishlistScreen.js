import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigate } from "react-router";
import { ArrowLeft, Heart, Trash2, Bell, Star, MapPin, ShoppingBag } from "lucide-react-native";
import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";
import { useUser } from "../context/UserContext";
import StarRating from "../Components/StarRating";

export default function WishlistScreen() {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useUser();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      Alert.alert("Login Required", "Please log in to view your wishlist.");
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [userId, isLoggedIn]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/wishlist/my/${userId}`);
      setWishlist(res.data || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      Alert.alert("Error", "Could not load wishlist items.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemove = async (wishlistId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${wishlistId}`);
      setWishlist((prev) => prev.filter((item) => item.wishlistId !== wishlistId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      Alert.alert("Error", "Failed to remove item.");
    }
  };

  const renderItem = ({ item }) => {
    const product = item.product;
    if (!product) return null;

    let imageUrl = product.primaryImage;
    if (imageUrl && imageUrl.startsWith("/")) {
      imageUrl = IMAGE_BASE_URL + imageUrl;
    }
    if (!imageUrl) {
      imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
    }

    const isAvailable = product.status === "Available";

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigate(`/product/${product.productId}`)}
        >
          <Image source={{ uri: imageUrl }} style={styles.image} />
          
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {product.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(item.wishlistId)}
                style={styles.deleteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  isAvailable ? styles.badgeAvailable : styles.badgeRented,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isAvailable ? styles.textAvailable : styles.textRented,
                  ]}
                >
                  {isAvailable ? "● Available Now" : "● Currently Rented"}
                </Text>
              </View>
              {item.notifyOnAvailable && !isAvailable && (
                <View style={styles.notifyTag}>
                  <Bell size={12} color="#9333EA" />
                  <Text style={styles.notifyText}>Alert Active</Text>
                </View>
              )}
            </View>

            <Text style={styles.price}>Rs. {product.pricePerDay?.toLocaleString()} / day</Text>

            <View style={styles.metaRow}>
              <View style={styles.ratingBox}>
                <StarRating
                  rating={product.avgRating || 0}
                  size={12}
                  showValue={true}
                />
              </View>
              <View style={styles.locationBox}>
                <MapPin size={12} color="#9CA3AF" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {product.location || product.owner?.city || "—"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Button */}
        <View style={styles.actionRow}>
          {isAvailable ? (
            <TouchableOpacity
              style={styles.rentBtn}
              onPress={() => navigate(`/product/${product.productId}`)}
            >
              <ShoppingBag size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.rentBtnText}>Rent Now</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingNotice}>
              <Bell size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <Text style={styles.waitingText}>You will be notified when returned</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.headerCountBadge}>
          <Text style={styles.headerCountText}>{wishlist.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Heart size={44} color="#9333EA" fill="#F3E8FF" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyDesc}>
            Save products you like or items that are currently rented out. We will notify you as soon as they become available!
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigate("/home")}
          >
            <Text style={styles.exploreBtnText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.wishlistId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchWishlist();
              }}
              colors={["#9333EA"]}
            />
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerBackBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  headerCountBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9333EA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardContent: {
    flexDirection: "row",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    flexWrap: "wrap",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAvailable: {
    backgroundColor: "#DCFCE7",
  },
  badgeRented: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textAvailable: {
    color: "#16A34A",
  },
  textRented: {
    color: "#DC2626",
  },
  notifyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  notifyText: {
    fontSize: 10,
    color: "#9333EA",
    fontWeight: "600",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9333EA",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: "#6B7280",
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F9FAFB",
  },
  rentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9333EA",
    paddingVertical: 9,
    borderRadius: 8,
  },
  rentBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  waitingNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 7,
    borderRadius: 8,
  },
  waitingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FAF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: "#9333EA",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
