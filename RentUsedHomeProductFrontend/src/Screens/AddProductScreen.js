import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
  Switch,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";

const { width } = Dimensions.get("window");
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  X,
  Laptop,
  Sofa,
  Wrench,
  UtensilsCrossed,
  MoreHorizontal,
  Package,
  ChevronDown,
} from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { API_URL } from "../utils/api";
import { useUser } from "../context/UserContext";

// Hardcoded dropdown options for each attribute
const ATTRIBUTE_OPTIONS = {
  // Electronics - Laptops
  "Brand":        ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Samsung", "Other"],
  "Processor":    ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1", "Apple M2"],
  "RAM":          ["4GB", "8GB", "12GB", "16GB", "32GB", "64GB"],
  "Storage":      ["128GB", "256GB", "512GB", "1TB", "2TB"],
  "Screen Size":  ["11 inch", "13 inch", "14 inch", "15.6 inch", "16 inch", "17 inch"],
  // Electronics - Smartphones
  "Model":        ["iPhone 14", "iPhone 15", "Samsung S23", "Samsung S24", "Pixel 8", "OnePlus 12", "Xiaomi 13", "Other"],
  "Battery":      ["3000 mAh", "4000 mAh", "5000 mAh", "6000 mAh"],
  "Camera":       ["12 MP", "48 MP", "50 MP", "64 MP", "108 MP", "200 MP"],
  // Electronics - Cameras
  "Type":         ["DSLR", "Mirrorless", "Point & Shoot", "Action Camera", "Security Camera", "Sofa", "L-Shape", "Recliner", "Wooden", "Office", "Gaming", "Bar", "Folding"],
  "Megapixels":   ["12 MP", "20 MP", "24 MP", "36 MP", "45 MP", "61 MP"],
  "Storage Type": ["SD Card", "CFast", "XQD", "Internal Only"],
  "Lens":         ["Kit Lens", "Wide Angle", "Telephoto", "Prime", "Macro"],
  // Electronics - Tablets & Accessories
  "Connectivity": ["Wi-Fi Only", "Wi-Fi + 4G", "Wi-Fi + 5G"],
  "Compatibility":["Android", "iOS", "Windows", "Universal"],
  "Color":        ["Black", "White", "Silver", "Gold", "Blue", "Red", "Grey", "Brown"],
  // Furniture
  "Size":         ["Single", "Double", "Queen", "King", "Small", "Medium", "Large", "Extra Large"],
  "Material":     ["Wood", "Metal", "Plastic", "Fabric", "Leather", "Glass", "Foam"],
  "Seating Capacity": ["1 Person", "2 Persons", "3 Persons", "4 Persons", "6 Persons", "8+ Persons"],
  "Shape":        ["Round", "Square", "Rectangle", "Oval"],
  "Doors":        ["1 Door", "2 Doors", "3 Doors", "4 Doors", "Sliding"],
  "Adjustable":   ["Yes", "No"],
  // Tools - Power Drills & Drivers
  "Drill Type":         ["Hammer Drill", "Impact Driver", "Drill Driver", "Right Angle Drill", "Rotary Hammer"],
  "Voltage":            ["12V", "18V", "20V", "24V", "36V", "Corded"],
  "Chuck Size":         ["3/8 inch", "1/2 inch", "1/4 inch"],
  "Maximum RPM":        ["500 RPM", "1000 RPM", "1500 RPM", "2000 RPM", "2500 RPM", "3000 RPM"],
  "Motor Type":         ["Brushed", "Brushless"],
  // Tools - Cutting & Sawing Tools
  "Saw Type":           ["Circular Saw", "Miter Saw", "Reciprocating Saw", "Jigsaw", "Table Saw", "Band Saw"],
  "Blade Diameter":     ["6.5 inch", "7.25 inch", "10 inch", "12 inch"],
  "Maximum Cut Depth":  ["1.5 inch", "2 inch", "2.5 inch", "3 inch", "3.5 inch"],
  "Bevel Capacity":     ["45°", "48°", "50°", "52°", "60°"],
  "Amperage":           ["7.5A", "10A", "12A", "15A", "20A"],
  // Tools - Fastening Tools
  "Fastener Size":      ["16 Gauge", "18 Gauge", "21 Degree", "30-34 Degree"],
  "Drive Size":         ["1/4 inch", "3/8 inch", "1/2 inch", "3/4 inch"],
  "Maximum Torque":     ["100 Nm", "150 Nm", "200 Nm", "300 Nm", "400 Nm", "500 Nm"],
  "Magazine Capacity":  ["50 Nails", "100 Nails", "150 Nails", "200 Nails"],
  // Tools - Sanding & Grinding Tools
  "Sander Type":        ["Orbital Sander", "Belt Sander", "Angle Grinder", "Detail Sander", "Disc Sander"],
  "Pad/Belt Size":      ["4x24 inch", "3x21 inch", "5 inch", "6 inch"],
  "Orbit Diameter":     ["3/16 inch", "3/32 inch", "1/8 inch"],
  "Speed":              ["Variable Speed", "Fixed RPM", "5000 OPM", "10000 OPM", "12000 OPM"],
  "Dust Extraction Port": ["Yes", "No"],
  // Tools - Hand Tool Sets
  "Set Type":           ["Socket Set", "Screwdriver Set", "Wrench Set", "Combination Set", "Hex Key Set"],
  "Drive System":       ["Metric", "SAE (Imperial)", "Torx", "Metric + SAE"],
  "Piece Count":        ["20 Pc", "40 Pc", "72 Pc", "100 Pc", "148 Pc", "200+ Pc"],
  "Case Type":          ["Hard Shell Case", "Roll-up Pouch", "Blow Mold Case", "Carrying Bag", "No Case"],
  // Kitchen - Cookware & Bakeware
  "Heat Source Compatibility": ["Induction", "Gas", "Electric", "Oven-Safe", "All Stovetops"],
  "Capacity/Size":    ["Individual", "5-Quart", "8-Quart", "10-inch", "12-inch", "3-Tier", "Family-Sized"],
  "Coating Type":     ["Non-Stick", "Ceramic Coating", "Uncoated Stainless Steel", "Enameled Cast Iron", "PFAS-Free"],
  "Specialty Function": ["Stackable", "Space-Saving", "Rapid-Heating", "Dishwasher-Safe", "Multi-Purpose"],
  // Kitchen - Small Kitchen Appliances
  "Appliance Type":   ["Air Fryer", "Smart Blender", "Induction Cooktop", "Coffee Roaster", "Slow Cooker", "Instant Pot", "Toaster Oven"],
  "Connectivity":     ["Wi-Fi Enabled", "App-Controlled", "AI-Assisted", "Voice-Activated", "No Connectivity"],
  "Sustainability Rating": ["A Energy Rating", "Energy-Efficient", "Eco-Friendly Materials", "Standard", "Not Rated"],
  "Form Factor":      ["Portable", "Countertop", "Integrated", "Multi-Functional", "Compact"],
  "Finishes/Colors":  ["Matte Black", "Brushed Metal", "Earthy Tones", "Retro Style", "Stainless Steel", "White", "Red"],
  // Kitchen - Tableware & Dinnerware
  "Item Type":        ["Plates", "Bowls", "Mugs", "Cutlery Sets", "Teapots", "Serving Platters", "Glasses"],
  "Style":            ["Minimalist", "Artisanal/Handmade", "Modern Rustic", "Patterned", "Fluted", "Classic"],
  "Color Palette":    ["Earthy Brown", "Soft Sage", "Muted Greige", "Deep Aubergine", "White", "Navy Blue", "Terracotta"],
  "Durability":       ["Microwave-Safe", "Dishwasher-Safe", "Chip-Resistant", "Scratch-Resistant", "All of the Above"],
  // Kitchen - Organization & Storage
  "Storage Location": ["Pantry", "Drawer", "Under-Sink", "Countertop", "Wall-Mounted", "Fridge"],
  "Container Type":   ["Modular Canisters", "Stacking Bins", "Rotating Lazy Susan", "Spice Rack", "Glass Jars", "Drawer Dividers"],
  "Specialized Use":  ["Produce Drawers", "Bread Box", "Fridge Organization Kit", "Cutlery Tray", "Pot & Pan Organizer"],
  "Feature":          ["Airtight Seal", "Transparent", "Ventilated", "Collapsible", "Labeled", "BPA-Free"],
  // Kitchen - Preparation & Culinary Tools
  "Tool Type":        ["Chef's Knife", "Silicone Spatula", "Wooden Spoon", "Measuring Cups", "Garlic Crusher", "Whisk", "Peeler"],
  "Ergonomics":       ["Ergonomic Handle", "Heat-Resistant", "Non-Slip Grip", "Weighted", "Ambidextrous"],
  "Functional Need":  ["Peelers", "Graters", "Sifters", "Whippers", "Choppers", "Mandolines"],
  "Aesthetic Style":  ["Modern Minimalist", "Rustic", "Industrial", "Vibrant Colors", "Neutral Tones"],
  // General
  "Condition":    ["Brand New", "Like New", "Good", "Fair", "Needs Repair"],
};



