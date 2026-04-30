import React from "react";
import { View, StyleSheet } from "react-native";
import { Outlet, useLocation } from "react-router";
import BottomTabBar from "./BottomTabBar";

export default function MainLayout() {
  const location = useLocation();
  
  // List of screens where bottom tab should be visible
  const showTabScreens = ["/home", "/add-product", "/chat-selection", "/profile"];
  const shouldShowTab = showTabScreens.includes(location.pathname);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Outlet />
      </View>
      {shouldShowTab && <BottomTabBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
});
