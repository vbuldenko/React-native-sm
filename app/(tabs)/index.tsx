import { FlatList, RefreshControl, ScrollView, View } from "react-native";
import { styles } from "../../styles/auth.styles";
import Header from "@/components/layout/Header";
import Stories from "@/components/Stories";
import Post from "@/components/Post";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/layout/Loader";
import NoPostsFound from "@/components/NoPostsFound";
import { useState } from "react";
import { COLORS } from "@/constants/theme";

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const posts = useQuery(api.posts.getFeedPosts);

  if (!posts) return <Loader />;
  if (posts.length === 0) return <NoPostsFound />;

  const handleRefresh = async () => {
    setRefreshing(true);
    // await posts.refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header />

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<Stories />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}
