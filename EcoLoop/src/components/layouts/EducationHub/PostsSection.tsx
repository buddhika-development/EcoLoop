import SmallTitle from "@/src/components/ui/Titles/SmallTitle";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import VerticalPostCard from "./VerticalPostCard";

const PostsSection = () => {
  
  const [searchQuery, setSearchQuery] = useState("");
    const [isSearch, setIsSearch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // only store a simple error message string (easier to log and show in UI)
    const [error, setError] = useState<string | null>(null);
    // typed as an array or null while loading/not-loaded yet
    const [allPosts, setAllPosts] = useState<any[] | null>(null);
    const [searchPosts, setSearchPosts] = useState<any[] | null>(null);
  
    useEffect(() => {
      
      const fetchPosts = async () => {
        try {
          console.log("Fetching posts from API...");

          const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000"; // Your Flask backend URL

          const response = await fetch(`${API_URL}/api/posts/all`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          console.log("Posts fetched successfully:", data);
          setAllPosts(data);
  
        } catch (error) {
          setError("Error fetching posts");
        }
      };
  
  
      fetchPosts();
    }, []);

    const displayedPosts = allPosts ? allPosts.slice(4) : null;

  return (
    <View className="mt-5">
      <SmallTitle title_content="More Readings" className="mt-5" />

      {/* posts section */}
      <View>
        {displayedPosts?.map((post, index) => (
          <View key={index} className="border-b-[1px] border-zinc-200 py-3">
            <VerticalPostCard
              post_id={post.post_id}
              post_title={post.post_title}
              post_content={post.post_content}
              post_image={post.post_image_url}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default PostsSection;
