import { Link, Redirect } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/auth.styles";

export default function Index() {
  // return <Redirect href="/(tabs)" />;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => alert("hello")}>
        <Text>click me</Text>
      </TouchableOpacity>
      <View style={styles.box}>
        <Image source={require("../../assets/images/react-logo.png")} />
        <Image source={require("../../assets/images/react-logo.png")} />
      </View>
      <Link
        style={{
          boxShadow: "0 0 5px black",
          padding: 10,
          margin: 10,
          borderRadius: 5,
        }}
        href="/profile"
      >
        Go to profile
      </Link>
    </View>
  );
}