export default function AddProductScreen() {
  const navigate = useNavigate();
  const { userId, userCity } = useUser();

  // Form State
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [condition, setCondition] = useState(8);
  const [availableImmediately, setAvailableImmediately] = useState(true);

  // API Data State
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [activeAttrModal, setActiveAttrModal] = useState(null);

  // Icon Mapping for Categories
  const getCategoryIcon = (name) => {
    switch (name?.toLowerCase()) {
      case "electronics": return Laptop;
      case "furniture": return Sofa;
      case "tools": return Wrench;
      case "kitchen": return UtensilsCrossed;
      default: return Package;
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleCategorySelect = async (catId) => {
    setSelectedCategory(catId);
    setSelectedSubCategoryId(null);
    setSelectedSubCategoryName("");
    setSubCategories([]);
    setCategoryAttributes([]);
    setSelectedAttributes({});

    try {
      const response = await axios.get(`${API_URL}/categoryattributes/bycategory/${catId}`);
      console.log("Sub-Categories for Category " + catId + ":", response.data);
      setSubCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sub-categories", error);
      setSubCategories([]);
    }
  };

  const handleSubCategorySelect = (subCatId, subCatName, attributesList) => {
    setSelectedSubCategoryId(subCatId);
    setSelectedSubCategoryName(subCatName);
    setSelectedAttributes({});
    setShowSubModal(false);

    // attributes_list = "Brand,Processor,RAM,Storage,Screen Size" — split karke array banao
    const attrNames = (attributesList || "").split(",").map((a, index) => ({
      attributeId: index,
      name: a.trim(),
      type: "dropdown",
    }));
    setCategoryAttributes(attrNames);
  };

  const handleImageUpload = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed.");
      return;
    }

    // Android permission check
    if (Platform.OS === "android") {
      try {
        // Android 13+ needs READ_MEDIA_IMAGES, older needs READ_EXTERNAL_STORAGE
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: "Gallery Permission",
          message: "App needs access to your gallery to upload product images.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "Allow",
        });

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Please allow gallery access in settings to upload images.");
          return;
        }
      } catch (err) {
        console.warn("Permission error:", err);
      }
    }

    const options = {
      mediaType: "photo",
      selectionLimit: 5 - images.length,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", `Image picker error: ${response.errorMessage}`);
        return;
      }
      if (response.assets) {
        const newImages = response.assets.map((asset) => asset.uri);
        setImages([...images, ...newImages]);
      }
    });
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Missing Field", "Please enter a product title.");
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert("Missing Field", "Please enter a valid price per day.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Missing Field", "Please select a main category.");
      return;
    }
    if (!selectedSubCategoryId) {
      Alert.alert("Missing Field", "Please select a sub-category (e.g. Laptops).");
      return;
    }

    setLoadingAttributes(true);
    try {
      // Build attributes array — each attr has real DB attributeId
      const attributesPayload = Object.entries(selectedAttributes)
        .filter(([_, val]) => val && val.trim() !== "")
        .map(([attrIndex, val]) => {
          const attr = categoryAttributes[parseInt(attrIndex)];
          return {
            attributeId: attr ? attr.attributeId : 0,  // DB attribute_id from Category_Attributes
            attributeName: attr ? attr.name : "",        // e.g. "Brand"
            value: val                                   // e.g. "Apple"
          };
        });

      const payload = {
        title:          title.trim(),
        description:    description.trim(),
        userId:         userId || 1,
        categoryId:     selectedCategory,
        subCategoryId:  selectedSubCategoryId,
        condition:      parseInt(condition),
        pricePerDay:    parseFloat(price),
        location:       userCity || "Karachi",
        status:         "Available",
        attributes:     attributesPayload,
      };

      console.log("=== Submitting Product ===", JSON.stringify(payload, null, 2));

      // Step 1: Create product (with attributes atomically)
      const res = await axios.post(`${API_URL}/products`, payload);
      const productId = res.data?.productId;

      // Step 2: Upload images if any
      if (images.length > 0 && productId) {
        const formData = new FormData();
        images.forEach((uri) => {
          const fileName = uri.split("/").pop();
          const match = /\.(\w+)$/.exec(fileName);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("images", { uri, name: fileName, type });
        });

        console.log("=== Uploading Images for Product ID:", productId);
        await axios.post(`${API_URL}/products/upload-images/${productId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      Alert.alert("✅ Success!", "Your product has been listed successfully!", [
        { text: "OK", onPress: () => navigate("/home") }
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      console.error("Submit Error:", msg);
      Alert.alert("❌ Error", `Failed to submit product.\n\n${msg}`);
    } finally {
      setLoadingAttributes(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate(-1)}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
        </View>

        {/* Category Selection */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.categoryName);
            const isSelected = selectedCategory === cat.categoryId;
            return (
              <TouchableOpacity
                key={cat.categoryId}
                onPress={() => handleCategorySelect(cat.categoryId)}
                style={[styles.catItem, isSelected && styles.catItemActive]}
              >
                <Icon size={18} color={isSelected ? "#9333EA" : "#9CA3AF"} style={{ marginRight: 8 }} />
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>{cat.categoryName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {!selectedCategory ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Package size={48} color="#9333EA" />
          </View>
          <Text style={styles.emptyTitle}>Select a Category</Text>
          <Text style={styles.emptyDesc}>
            Choose a category from the tabs above to start adding your product
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>

          {/* Sub-Category Dropdown */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Sub-Category *</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowSubModal(!showSubModal)}
            >
              <Text style={styles.pickerText}>
                {selectedSubCategoryName || "Select Type (e.g. Laptop)"}
              </Text>
              <ChevronDown size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showSubModal && (
              <View style={styles.subGrid}>
                {subCategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.attributeId}
                    style={[
                      styles.subItem,
                      selectedSubCategoryId === sub.attributeId && styles.subItemActive
                    ]}
                    onPress={() => handleSubCategorySelect(sub.attributeId, sub.name, sub.attributesList)}
                  >
                    <Text style={[
                      styles.subText,
                      selectedSubCategoryId === sub.attributeId && styles.subTextActive
                    ]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Dynamic Product Attributes From Database */}
          {loadingAttributes ? (
            <ActivityIndicator color="#9333EA" style={{ marginVertical: 20 }} />
          ) : (
            categoryAttributes.map((attr) => (
              <View key={attr.attributeId} style={styles.card}>
                <Text style={styles.inputLabel}>{attr.name} *</Text>
                {attr.type === "dropdown" ? (
                  <>
                    <TouchableOpacity
                      style={styles.pickerBtn}
                      onPress={() =>
                        setActiveAttrModal(
                          activeAttrModal === attr.attributeId
                            ? null
                            : attr.attributeId
                        )
                      }
                    >
                      <Text style={styles.pickerText}>
                        {selectedAttributes[attr.attributeId] ||
                          `Select ${attr.name}`}
                      </Text>
                      <ChevronDown size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {activeAttrModal === attr.attributeId && (
                      <View style={styles.subGrid}>
                        {(ATTRIBUTE_OPTIONS[attr.name] || ["No Options"]).map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.subItem,
                              selectedAttributes[attr.attributeId] === opt && styles.subItemActive,
                            ]}
                            onPress={() => {
                              setSelectedAttributes({
                                ...selectedAttributes,
                                [attr.attributeId]: opt,
                              });
                              setActiveAttrModal(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.subText,
                                selectedAttributes[attr.attributeId] === opt && styles.subTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View>
                    <TextInput
                      style={styles.textInput}
                      placeholder={`Enter ${attr.name}`}
                      value={selectedAttributes[attr.attributeId] || ""}
                      onChangeText={(text) => {
                        setSelectedAttributes({
                          ...selectedAttributes,
                          [attr.attributeId]: text,
                        });
                      }}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}
              </View>
            ))
          )}

          {/* Images */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Product Images (Max 5)</Text>
            <View style={styles.imageGrid}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageBox}>
                  <Image source={{ uri }} style={styles.uploadedImg} />
                  <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.uploadBtn} onPress={handleImageUpload}>
                  <Upload size={24} color="#9CA3AF" />
                  <Text style={styles.uploadLabel}>Upload</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title & Desc */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Title</Text>
              <TextInput
                placeholder="e.g., Gaming Laptop RTX 3060"
                value={title}
                onChangeText={setTitle}
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                placeholder="Describe your product in detail..."
                value={description}
                onChangeText={setDescription}
                style={[styles.textInput, styles.textArea]}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Price & Condition */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price per Day (PKR)</Text>
              <View style={styles.priceInputBox}>
                <Text style={styles.currencyLabel}>Rs.</Text>
                <TextInput
                  placeholder="0"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  style={styles.priceInput}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.conditionHeader}>
                <Text style={styles.inputLabel}>Condition</Text>
                <Text style={styles.conditionValue}>{condition}/10</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={condition}
                onValueChange={setCondition}
                minimumTrackTintColor="#9333EA"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#9333EA"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderSubText}>Poor</Text>
                <Text style={styles.sliderSubText}>Excellent</Text>
              </View>
            </View>
          </View>

          {/* Toggle */}
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Available Immediately</Text>
                <Text style={styles.toggleDesc}>Item is ready to rent right away</Text>
              </View>
              <Switch
                value={availableImmediately}
                onValueChange={setAvailableImmediately}
                trackColor={{ false: "#E5E7EB", true: "#9333EA" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit Listing</Text>
          </TouchableOpacity>
        </ScrollView>
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
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 12,
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  catItemActive: {
    backgroundColor: "#F5F3FF",
    borderColor: "#9333EA",
  },
  catText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  catTextActive: {
    color: "#4C1D95",
  },
  emptyState: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4C1D95",
    marginBottom: 12,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  formScroll: {
    padding: 20,
    paddingBottom: 40,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
  },
  pickerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerText: {
    fontSize: 15,
    color: "#111827",
  },
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  subItem: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  subItemActive: {
    backgroundColor: "#9333EA",
  },
  subText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  subTextActive: {
    color: "#FFFFFF",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageBox: {
    width: (width - 112) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  uploadedImg: {
    width: "100%",
    height: "100%",
  },
  removeImgBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBtn: {
    width: (width - 112) / 3,
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  uploadLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingVertical: 16,
  },
  priceInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B7280",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conditionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9333EA",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderSubText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  toggleDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: "#9333EA",
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
