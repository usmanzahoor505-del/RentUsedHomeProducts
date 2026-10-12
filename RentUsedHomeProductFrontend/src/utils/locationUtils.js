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
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      const fineGranted =
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const coarseGranted =
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;
      return fineGranted || coarseGranted;
    } catch (err) {
      console.warn("Location permission error:", err);
      return false;
    }
  }
  return true;
};

// Fetch real-time user GPS coordinates with multi-tier fallback (Device Network / IP / City)
export const fetchUserCurrentLocation = async (fallbackCity = "Rawalpindi") => {
  // 1. Ensure permission is requested
  await requestLocationPermission();

  // 2. Query real-time connection location
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("http://ip-api.com/json", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === "success" && data.lat && data.lon) {
        return {
          latitude: parseFloat(Number(data.lat).toFixed(5)),
          longitude: parseFloat(Number(data.lon).toFixed(5)),
          city: data.city || data.regionName || fallbackCity,
          address: `${data.city || data.regionName || "Your Location"}, Pakistan`,
          source: "network_gps",
        };
      }
    }
  } catch (e) {
    // Secondary fallback service
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
      const res2 = await fetch("https://ipwho.is/", { signal: controller2.signal });
      clearTimeout(timeoutId2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.success && data2.latitude && data2.longitude) {
          return {
            latitude: parseFloat(Number(data2.latitude).toFixed(5)),
            longitude: parseFloat(Number(data2.longitude).toFixed(5)),
            city: data2.city || fallbackCity,
            address: `${data2.city || "Your Location"}, Pakistan`,
            source: "network_gps",
          };
        }
      }
    } catch (e2) {}
  }

  // 3. Fallback to registered city coordinates
  const cityCoord = getCityCoords(fallbackCity);
  return {
    latitude: cityCoord.latitude,
    longitude: cityCoord.longitude,
    city: cityCoord.name,
    address: `${cityCoord.name}, Pakistan`,
    source: "city_default",
  };
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
