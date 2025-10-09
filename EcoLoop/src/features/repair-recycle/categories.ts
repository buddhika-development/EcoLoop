import { colors } from "../../theme/colors";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentType } from "react";
import { TextStyle } from "react-native";

export type CategoryItem = { key: string; label: string; Icon: ComponentType<any>; color: string };

export const CATEGORIES: Record<"repair"|"recycle", CategoryItem[]> = {
  repair: [
    { key: "home_appliances", label: "Home Appliances", Icon: FontAwesome5, color: colors.brand.primary },
    { key: "office_equipment", label: "Office Equipment", Icon: FontAwesome5, color: colors.brand.primary },
    { key: "electronics", label: "Electronics", Icon: FontAwesome5, color: colors.brand.primary },
    { key: "furniture", label: "Furniture", Icon: MaterialCommunityIcons, color: colors.brand.primary },
  ],
  recycle: [
    { key: "plastic", label: "Plastic", Icon: MaterialCommunityIcons, color: colors.brand.accent },
    { key: "e_waste", label: "E-Waste", Icon: FontAwesome5, color: colors.brand.accent },
    { key: "glass", label: "Glass", Icon: MaterialCommunityIcons, color: colors.brand.accent },
    { key: "metal", label: "Metal", Icon: FontAwesome5, color: colors.brand.accent },
    { key: "paper_cardboard", label: "Paper & Cardboard", Icon: FontAwesome5, color: colors.brand.accent },
    { key: "textile_fabric", label: "Textile / Fabric", Icon: FontAwesome5, color: colors.brand.accent },
    { key: "organic_compostable", label: "Organic / Compostable", Icon: FontAwesome5, color: colors.brand.accent },
    { key: "battery_hazardous", label: "Battery / Hazardous", Icon: FontAwesome5, color: colors.brand.accent },
  ],
};

export function getCategoryMeta(type: "repair"|"recycle", key: string): CategoryItem | undefined {
  return CATEGORIES[type].find(c => c.key === key);
}
