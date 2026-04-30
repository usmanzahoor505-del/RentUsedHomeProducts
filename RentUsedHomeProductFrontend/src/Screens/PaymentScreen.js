import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building,
  Check,
  Shield,
  AlertCircle,
} from "lucide-react-native";

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Pay securely with your card",
  },
  {
    id: "easypaisa",
    name: "EasyPaisa",
    icon: Wallet,
    description: "Pay with EasyPaisa wallet",
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    icon: Wallet,
    description: "Pay with JazzCash wallet",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Building,
    description: "Direct bank transfer",
  },
];

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");

  const bookingDetails = {
    productName: "Gaming Laptop",
    days: 6,
    pricePerDay: 2500,
    subtotal: 15000,
    serviceFee: 1500,
    total: 16500,
    startDate: "Feb 20, 2026",
    endDate: "Feb 25, 2026",
  };

  const handlePayment = () => {
    if (!selectedMethod) return;
    Alert.alert("Payment Success", "Your booking has been confirmed!", [
      { text: "OK", onPress: () => navigate("/ratings") }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Booking Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Product</Text>
              <Text style={styles.summaryValue}>{bookingDetails.productName}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rental Period</Text>
            <Text style={styles.summaryValueSmall}>
              {bookingDetails.startDate} - {bookingDetails.endDate}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Rs. {bookingDetails.pricePerDay.toLocaleString()} × {bookingDetails.days} days
            </Text>
            <Text style={styles.priceValue}>Rs. {bookingDetails.subtotal.toLocaleString()}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>Rs. {bookingDetails.serviceFee.toLocaleString()}</Text>
          </View>
          
          <View style={[styles.priceRow, { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12, marginTop: 4 }]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {bookingDetails.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                style={[styles.methodBtn, isSelected && styles.methodBtnActive]}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                  <Icon size={24} color={isSelected ? "#2563EB" : "#6B7280"} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDesc}>{method.description}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Card Entry */}
        {selectedMethod === "card" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  style={styles.textInput}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  placeholder="123"
                  value={cardCVV}
                  onChangeText={setCardCVV}
                  keyboardType="numeric"
                  secureTextEntry
                  style={styles.textInput}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                placeholder="Name on card"
                value={cardName}
                onChangeText={setCardName}
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        {/* Security Alert */}
        <View style={styles.securityBox}>
          <Shield size={20} color="#16A34A" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityText}>Your payment information is encrypted and secure. We never store your card details.</Text>
          </View>
        </View>

        {/* Terms Alert */}
        <View style={styles.termsBox}>
          <AlertCircle size={20} color="#2563EB" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.termsText}>
              By confirming this payment, you agree to Easy Rent's terms. The amount will be held until the product is returned in good condition.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payBtn, !selectedMethod && styles.payBtnDisabled]}
          onPress={handlePayment}
          disabled={!selectedMethod}
        >
          <Text style={styles.payBtnText}>Pay Rs. {bookingDetails.total.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  summaryValueSmall: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
  },
  methodBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  methodBtnActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxActive: {
    backgroundColor: "#DBEAFE",
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  methodDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    height: 56,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    color: "#15803D",
    lineHeight: 18,
  },
  termsBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  termsText: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  payBtn: {
    backgroundColor: "#2563EB",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  payBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
