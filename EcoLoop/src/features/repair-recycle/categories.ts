import { colors } from "../../theme/colors";
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { ComponentType } from "react";

export type CategoryItem = {
  key: string;
  label: string;
  Icon: ComponentType<any>;   // icon set
  iconName: string;           // icon glyph name in that set
  color: string;
};

export const CATEGORIES: Record<"repair" | "recycle", CategoryItem[]> = {
  repair: [
    { key: "home_appliances",  label: "Home Appliances",  Icon: FontAwesome5,         iconName: "tools",                color: colors.brand.primary },
    { key: "office_equipment", label: "Office Equipment", Icon: Ionicons,             iconName: "print-outline",        color: colors.brand.primary },
    { key: "electronics",      label: "Electronics",      Icon: FontAwesome5,         iconName: "laptop",               color: colors.brand.primary },
    { key: "furniture",        label: "Furniture",        Icon: MaterialCommunityIcons, iconName: "sofa",                color: colors.brand.primary },
  ],
  recycle: [
    { key: "plastic",            label: "Plastic",             Icon: MaterialCommunityIcons, iconName: "bottle-soda-outline",  color: colors.brand.accent },
    { key: "e_waste",            label: "E-Waste",             Icon: FontAwesome5,           iconName: "laptop",                color: colors.brand.accent },
    { key: "glass",              label: "Glass",               Icon: MaterialCommunityIcons, iconName: "glass-fragile",         color: colors.brand.accent },
    { key: "metal",              label: "Metal",               Icon: FontAwesome5,           iconName: "cog",                   color: colors.brand.accent },
    { key: "paper_cardboard",    label: "Paper & Cardboard",   Icon: MaterialCommunityIcons, iconName: "file-document-outline", color: colors.brand.accent },
    { key: "textile_fabric",     label: "Textile / Fabric",    Icon: MaterialCommunityIcons, iconName: "tshirt-crew-outline",   color: colors.brand.accent },
    { key: "organic_compostable",label: "Organic / Compostable", Icon: MaterialCommunityIcons, iconName: "leaf",               color: colors.brand.accent },
    { key: "battery_hazardous",  label: "Battery / Hazardous", Icon: MaterialCommunityIcons, iconName: "battery-alert",         color: colors.brand.accent },
  ],
};

// helper: find by key OR label (case-insensitive)
export function getCategoryMeta(
  type: "repair" | "recycle",
  value: string
): CategoryItem | undefined {
  const v = value.toLowerCase();
  return CATEGORIES[type].find(
    (c) => c.key === value || c.label.toLowerCase() === v
  );
}
