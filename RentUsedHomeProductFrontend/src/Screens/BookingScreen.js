import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar as CalendarIcon, CreditCard, ChevronDown } from "lucide-react-native";
import DatePicker from "react-native-date-picker";
import { format } from "date-fns";
import { useDateFilter } from "../context/DateFilterContext";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { API_URL } from "../utils/api";

const { width } = Dimensions.get("window");

export default function BookingScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { 
    startDate: contextStartDate, 
    numberOfDays: contextNumberOfDays, 
    setStartDate: setContextStartDate, 
    setNumberOfDays: setContextNumberOfDays,
  } = useDateFilter();
  
  const [startDate, setStartDate] = useState(contextStartDate || new Date());
  const [numberOfDays, setNumberOfDays] = useState(contextNumberOfDays || 1);
  const [open, setOpen] = useState(false);
  
  const { userId } = useUser();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const productPrice = product?.pricePerDay || 0;

  const calculateTotal = () => {
    if (startDate && numberOfDays > 0) {
      const subtotal = numberOfDays * productPrice;
      const serviceFee = subtotal * 0.1;
      const total = subtotal + serviceFee;
      return {
        days: numberOfDays,
        subtotal,
        serviceFee,
        total,
      };
    }
    return { days: 0, subtotal: 0, serviceFee: 0, total: 0 };
  };

  const totals = calculateTotal();

  const handleDateUpdate = (newStartDate, newNumberOfDays) => {
    if (newStartDate !== undefined) {
      setStartDate(newStartDate);
      setContextStartDate(newStartDate);
    }
    if (newNumberOfDays !== undefined) {
      const days = Math.max(1, parseInt(newNumberOfDays) || 1);
      setNumberOfDays(days);
      setContextNumberOfDays(days);
    }
  };

  const getCalculatedEndDate = () => {
    if (!startDate) return undefined;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numberOfDays - 1);
    return endDate;
  };

  const handleBookingSubmit = async () => {
    if (!product || !userId) {
      console.log("Missing product or userId:", { product: !!product, userId: !!userId });
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        ProductId: product.productId,
        OwnerId: product.owner.userId,
        RenterId: userId,
        StartDate: format(startDate, 'yyyy-MM-dd'),
        EndDate: format(getCalculatedEndDate(), 'yyyy-MM-dd')
      };
      
      console.log("Sending Payload:", payload);
      const res = await axios.post(`${API_URL}/rental`, payload);
      navigate("/booking-confirmation/" + res.data.rentalId);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Booking</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Date Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Rental Period</Text>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity 
              onPress={() => setOpen(true)}
              style={styles.datePickerBtn}
            >
              <View style={styles.innerPicker}>
                <CalendarIcon size={20} color="#9333EA" style={{ marginRight: 10 }} />
                <Text style={styles.dateText}>
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Text>
              </View>
              <ChevronDown size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <DatePicker
              modal
              open={open}
              date={startDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onConfirm={(date) => {
                setOpen(false);
                handleDateUpdate(date, numberOfDays);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />
          </View>

          {/* Number of Days */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Days</Text>
            <View style={styles.numberInputBox}>
              <TextInput
                keyboardType="numeric"
                value={numberOfDays.toString()}
                onChangeText={(text) => handleDateUpdate(startDate, text)}
                style={styles.numberInput}
              />
              <Text style={styles.inputUnit}>Day(s)</Text>
            </View>
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>End Date (Calculated)</Text>
            <View style={styles.disabledDateBox}>
              <CalendarIcon size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
              <Text style={styles.disabledDateText}>
                {getCalculatedEndDate() ? format(getCalculatedEndDate(), "PPP") : "Auto-calculated"}
              </Text>
            </View>
            <Text style={styles.hintText}>Automatically calculated based on your rental days.</Text>
          </View>
        </View>

        {/* Status Alert */}
        <View style={styles.statusBox}>
          <View style={styles.greenCheck} />
          <View>
            <Text style={styles.statusTitle}>Available for Selected Dates</Text>
            <Text style={styles.statusDesc}>
              This item is ready for pickup during your period.
            </Text>
          </View>
        </View>

        {/* Pricing Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Rs. {productPrice.toLocaleString()} × {totals.days} day{totals.days > 1 ? "s" : ""}
            </Text>
            <Text style={styles.summaryValue}>Rs. {totals.subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee (10%)</Text>
            <Text style={styles.summaryValue}>Rs. {Math.round(totals.serviceFee).toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {Math.round(totals.total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Rental Terms Card */}
        <View style={[styles.card, { backgroundColor: "#F5F3FF", borderColor: "#DDD6FE" }]}>
          <Text style={[styles.cardTitle, { color: "#4C1D95" }]}>Rental Terms</Text>
          <Text style={styles.termItem}>• Payment is required to confirm booking</Text>
          <Text style={styles.termItem}>• Item must be returned in same condition</Text>
          <Text style={styles.termItem}>• Late returns incur additional charges</Text>
          <Text style={styles.termItem}>• Security deposit may be required</Text>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleBookingSubmit}
          disabled={isSubmitting}
        >
          <CreditCard size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.confirmBtnText}>{isSubmitting ? "Processing..." : "Send Booking Request"}</Text>
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
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  innerPicker: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 15,
    color: "#111827",
  },
  numberInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  inputUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  disabledDateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  disabledDateText: {
    fontSize: 15,
    color: "#6B7280",
  },
  hintText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 20,
  },
  greenCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
  },
  statusDesc: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9333EA",
  },
  termItem: {
    fontSize: 13,
    color: "#5B21B6",
    lineHeight: 20,
    marginBottom: 4,
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
  confirmBtn: {
    backgroundColor: "#9333EA",
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
