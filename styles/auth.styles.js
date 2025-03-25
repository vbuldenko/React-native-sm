import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 20,
  },
  button: {
    padding: 10, // padding: 10px
    margin: 10, // margin: 10px
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", // boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
    borderRadius: 10, // borderRadius: 5px
  },
  box: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    margin: 10,
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
  },
});
