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
  Alert,
} from "react-native";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Package, Clock, CheckCircle, Star, User, 
  ChevronRight, AlertCircle, Edit, Trash2, XCircle, RotateCcw 
} from "lucide-react-native";
import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");

export default function MyAddsScreen() {
  const navigate = useNavigate();
  const { userId, userName } = useUser();
  const [activeTab, setActiveTab] = useState("listings");
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [returns, setReturns] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "listings") {
        const res = await axios.get(`${API_URL}/products/byuser/${userId}`);
        const mappedListings = (res.data || []).map(item => ({
          id: item.productId,
          name: item.title || "Untitled",
          image: item.images && item.images.length > 0 ? item.images[0].imageUrl : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
          price: item.pricePerDay || 0,
          status: item.status || "Available", 
          rating: item.avgRating || 0,
          views: item.views || 0,
          messages: item.messages || 0
        }));
        setListings(mappedListings);
      } else {
        const res = await axios.get(`${API_URL}/rental/byowner/${userId}`);
        const mappedRentals = (res.data || []).map(item => {
          const start = item.startDate ? new Date(item.startDate) : new Date();
          const end = item.endDate ? new Date(item.endDate) : new Date();
          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
          
          return {
            id: item.rentalId,
            productName: item.product?.title || "Unknown Product",
            productImage: item.product?.primaryImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
            renterId: item.renter?.userId,
            renterName: item.renter?.username || "Guest",
            renterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", 
            startDate: start.toLocaleDateString(),
            endDate: end.toLocaleDateString(),
            numberOfDays: diffDays,
            totalAmount: item.totalAmount || 0,
            status: item.status || "Unknown",
            rating: item.renterRating || 0
          };
        });
        
        setRequests(mappedRentals.filter(r => r.status === "Pending"));
        setActiveRentals(mappedRentals.filter(r => r.status === "Active"));
        setReturns(mappedRentals.filter(r => r.status === "Awaiting_Return")); 
        setHistory(mappedRentals.filter(r => r.status === "Completed" || r.status === "Cancelled"));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (rentalId) => {
    try {
      await axios.put(`${API_URL}/rental/status/${rentalId}`, "Active", {
        headers: { "Content-Type": "application/json" }
      });
      Alert.alert("Success", "Rental request approved!");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to approve request", error);
      Alert.alert("Error", "Failed to approve request");
    }
  };

  const handleDeclineRequest = async (rentalId) => {
    try {
      await axios.put(`${API_URL}/rental/status/${rentalId}`, "Cancelled", {
        headers: { "Content-Type": "application/json" }
      });
      Alert.alert("Declined", "Rental request has been declined.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to decline request", error);
      Alert.alert("Error", "Failed to decline request");
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/products/${productId}`);
              Alert.alert("Success", "Product deleted!");
              fetchData(); // Refresh
            } catch (error) {
              Alert.alert("Error", "Failed to delete");
            }
          } 
        }
      ]
    );
  };

  const renderListing = ({ item }) => {
    let imageUrl = item.image || "https://via.placeholder.com/100";
    if (imageUrl.startsWith('/')) {
      imageUrl = IMAGE_BASE_URL + imageUrl;
    }

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigate("/product/" + item.id)}
      >
        <View style={styles.cardContent}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === "Available" ? "#DCFCE7" : "#FEE2E2" }]}>
                <Text style={[styles.statusText, { color: item.status === "Available" ? "#166534" : "#991B1B" }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.productPrice}>Rs. {item.price.toLocaleString()}<Text style={styles.priceUnit}>/day</Text></Text>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statText}>{item.messages} messages</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.footerAction} onPress={() => Alert.alert("Coming Soon", "Edit feature is being finalized.")}>
            <Edit size={16} color="#4B5563" />
            <Text style={styles.footerActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerAction} onPress={() => handleDeleteProduct(item.id)}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={[styles.footerActionText, { color: "#EF4444" }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerAction} onPress={() => navigate("/product/" + item.id)}>
            <Text style={styles.footerActionTextPrimary}>Details</Text>
            <ChevronRight size={16} color="#9333EA" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.renterHeader}>
        <View style={styles.renterAvatarBox}>
          <User size={20} color="#6B7280" />
        </View>
        <View>
          <Text style={styles.renterLabel}>New Request From</Text>
          <Text style={styles.renterName}>{item.renterName}</Text>
        </View>
      </View>
      
      <View style={styles.reqDetailsBox}>
        <View style={styles.reqDetailRow}>
          <Text style={styles.reqDetailLabel}>Product</Text>
          <Text style={styles.reqDetailValue}>{item.productName}</Text>
        </View>
        <View style={styles.reqDetailRow}>
          <Text style={styles.reqDetailLabel}>Duration</Text>
          <Text style={styles.reqDetailValue}>{item.numberOfDays} Days</Text>
        </View>
        <View style={styles.reqDivider} />
        <View style={styles.reqDetailRow}>
          <Text style={styles.totalLabel}>Total Revenue</Text>
          <Text style={styles.totalValue}>Rs. {item.totalAmount.toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.actionBtnRow}>
        <TouchableOpacity 
          style={styles.declineBtn}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <XCircle size={18} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.approveBtn}
          onPress={() => handleApproveRequest(item.id)}
        >
          <CheckCircle size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReturnRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.renterHeader}>
        <View style={styles.renterAvatarBox}>
          <RotateCcw size={20} color="#7C3AED" />
        </View>
        <View>
          <Text style={styles.renterLabel}>Return Pending</Text>
          <Text style={styles.historyName}>{item.productName}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.approveReturnBtn}
        onPress={() => navigate("/owner-confirm-return/" + item.id)}
      >
        <CheckCircle size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.approveBtnText}>Confirm Return Received</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistory = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.historyName}>{item.productName}</Text>
          <Text style={styles.historyRenter}>Rented by {item.renterName}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.status === "Completed" ? "#DCFCE7" : "#FEE2E2" }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.status === "Completed" ? "#166534" : "#991B1B" }
          ]}>
            {(item.status || "").toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.historyBox}>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Period:</Text>
          <Text style={styles.historyValue}>{item.startDate} - {item.endDate}</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Total Amount:</Text>
          <Text style={styles.historyValueBold}>Rs. {item.totalAmount.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.historyFooter}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              size={14} 
              color={s <= item.rating ? "#FBBF24" : "#E5E7EB"} 
              fill={s <= item.rating ? "#FBBF24" : "transparent"} 
            />
          ))}
        </View>
        <TouchableOpacity onPress={() => navigate("/rental-detail/" + item.id)}>
          <Text style={styles.detailsBtnText}>View Details</Text>
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
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab("listings")}
            style={[styles.tab, activeTab === "listings" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "listings" && styles.tabTextActive]}>Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("requests")}
            style={[styles.tab, activeTab === "requests" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>Requests</Text>
            {requests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("active_rentals")}
            style={[styles.tab, activeTab === "active_rentals" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "active_rentals" && styles.tabTextActive]}>Active</Text>
            {activeRentals.length > 0 && (
              <View style={[styles.badge, { backgroundColor: "#3B82F6" }]}>
                <Text style={styles.badgeText}>{activeRentals.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("returns")}
            style={[styles.tab, activeTab === "returns" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "returns" && styles.tabTextActive]}>Returns</Text>
            {returns.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{returns.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("history")}
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("history")}
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {activeTab === "listings" && (
            <FlatList
              data={listings}
              renderItem={renderListing}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )}
          {activeTab === "requests" && (
            <FlatList
              data={requests}
              renderItem={renderRequest}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )}
          {activeTab === "active_rentals" && (
            <FlatList
              data={activeRentals}
              renderItem={renderHistory}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )}
          {activeTab === "returns" && (
            <FlatList
              data={returns}
              renderItem={renderReturnRequest}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )}
          {activeTab === "history" && (
            <FlatList
              data={history}
              renderItem={renderHistory}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  tabActive: {
    borderBottomColor: "#9333EA",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#9333EA",
  },
  badge: {
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
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
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardContent: {
    flexDirection: "row",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9333EA",
    marginTop: 4,
  },
  priceUnit: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "normal",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerActionText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
    fontWeight: "500",
  },
  footerActionTextPrimary: {
    fontSize: 14,
    color: "#9333EA",
    marginRight: 4,
    fontWeight: "600",
  },
  renterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  renterAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsBtnText: {
    color: "#9333EA",
    fontSize: 13,
    fontWeight: "600",
  },
  approveReturnBtn: {
    height: 52,
    backgroundColor: "#9333EA",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
