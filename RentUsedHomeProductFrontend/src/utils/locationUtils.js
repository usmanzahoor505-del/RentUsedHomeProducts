import { PermissionsAndroid, Platform } from "react-native";

export const PAKISTANI_CITIES_COORDS = {
  rawalpindi: {
    name: "Rawalpindi",
    latitude: 33.5973,
    longitude: 73.0479,
  },
  islamabad: {
    name: "Islamabad",
    latitude: 33.6844,
    longitude: 73.0479,
  },
  lahore: {
    name: "Lahore",
    latitude: 31.5204,
    longitude: 74.3587,
  },
  karachi: {
    name: "Karachi",
    latitude: 24.8607,
    longitude: 67.0011,
  },
  peshawar: {
    name: "Peshawar",
    latitude: 34.0151,
    longitude: 71.5249,
  },
  faisalabad: {
    name: "Faisalabad",
    latitude: 31.4504,
    longitude: 73.1350,
  },
  multan: {
    name: "Multan",
    latitude: 30.1575,
    longitude: 71.5249,
  },
  quetta: {
    name: "Quetta",
    latitude: 30.1798,
    longitude: 66.9750,
  },
  sialkot: {
    name: "Sialkot",
    latitude: 32.4945,
    longitude: 74.5229,
  },
  gujranwala: {
    name: "Gujranwala",
    latitude: 32.1877,
    longitude: 74.1945,
  },
  hyderabad: {
    name: "Hyderabad",
    latitude: 25.3960,
    longitude: 68.3578,
  },
};

export const getCityCoords = (cityName) => {
  if (!cityName) return PAKISTANI_CITIES_COORDS.rawalpindi;
  const lower = cityName.trim().toLowerCase();
  for (const [key, val] of Object.entries(PAKISTANI_CITIES_COORDS)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return PAKISTANI_CITIES_COORDS.rawalpindi;
};

export const requestLocationPermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "Easy Rent needs access to your device GPS location to show nearby delivery jobs and track deliveries.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "Allow",
        }
      );
      return (
        granted === PermissionsAndroid.RESULTS.GRANTED ||
        granted === true
      );
    } catch (err) {
      console.warn("Location permission error:", err);
      return false;
    }
  }
  return true;
};

// Haversine formula distance calculation in kilometers
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};
