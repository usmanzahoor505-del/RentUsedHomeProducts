import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigate } from "react-router";
import LinearGradient from "react-native-linear-gradient";
import {
  Package,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  Phone,
  CreditCard,
  ChevronDown,
  Truck,
  Bike,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "../context/UserContext";
import api, { API_URL, setAuthToken } from "../utils/api";

const { width, height } = Dimensions.get("window");

const pakistaniCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
];

export default function LoginScreen() {
  const navigate = useNavigate();
  const { 
    setUserCity, 
    setUserName, 
    setUserPhone, 
    setUserCnic, 
    setIsLoggedIn, 
    setUserEmail, 
    setToken, 
    setUserId,
    userRole,
    setUserRole,
    setVehicleType,
    setVehiclePlate,
    setIsOnline,
  } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [city, setCity] = useState("Karachi");
  const [role, setRole] = useState("Customer"); // "Customer" or "Courier"
  const [vehicleType, setVehicleTypeLocal] = useState("Motorcycle");
  const [vehiclePlate, setVehiclePlateLocal] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLogin && (!name || !phone || !city)) {
      Alert.alert("Error", "Please fill in all registration fields");
      return;
    }

    if (!isLogin && role === "Courier" && !vehiclePlate.trim()) {
      Alert.alert("Error", "Please enter your vehicle registration plate number");
      return;
    }

    setLoading(true);
    try {
      // Backend controller: UsersController → api/users/login or api/users/register
      const endpoint = isLogin ? "/users/login" : "/users/register";
      const payload = isLogin
        ? { email: email.trim(), password }
        : {
          username: name,
          email: email.trim(),
          password,
          PhoneNo: phone,
          city,
          cnic: cnic,
          role: role,
          vehicleType: role === "Courier" ? vehicleType : null,
          vehiclePlate: role === "Courier" ? vehiclePlate.trim() : null,
        };

      const fullUrl = API_URL + endpoint;
      console.log("=== LOGIN ATTEMPT ===");
      console.log("URL:", fullUrl);
      console.log("Payload:", JSON.stringify(payload));

      const response = await api.post(endpoint, payload);
      const userData = response.data;

      console.log("=== AUTH RESPONSE ===", JSON.stringify(userData));

      // Save all data to Context
      if (userData.city) setUserCity(userData.city);
      if (userData.username) setUserName(userData.username);
      if (userData.phone) setUserPhone(userData.phone);
      if (userData.email) setUserEmail(userData.email);
      if (userData.token) {
        setToken(userData.token);
        setAuthToken(userData.token);
      }
      if (userData.userId) setUserId(userData.userId);
      if (cnic) setUserCnic(cnic);

      const activeRole = userData.role || role || "Customer";
      setUserRole(activeRole);
      if (userData.vehicleType || (role === "Courier" && vehicleType)) {
        setVehicleType(userData.vehicleType || vehicleType);
      }
      if (userData.vehiclePlate || (role === "Courier" && vehiclePlate)) {
        setVehiclePlate(userData.vehiclePlate || vehiclePlate.trim());
      }
      if (userData.isOnline !== undefined) {
        setIsOnline(userData.isOnline);
      }

      // setIsLoggedIn last mein — ye state update baaqi sab ke baad
      setIsLoggedIn(true);

      if (activeRole === "Courier") {
        navigate("/courier-home");
      } else {
        navigate("/home");
      }

    } catch (error) {
      console.error("=== AUTH ERROR ===", error?.response?.status, error?.response?.data, error?.message);
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        const data = error.response.data;
        const status = error.response.status;
        if (typeof data === "string") {
          errorMessage = data;
        } else if (data?.detail) {
          errorMessage = `${data.message}: ${data.detail} ${data.inner || ""}`;
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server Error (${status})`;
        }
      } else if (error.request) {
        errorMessage = `Cannot reach server.\n\nTarget URL: ${API_URL}\n\nPlease verify:\n1. Backend is running.\n2. If connected via USB, run: adb reverse tcp:5257 tcp:5257\n3. If on Wi-Fi, ensure PC & phone are on the same network.`;
      } else {
        errorMessage = error.message;
      }

      Alert.alert("Authentication Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setUserCity("Karachi");
    setUserName("Guest User");
    setIsLoggedIn(false);
    navigate("/guest-home");
    Alert.alert("Guest Mode", "Continuing as guest user.");
  };

  return (
    <LinearGradient
      colors={["#A855F7", "#9333EA", "#4F46E5"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Package size={64} color="#9333EA" strokeWidth={2} />
            </View>
            <Text style={styles.logoText}>Easy Rent</Text>
            <Text style={styles.logoSubtext}>Your trusted rental marketplace</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => setIsLogin(true)}
                style={[styles.tab, isLogin && styles.activeTab]}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsLogin(false)}
                style={[styles.tab, !isLogin && styles.activeTab]}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.inputStack}>
              {!isLogin && (
                <>
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>Register As</Text>
                    <View style={styles.roleRow}>
                      <TouchableOpacity
                        style={[styles.roleOption, role === "Customer" && styles.roleOptionActive]}
                        onPress={() => setRole("Customer")}
                        activeOpacity={0.8}
                      >
                        <User size={16} color={role === "Customer" ? "#FFFFFF" : "#6B7280"} />
                        <Text style={[styles.roleOptionText, role === "Customer" && styles.roleOptionTextActive]}>
                          Customer
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.roleOption, role === "Courier" && styles.roleOptionActive]}
                        onPress={() => setRole("Courier")}
                        activeOpacity={0.8}
                      >
                        <Truck size={16} color={role === "Courier" ? "#FFFFFF" : "#6B7280"} />
                        <Text style={[styles.roleOptionText, role === "Courier" && styles.roleOptionTextActive]}>
                          Delivery Rider
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <User style={styles.inputIcon} size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Phone style={styles.inputIcon} size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone (03XX-XXXXXXX)"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <CreditCard style={styles.inputIcon} size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="CNIC (XXXXX-XXXXXXX-X)"
                      value={cnic}
                      onChangeText={setCnic}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {role === "Courier" && (
                    <>
                      <View style={[styles.inputWrapper, { paddingRight: 10 }]}>
                        <Bike style={styles.inputIcon} size={20} color="#9CA3AF" />
                        <Picker
                          selectedValue={vehicleType}
                          onValueChange={(itemValue) => setVehicleTypeLocal(itemValue)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Motorcycle (Bike)" value="Motorcycle" />
                          <Picker.Item label="Car / Sedan" value="Car" />
                          <Picker.Item label="Suzuki / Pickup Van" value="Van" />
                        </Picker>
                      </View>

                      <View style={styles.inputWrapper}>
                        <Truck style={styles.inputIcon} size={20} color="#9CA3AF" />
                        <TextInput
                          style={styles.input}
                          placeholder="Vehicle Plate No (e.g. ICT-1234)"
                          value={vehiclePlate}
                          onChangeText={setVehiclePlateLocal}
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="characters"
                        />
                      </View>
                    </>
                  )}
                </>
              )}

              <View style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <View style={[styles.inputWrapper, { paddingRight: 10 }]}>
                  <MapPin style={styles.inputIcon} size={20} color="#9CA3AF" />
                  <Picker
                    selectedValue={city}
                    onValueChange={(itemValue) => setCity(itemValue)}
                    style={styles.picker}

                  >
                    {pakistaniCities.map((cityName) => (
                      <Picker.Item key={cityName} label={cityName} value={cityName} />
                    ))}
                  </Picker>
                  <ChevronDown size={20} color="#9CA3AF" />
                </View>
              )}
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>
                  {isLogin ? "Login" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={handleGuestLogin}
            >
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  logoSubtext: {
    fontSize: 14,
    color: "#E9D5FF",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#9333EA",
  },
  tabText: {
    fontWeight: "bold",
    color: "#4B5563",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  inputStack: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#1F2937",
    fontSize: 16,
  },
  picker: {
    flex: 1,
    color: "#1F2937",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    color: "#9333EA",
    fontWeight: "600",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#9333EA",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  guestBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  guestText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  roleContainer: {
    marginBottom: 6,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 8,
    marginLeft: 4,
  },
  roleRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: "#9333EA",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  roleOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});