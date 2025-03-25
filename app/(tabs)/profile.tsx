import { View, Text } from "react-native";

export default function Profile() {
  return (
    <View>
      <Text
        style={{
          padding: 10,
          margin: 10,
          borderRadius: 5,
          boxShadow: "0 0 5px gray",
        }}
      >
        Welcome to profile page
      </Text>
    </View>
  );
}
