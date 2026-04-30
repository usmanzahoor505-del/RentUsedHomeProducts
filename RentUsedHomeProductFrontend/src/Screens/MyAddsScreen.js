import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  MessageCircle,
  Edit,
  ChevronRight,
  User,
  RotateCcw,
} from "lucide-react-native";

import { myListings } from "../data/products";

const { width } = Dimensions.get("window");

const bookingRequests = [
  {
    id: 1,
    productName: "Gaming Laptop",
    productImage: "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
    productRating: 4.8,
    renterName: "Hassan Ali",
    renterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    startDate: "Feb 20, 2026",
    numberOfDays: 5,
    totalAmount: 15000,
    status: "pending",
  },
  {
    id: 2,
    productName: "Power Drill Set",
    productImage: "https://images.unsplash.com/photo-1770763233593-74dfd0da7bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
    productRating: 4.6,
    renterName: "Fatima Malik",
    renterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    startDate: "Feb 18, 2026",
    numberOfDays: 2,
    totalAmount: 1800,
    status: "approved",
  },
  {
    id: 3,
    productName: "Premium DSLR Camera",
    productImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300",
    productRating: 4.9,
    renterName: "Zaka Ullah",
    renterAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    startDate: "Feb 15, 2026",
    numberOfDays: 3,
    totalAmount: 4500,
    status: "pending",
  },
];

const returnRequests = [
  {
    id: 101,
    productName: "L-Shaped Sofa",
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
    productRating: 4.5,
    renterName: "Ahmed Khan",
    renterAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    startDate: "Feb 10, 2026",
    numberOfDays: 3,
    totalAmount: 4500,
    status: "awaiting_return",
  },
  {
    id: 102,
    productName: "Power Drill",
    productImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
    productRating: 4.7,
    renterName: "Sara Ali",
    renterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    startDate: "Feb 12, 2026",
    numberOfDays: 1,
    totalAmount: 500,
    status: "awaiting_return",
  },
];

const rentalHistory = [
  {
    id: 1,
    productName: "Gaming Laptop",
    renterName: "Ayesha Raza",
    startDate: "Jan 15, 2026",
    endDate: "Jan 20, 2026",
    totalAmount: 15000,
    status: "completed",
    rating: 5,
  },
  {
    id: 2,
    productName: "Power Drill Set",
    renterName: "Ahmed Khan",
    startDate: "Jan 10, 2026",
    endDate: "Jan 11, 2026",
    totalAmount: 1800,
    status: "completed",
    rating: 4,
  },
];

import axios from "axios";
import { API_URL } from "../utils/api";
import { UserContext } from "../context/UserContext";

