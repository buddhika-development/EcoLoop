import SmallTitle from "@/src/components/ui/Titles/SmallTitle";
import React from "react";
import { View } from "react-native";
import VerticalPostCard from "./VerticalPostCard";

const PostsSection = () => {
  const posts = [
    {
        post_id : "2000000",
        title: "This is sample post title",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
        title: "This is sample post title 2",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
        title: "This is sample post title 3",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
        title: "This is sample post title 4",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
      title: "This is sample post title 5",
      content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
      image: "sakaboom.jpg",
    },
  ];

  return (
    <View className="mt-5">
      <SmallTitle title_content="More Readings" className="mt-5" />

      {/* posts section */}
      <View>
        {posts.map((post, index) => (
          <View key={index} className="border-b-[1px] border-zinc-200 py-3">
            <VerticalPostCard
                post_id={post.post_id}
              post_title={post.title}
              post_content={post.content}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default PostsSection;
