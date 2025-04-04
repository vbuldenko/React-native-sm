import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function Header() {
  const { signOut } = useAuth();
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>mockgram</Text>
      <TouchableOpacity onPress={() => signOut()}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}
