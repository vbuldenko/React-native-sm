import Loader from "@/components/layout/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/notification.styles";
import { useQuery } from "convex/react";
import { View, Text, FlatList } from "react-native";
import Notification from "@/components/Notification";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  if (!notifications) return <Loader />;
  if (notifications.length === 0) return <NotificationsEmpty />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => <Notification notification={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

function NotificationsEmpty() {
  return (
    <View
      style={[
        styles.container,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Text style={{ color: COLORS.grey }}>No notifications yet.</Text>
    </View>
  );
}
