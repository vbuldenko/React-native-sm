import { Link, Redirect } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/auth.styles";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { signOut } = useAuth();
  // return <Redirect href="/(tabs)" />;
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => alert("hello")}>
        <Text>click me</Text>
      </TouchableOpacity>

      <View>
        <Image source={require("../../assets/images/react-logo.png")} />
        <Image source={require("../../assets/images/react-logo.png")} />
      </View>
      <Link
        style={{
          backgroundColor: "white",
          boxShadow: "0 0 5px black",
          padding: 10,
          margin: 10,
          borderRadius: 5,
        }}
        href="/profile"
      >
        Go to profile
      </Link>

      <TouchableOpacity
        onPress={() => signOut()}
        style={{ padding: 10, backgroundColor: "white" }}
      >
        <Text>click me</Text>
      </TouchableOpacity>
    </View>
  );
}
