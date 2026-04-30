import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useNavigate, useLocation } from "react-router";
import { Home, PlusSquare, LayoutList, User } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Add", path: "/add-product", icon: PlusSquare },
    { name: "Listings", path: "/my-adds", icon: LayoutList },
    { name: "Profile", path: "/profile", icon: User },

  ];

  const isActive = (path) => location.pathname === path;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const ActiveIcon = tab.icon;
        const active = isActive(tab.path);

        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tab}
            onPress={() => navigate(tab.path)}
          >
            <ActiveIcon
              size={24}
              color={active ? "#9333EA" : "#9CA3AF"}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    width: width / 4,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "500",
  },
  activeLabel: {
    color: "#9333EA",
    fontWeight: "700",
  },
});
