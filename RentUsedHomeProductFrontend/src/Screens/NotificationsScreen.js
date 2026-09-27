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
import { ArrowLeft, Bell, CheckCheck, Package, Clock, Sparkles } from "lucide-react-native";
import axios from "axios";
import { API_URL, IMAGE_BASE_URL } from "../utils/api";
import { useUser } from "../context/UserContext";

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      Alert.alert("Login Required", "Please log in to view notifications.");
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, [userId, isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notification/my/${userId}`);
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notification/mark-all-read/${userId}`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const handleNotificationPress = async (item) => {
    // Mark as read in backend
    if (!item.isRead) {
      try {
        await axios.put(`${API_URL}/notification/mark-read/${item.notificationId}`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === item.notificationId ? { ...n, isRead: true } : n
          )
        );
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }

    // Navigate to product if available
    if (item.product && item.product.productId) {
      navigate(`/product/${item.product.productId}`);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item }) => {
    let imageUrl = item.product?.primaryImage;
    if (imageUrl && imageUrl.startsWith("/")) {
      imageUrl = IMAGE_BASE_URL + imageUrl;
    }

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconBox}>
          {item.type === "Availability" ? (
            <Sparkles size={20} color="#9333EA" />
          ) : (
            <Package size={20} color="#3B82F6" />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.titleBold]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message}>{item.message}</Text>

          <View style={styles.metaRow}>
            <Clock size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            {item.product && (
              <Text style={styles.productTag}>
                ● {item.product.title} (Rs. {item.product.pricePerDay}/day)
              </Text>
            )}
          </View>
        </View>

        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.productThumb} />
        )}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <CheckCheck size={16} color="#9333EA" style={{ marginRight: 4 }} />
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Bell size={44} color="#9333EA" />
          </View>
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptyDesc}>
            When a product in your wishlist becomes available for rent, or when your rental updates status, you will see alerts right here!
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigate("/home")}
          >
            <Text style={styles.exploreBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
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
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FAF5FF",
  },
  markReadText: {
    fontSize: 12,
    color: "#9333EA",
    fontWeight: "600",
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
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardUnread: {
    backgroundColor: "#FAF5FF",
    borderColor: "#E9D5FF",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    color: "#374151",
  },
  titleBold: {
    fontWeight: "700",
    color: "#111827",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9333EA",
    marginLeft: 6,
  },
  message: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 3,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
    flexWrap: "wrap",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  productTag: {
    fontSize: 11,
    color: "#9333EA",
    fontWeight: "600",
    marginLeft: 4,
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: "#F3F4F6",
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
