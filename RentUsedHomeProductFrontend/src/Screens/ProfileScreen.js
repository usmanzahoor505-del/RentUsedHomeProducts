import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigate } from "react-router";
import LinearGradient from "react-native-linear-gradient";
import {
  User,
  Package,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Shield,
  Heart,

} from "lucide-react-native";
import { useUser } from "../context/UserContext";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { userName, userCity, setUserEmail, setIsLoggedIn, setToken } = useUser();

  const userStats = [
    { label: "Listings", value: "12", icon: Package, color: "#2563EB" },
    { label: "Reviews", value: "156", icon: Star, color: "#EAB308" },
    { label: "Rating", value: "4.9", icon: Star, color: "#EAB308" },
    { label: "Rentals", value: "45", icon: Package, color: "#16A34A" },
  ];

  const menuItems = [
    { icon: Package, label: "My Listings", path: "/my-adds", color: "#2563EB" },
    { icon: Package, label: "My Rentals", path: "/my-rentals", color: "#9333EA" },
    { icon: Heart, label: "Favorites", path: "/home", color: "#DC2626" },
    { icon: Star, label: "My Reviews", path: "/ratings", color: "#CA8A04" },

    { icon: Shield, label: "Trust & Safety", path: "/home", color: "#16A34A" },
    { icon: Settings, label: "Settings", path: "/home", color: "#4B5563" },
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#2563EB", "#9333EA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarBtn}>
                <User size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{userName || "Ahmed Khan"}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#DBEAFE" />
                <Text style={styles.userLocation}>{userCity || "Karachi, Sindh"}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified Member</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          {userStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <stat.icon size={20} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Mail size={20} color="#9CA3AF" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>ahmed.khan@example.com</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Phone size={20} color="#9CA3AF" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+92 300 1234567</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={20} color="#9CA3AF" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>January 2023</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu List */}
      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index === menuItems.length - 1 && styles.noBorder]}
            onPress={() => navigate(item.path)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <item.icon size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#DC2626" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 14,
    color: "#DBEAFE",
    marginLeft: 4,
  },
  verifiedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  statsCard: {
    marginHorizontal: 24,
    marginTop: -40,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  section: {
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  menuCard: {
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  logoutBtn: {
    marginHorizontal: 24,
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    height: 60,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "bold",
  },
});
