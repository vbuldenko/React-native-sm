import { ScrollView, View } from "react-native";
import { styles } from "../../styles/auth.styles";
import Header from "@/components/layout/Header";
import Stories from "@/components/Stories";
import Post from "@/components/Post";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/layout/Loader";
import NoPostsFound from "@/components/NoPostsFound";

export default function Index() {
  const posts = useQuery(api.posts.getFeedPosts);

  if (!posts) return <Loader />;
  if (posts.length === 0) return <NoPostsFound />;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Stories />

        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </ScrollView>
    </View>
  );
}