export default function MyAddsScreen() {
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);
  const [activeTab, setActiveTab] = useState("listings");
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [returns, setReturns] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user && user.userId) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "listings") {
        const res = await axios.get(`${API_URL}/products/byuser/${user.userId}`);
        const mappedListings = res.data.map(item => ({
          id: item.productId,
          name: item.title,
          image: item.images && item.images.length > 0 ? item.images[0].imageUrl : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
          price: item.pricePerDay,
          status: item.status, 
          rating: item.avgRating || 0,
          rentalsCount: 0 
        }));
        setListings(mappedListings);
      } else {
        const res = await axios.get(`${API_URL}/rental/byowner/${user.userId}`);
        const mappedRentals = res.data.map(item => {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
          
          return {
            id: item.rentalId,
            productName: item.product.title,
            productImage: item.product.primaryImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
            renterName: item.renter.username,
            renterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", 
            startDate: start.toLocaleDateString(),
            endDate: end.toLocaleDateString(),
            numberOfDays: diffDays,
            totalAmount: item.totalAmount || 0,
            status: item.status,
            rating: item.renterRating || 0
          };
        });
        
        setRequests(mappedRentals.filter(r => r.status === "Pending"));
        setReturns(mappedRentals.filter(r => r.status === "Active")); 
        setHistory(mappedRentals.filter(r => r.status === "Completed" || r.status === "Cancelled"));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderListing = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.listingRow}>
        <Image source={{ uri: item.image }} style={styles.listingImg} />
        <View style={styles.listingContent}>
          <View style={styles.listingHeader}>
            <View>
              <Text style={styles.listingName}>{item.name}</Text>
              <Text style={styles.listingPrice}>Rs. {item.price.toLocaleString()}/day</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === "active" ? "#DCFCE7" : "#FFEDD5" }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: item.status === "active" ? "#166534" : "#9A3412" }
              ]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Eye size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={12} color="#FBBF24" fill="#FBBF24" style={{ marginRight: 4 }} />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
              <Text style={styles.statText}>{item.messages}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn}>
            <Edit size={14} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.editBtnText}>Edit Listing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.requestProductRow}>
        <Image source={{ uri: item.productImage }} style={styles.reqProductImg} />
        <View style={styles.statusFloat}>
          <Text style={styles.statusFloatText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.reqContent}>
        <Text style={styles.reqTitle}>{item.productName}</Text>
        <View style={styles.reqRatingRow}>
          <Star size={14} color="#FBBF24" fill="#FBBF24" />
          <Text style={styles.reqRatingText}>{item.productRating}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.renterRow}
          onPress={() => navigate("/renter-profile/" + item.renter.userId)}
        >
          <View style={styles.renterAvatarBox}>
            <User size={18} color="#9CA3AF" />
          </View>
          <View>
            <Text style={styles.renterLabel}>Requested by</Text>
            <Text style={styles.renterName}>{item.renter.username}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.reqDetailsBox}>
          <View style={styles.reqDetailRow}>
            <Text style={styles.reqDetailLabel}>Start Date:</Text>
            <Text style={styles.reqDetailValue}>{item.startDate}</Text>
          </View>
          <View style={styles.reqDetailRow}>
            <Text style={styles.reqDetailLabel}>Duration:</Text>
            <Text style={styles.reqDetailValue}>{item.numberOfDays} days</Text>
          </View>
          <View style={styles.reqDivider} />
          <View style={styles.reqDetailRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>Rs. {item.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={styles.approveBtn}>
              <CheckCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineBtn}>
              <XCircle size={18} color="#4B5563" style={{ marginRight: 8 }} />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderReturnRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.requestProductRow}>
        <Image source={{ uri: item.productImage }} style={styles.reqProductImg} />
        <View style={[styles.statusFloat, { backgroundColor: "#FBBF24" }]}>
          <Text style={styles.statusFloatText}>RETURN PENDING</Text>
        </View>
      </View>
      <View style={styles.reqContent}>
        <Text style={styles.reqTitle}>{item.productName}</Text>
        
        <TouchableOpacity 
          style={styles.renterRow}
          onPress={() => navigate("/renter-profile/" + item.renter.userId)}
        >
          <View style={styles.renterAvatarBox}>
            <User size={18} color="#9CA3AF" />
          </View>
          <View>
            <Text style={styles.renterLabel}>Being returned by</Text>
            <Text style={styles.renterName}>{item.renter.username}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.reqDetailsBox}>
          <View style={styles.reqDetailRow}>
            <Text style={styles.reqDetailLabel}>Total Usage:</Text>
            <Text style={styles.reqDetailValue}>{item.numberOfDays} days</Text>
          </View>
          <View style={styles.reqDetailRow}>
            <Text style={styles.reqDetailLabel}>Amount:</Text>
            <Text style={styles.reqDetailValue}>Rs. {item.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.approveReturnBtn}
          onPress={() => navigate("/owner-confirm-return/" + item.id)}
        >
          <RotateCcw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.approveBtnText}>Inspect & Approve Return</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Dashboard</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("listings")}
            style={[styles.tab, activeTab === "listings" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "listings" && styles.tabTextActive]}>My Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("requests")}
            style={[styles.tab, activeTab === "requests" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {bookingRequests.filter((r) => r.status === "pending").length}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("history")}
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("returns")}
            style={[styles.tab, activeTab === "returns" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "returns" && styles.tabTextActive]}>Returns</Text>
            {returnRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{returnRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === "listings" ? listings : 
            activeTab === "requests" ? requests : 
            activeTab === "returns" ? returns :
            history
          }
          renderItem={
            activeTab === "listings" ? renderListing : 
            activeTab === "requests" ? renderRequest : 
            activeTab === "returns" ? renderReturnRequest :
            renderHistory
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={64} color="#E5E7EB" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No {activeTab} found.</Text>
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
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
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
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  tabActive: {
    backgroundColor: "#9333EA",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B5563",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  listingRow: {
    flexDirection: "row",
  },
  listingImg: {
    width: 120,
    height: 140,
  },
  listingContent: {
    flex: 1,
    padding: 16,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  listingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  requestProductRow: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  reqProductImg: {
    width: "100%",
    height: "100%",
  },
  statusFloat: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#9333EA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusFloatText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  reqContent: {
    padding: 20,
  },
  reqTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  reqRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reqRatingText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 4,
  },
  renterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 16,
  },
  renterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  renterLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  renterName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  reqDetailsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reqDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reqDetailLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  reqDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  reqDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
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
  actionBtnRow: {
    flexDirection: "row",
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#9333EA",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  declineBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  declineBtnText: {
    color: "#4B5563",
    fontWeight: "bold",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  historyRenter: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  historyBox: {
    backgroundColor: "#F9FAFB",
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  historyLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  historyValue: {
    fontSize: 13,
    color: "#111827",
  },
  historyValueBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsBtnText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  approveReturnBtn: {
    height: 52,
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});
