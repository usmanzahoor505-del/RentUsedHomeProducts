import React from "react";
import { View, StyleSheet } from "react-native";
import { Outlet } from "react-router";
import { UserProvider } from "../context/UserContext";
import { DateFilterProvider } from "../context/DateFilterContext";

export default function Root() {
  return (
    <UserProvider>
      <DateFilterProvider>
        <View style={styles.container}>
          <Outlet />
        </View>
      </DateFilterProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
