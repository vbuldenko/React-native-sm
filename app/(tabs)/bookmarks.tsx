import Loader from "@/components/layout/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { View, Text, FlatList, ScrollView } from "react-native";

export default function Bookmarks() {
  const posts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (posts === undefined) return <Loader />;
  if (posts.length === 0) return <NoBookmarkedPostFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarked Posts</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {posts.map((post) => {
          if (!post) return null;
          return (
            <View key={post._id} style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={post.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy={"memory-disk"}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View>
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: 200 }}
            />
          </View>
        )}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      /> */}
    </View>
  );
}

function NoBookmarkedPostFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ fontSize: 18, color: "#555" }}>
        No Bookmarked Posts Found
      </Text>
    </View>
  );
}
