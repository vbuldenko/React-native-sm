import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StatusBar } from "expo-status-bar";
import CheckAuthLayout from "@/components/CheckAuthLayout";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
  }
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <StatusBar style="light" />
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
          <CheckAuthLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
