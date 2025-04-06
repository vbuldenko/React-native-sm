import Loader from "@/components/layout/Loader";
import NoPostsFound from "@/components/NoPostsFound";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const profile = useQuery(api.users.getUserProfile, {
    userId: id as Id<"users">,
  });
  const posts = useQuery(api.posts.getPostsByUser, {
    userId: id as Id<"users">,
  });
  const isFollowing = useQuery(api.users.isFollowing, {
    followingId: id as Id<"users">,
  });
  const toggleFollow = useMutation(api.users.toggleFollow);
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  if (
    profile === undefined ||
    posts === undefined ||
    isFollowing === undefined
  ) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* Profile info & stats */}
          <View style={styles.avatarAndStats}>
            <Image
              source={profile.image}
              style={styles.avatar}
              contentFit="cover"
              alt="User Avatar"
              transition={200}
            />

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{profile.fullName}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              // justifyContent: "space-between",
            }}
          >
            <Pressable
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
            >
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing && styles.followingButtonText,
                ]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
            <TouchableOpacity style={styles.shareButton} onPress={() => {}}>
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 ? (
          <NoPostsFound />
        ) : (
          <FlatList
            data={posts}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gridItem} onPress={() => {}}>
                <Image
                  source={item.imageUrl}
                  style={styles.gridImage}
                  contentFit="cover"
                  alt="Post Image"
                  transition={200}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
          />
        )}
      </ScrollView>
    </View>
  );
}
