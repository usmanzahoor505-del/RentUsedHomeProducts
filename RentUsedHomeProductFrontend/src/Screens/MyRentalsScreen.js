import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Star,
  User,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";
import { myRentals, emptyRentalsMessage } from "../data/products";

import axios from "axios";
import { API_URL } from "../utils/api";
import { UserContext } from "../context/UserContext";

export default function MyRentalsScreen() {
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.userId) {
      fetchRentals();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchRentals = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rental/byrenter/${user.userId}`);
      
      const mappedRentals = response.data.map(item => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        return {
          id: item.rentalId,
          productImage: item.product.primaryImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
          productName: item.product.title,
          owner: item.owner,
          ownerRating: item.ownerRating || 0,
          startDate: start.toLocaleDateString(),
          numberOfDays: diffDays,
          totalAmount: item.totalAmount || 0,
          status: item.status.toLowerCase()
        };
      });
      setRentals(mappedRentals);
    } catch (error) {
      console.error("Failed to fetch rentals", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "#EFF6FF", text: "#1D4ED8" }; // Blue
      case "completed":
        return { bg: "#DCFCE7", text: "#15803D" }; // Green
      case "awaiting_return":
        return { bg: "#FEF9C3", text: "#A16207" }; // Yellow
      case "return_approved":
        return { bg: "#F5F3FF", text: "#7C3AED" }; // Purple
      default:
        return { bg: "#F3F4F6", text: "#4B5563" }; // Gray
    }
  };

  const renderRental = ({ item }) => {
    const statusStyle = getStatusColor(item.status);
    return (
      <TouchableOpacity
        style={styles.rentalCard}
        onPress={() => navigate("/rental-detail/" + item.id)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.productImage }} style={styles.productImage} />
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.productName}>{item.productName}</Text>

          <TouchableOpacity 
            style={styles.ownerRow}
            onPress={(e) => {
              e.stopPropagation();
              navigate("/owner-profile/" + item.owner.userId);
            }}
          >
            <View style={styles.ownerAvatarBox}>
              <User size={14} color="#9CA3AF" />
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerLabel}>Rented from</Text>
              <Text style={styles.ownerName}>{item.owner.username}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.ratingValue}>{item.ownerRating}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{item.startDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{item.numberOfDays} days</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total Paid:</Text>
              <Text style={styles.totalValue}>Rs. {item.totalAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Action indicator */}
          <View style={styles.actionRow}>
            {item.status === "active" ? (
              <View style={styles.activeAction}>
                <Text style={styles.activeActionText}>Tap to Return Item</Text>
                <ChevronRight size={16} color="#9333EA" />
              </View>
            ) : item.status === "completed" ? (
              <View style={styles.completedAction}>
                <CheckCircle size={16} color="#16A34A" style={{ marginRight: 6 }} />
                <Text style={styles.completedText}>Completed & Rated</Text>
              </View>
            ) : item.status === "awaiting_return" ? (
              <View style={styles.pendingAction}>
                <Clock size={16} color="#CA8A04" style={{ marginRight: 6 }} />
                <Text style={styles.pendingText}>Awaiting Owner Confirmation</Text>
              </View>
            ) : item.status === "return_approved" ? (
              <TouchableOpacity 
                style={styles.activeAction}
                onPress={(e) => {
                  e.stopPropagation();
                  navigate("/customer-rate-return/" + item.id);
                }}
              >
                <Text style={styles.activeActionText}>Rate Owner & Product</Text>
                <Star size={16} color="#9333EA" fill="#9333EA" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rentals</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Fetching your rentals...</Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          renderItem={renderRental}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Package size={64} color="#E5E7EB" />
              </View>
              <Text style={styles.emptyTitle}>{emptyRentalsMessage.title}</Text>
              <Text style={styles.emptyDesc}>{emptyRentalsMessage.description}</Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigate("/home")}
              >
                <Text style={styles.browseBtnText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  rentalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 12,
  },
  ownerAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#CA8A04",
    marginLeft: 4,
  },
  detailsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9333EA",
  },
  actionRow: {
    marginTop: 8,
  },
  activeAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    padding: 12,
    borderRadius: 12,
  },
  activeActionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6D28D9",
  },
  completedAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16A34A",
  },
  pendingAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#CA8A04",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  browseBtn: {
    backgroundColor: "#9333EA",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  browseBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
