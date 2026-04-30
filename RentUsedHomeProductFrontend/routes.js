import { createMemoryRouter, useRouteError } from "react-router";
import { View, Text, StyleSheet } from "react-native";
import Root from "./src/Screens/Root";
import MainLayout from "./src/Components/MainLayout";
import SplashScreen from "./src/Screens/SplashScreen";
import LoginScreen from "./src/Screens/LoginScreen";
import HomeScreen from "./src/Screens/HomeScreen";
import ProductDetailScreen from "./src/Screens/ProductDetailScreen";
import BookingScreen from "./src/Screens/BookingScreen";
import AddProductScreen from "./src/Screens/AddProductScreen";
import MyAddsScreen from "./src/Screens/MyAddsScreen";
import BookingConfirmationScreen from "./src/Screens/BookingConfirmationScreen";
import RatingScreen from "./src/Screens/RatingScreen";
import ProfileScreen from "./src/Screens/ProfileScreen";

import ReturnProcessScreen from "./src/Screens/ReturnProcessScreen";
import ReturnStatusScreen from "./src/Screens/ReturnStatusScreen";
import VendorProfileScreen from "./src/Screens/VendorProfileScreen";
import GuestModeHomeScreen from "./src/Screens/GuestModeHomeScreen";
import MyRentalsScreen from "./src/Screens/MyRentalsScreen";
import RentalDetailScreen from "./src/Screens/RentalDetailScreen";
import ProductRatingReviewScreen from "./src/Screens/ProductRatingReviewScreen";
import PostRentalRatingScreen from "./src/Screens/PostRentalRatingScreen";
import CustomerRateReturnScreen from "./src/Screens/CustomerRateReturnScreen";
import OwnerConfirmReturnScreen from "./src/Screens/OwnerConfirmReturnScreen";
import PaymentScreen from "./src/Screens/PaymentScreen";
import RenterProfileScreen from "./src/Screens/RenterProfileScreen";


function NativeErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong.</Text>
      <Text style={styles.errorText}>{error?.message || "Unknown error"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
});

export const router = createMemoryRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <NativeErrorBoundary />,
    children: [
      { index: true, Component: SplashScreen },
      { path: "login", Component: LoginScreen },
      {
        path: "/",
        Component: MainLayout,
        children: [
          { path: "home", Component: HomeScreen },
          { path: "add-product", Component: AddProductScreen },
          { path: "profile", Component: ProfileScreen },
          { path: "my-adds", Component: MyAddsScreen },
        ],
      },

      { path: "guest-home", Component: GuestModeHomeScreen },
      { path: "product/:id", Component: ProductDetailScreen },
      { path: "booking/:id", Component: BookingScreen },
      { path: "booking-confirmation/:id", Component: BookingConfirmationScreen },

      { path: "my-rentals", Component: MyRentalsScreen },
      { path: "rental-detail/:id", Component: RentalDetailScreen },

      { path: "return-process/:id", Component: ReturnProcessScreen },
      { path: "product-rating/:id", Component: ProductRatingReviewScreen },
      { path: "post-rental-rating/:id", Component: PostRentalRatingScreen },
      { path: "customer-rate-return/:id", Component: CustomerRateReturnScreen },
      { path: "owner-confirm-return/:id", Component: OwnerConfirmReturnScreen },
      { path: "return-status/:id", Component: ReturnStatusScreen },
      { path: "payment/:id", Component: PaymentScreen },
      { path: "vendor/:id", Component: VendorProfileScreen },
      { path: "ratings", Component: RatingScreen },

      { path: "renter/:id", Component: RenterProfileScreen },
    ],
  },
]);
