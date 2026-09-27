import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";

/**
 * StarRating Component
 * 
 * Dynamically displays ratings with full stars, half stars, and empty stars.
 * E.g., a rating of 4.8 displays 4 full stars and 1 half star.
 * E.g., a rating of 3.5 displays 3 full stars, 1 half star, and 1 empty star.
 * E.g., a rating of 5.0 displays 5 full stars.
 */
export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 14,
  color = "#FBBF24",
  emptyColor = "#D1D5DB",
  emptyFill = "#F3F4F6",
  strokeWidth = 1.5,
  showValue = false,
  showCount = false,
  reviewCount = 0,
  spacing = 2,
  containerStyle,
  valueStyle,
  countStyle,
}) {
  const num = typeof rating === "number" ? rating : parseFloat(rating) || 0;
  const clampedRating = Math.max(0, Math.min(maxStars, num));

  // Determine star type for each position (1 to maxStars)
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const diff = clampedRating - (i - 1);
    if (diff >= 0.95) {
      stars.push({ id: i, type: "full" });
    } else if (diff >= 0.25) {
      // 0.25 to 0.94 -> half star (e.g. 4.8 -> 5th star diff is 0.8 => half star)
      stars.push({ id: i, type: "half" });
    } else {
      stars.push({ id: i, type: "empty" });
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 5-Star Visual Row */}
      <View style={styles.starsRow}>
        {stars.map((star) => {
          if (star.type === "full") {
            return (
              <View key={star.id} style={{ marginRight: spacing }}>
                <Star
                  size={size}
                  color={color}
                  fill={color}
                  strokeWidth={strokeWidth}
                />
              </View>
            );
          }

          if (star.type === "half") {
            return (
              <View
                key={star.id}
                style={[
                  styles.halfStarContainer,
                  { width: size, height: size, marginRight: spacing },
                ]}
              >
                {/* Background: Empty star */}
                <Star
                  size={size}
                  color={emptyColor}
                  fill={emptyFill}
                  strokeWidth={strokeWidth}
                />
                {/* Overlay: Filled star clipped horizontally to 50% width */}
                <View
                  style={[
                    styles.clippedOverlay,
                    { width: size * 0.5, height: size },
                  ]}
                >
                  <Star
                    size={size}
                    color={color}
                    fill={color}
                    strokeWidth={strokeWidth}
                  />
                </View>
              </View>
            );
          }

          // Empty star
          return (
            <View key={star.id} style={{ marginRight: spacing }}>
              <Star
                size={size}
                color={emptyColor}
                fill={emptyFill}
                strokeWidth={strokeWidth}
              />
            </View>
          );
        })}
      </View>

      {/* Numeric Rating Value */}
      {showValue && (
        <Text style={[styles.ratingValue, { fontSize: Math.max(11, size - 2) }, valueStyle]}>
          {clampedRating > 0 ? clampedRating.toFixed(1) : "New"}
        </Text>
      )}

      {/* Review Count */}
      {showCount && (
        <Text style={[styles.reviewCount, { fontSize: Math.max(10, size - 3) }, countStyle]}>
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  halfStarContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  clippedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  ratingValue: {
    marginLeft: 6,
    fontWeight: "700",
    color: "#1F2937",
  },
  reviewCount: {
    marginLeft: 4,
    color: "#6B7280",
    fontWeight: "500",
  },
});
