import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigate } from "react-router";
import { Package } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const navigate = useNavigate();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Timer to navigate
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={["#9333EA", "#7C3AED", "#4F46E5"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Logo Card */}
          <View style={styles.logoCard}>
            <Package size={80} color="#9333EA" strokeWidth={2} />
          </View>
          
          <Text style={styles.appTitle}>Easy Rent</Text>
          <Text style={styles.appSubtitle}>Rent anything, anytime</Text>
          
          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            <Dot delay={0} />
            <Dot delay={200} />
            <Dot delay={400} />
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Dot({ delay }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim, delay]);

  return (
    <Animated.View style={[styles.dot, { opacity: anim, transform: [{ scale: anim }] }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 30,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 18,
    color: "#E0E7FF",
    marginTop: 8,
    fontWeight: "500",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 60,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    color: "#E0E7FF",
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.8,
  },
});
