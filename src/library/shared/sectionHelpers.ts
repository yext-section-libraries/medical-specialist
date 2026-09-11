import type { CSSProperties } from "react";
import {
  getThemeColorCssValue,
  normalizeThemeColorToken,
  type MaybeRTFProps,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";

/** Options formerly exposed as ThemeOptions.ASPECT_RATIO. */
export const aspectRatioOptions = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:3", value: 1.33 },
  { label: "3:2", value: 1.5 },
  { label: "5:3", value: 1.67 },
  { label: "16:9", value: 1.78 },
  { label: "2:1", value: 2 },
  { label: "3:1", value: 3 },
  { label: "4:1", value: 4 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
  { label: "2:3", value: 0.67 },
];

export const toThemeCss = (
  color?: ThemeColor | string,
  fallback?: string,
): string | undefined => getThemeColorCssValue(color) ?? fallback;

export const getThemeToken = (
  color?: ThemeColor | string,
  fallbackToken?: string,
): string | undefined => normalizeThemeColorToken(color) ?? fallbackToken;

export const getReadableSectionForeground = (
  backgroundColor?: ThemeColor,
): string =>
  getThemeToken(backgroundColor?.contrastingColor, "palette-quaternary") ??
  "palette-quaternary";

export const getTextColorCss = (
  color?: ThemeColor | string,
  fallbackToken?: string,
  fallbackCss?: string,
): string | undefined =>
  toThemeCss(
    getThemeToken(color, fallbackToken),
    fallbackToken ? toThemeCss(fallbackToken, fallbackCss) : fallbackCss,
  );

export const pxOrUndefined = (value?: string): string | undefined =>
  !value || value === "default" ? undefined : value;

export const getRichTextStyleOverrides = (
  value: StyledTextValue,
  color?: ThemeColor | string,
  fallbackColorToken?: string,
): NonNullable<MaybeRTFProps["richTextStyleOverrides"]> => ({
  fontFamily: pxOrUndefined(value.fontFamily),
  fontSize: pxOrUndefined(value.fontSize),
  fontWeight: pxOrUndefined(value.fontWeight),
  fontStyle: value.fontStyle === "default" ? undefined : value.fontStyle,
  textTransform:
    value.textTransform === "default" ? undefined : value.textTransform,
  color: color ?? fallbackColorToken,
});

export const getPreferredBlackOrWhite = (
  color?: ThemeColor | string,
): string | undefined => {
  if (!color || typeof color === "string") {
    return undefined;
  }

  const token = color.contrastingColor?.trim().toLowerCase();
  if (token === "black") {
    return "#000000";
  }
  if (token === "white") {
    return "#ffffff";
  }
  return undefined;
};

export const getContrastTextColor = (
  color?: ThemeColor | string,
): string => getPreferredBlackOrWhite(color) ?? "#ffffff";

export const getTextStyle = (
  value: StyledTextValue,
  color: ThemeColor | string | undefined,
  fallbackFamily: string,
  fallbackColorToken?: string,
): CSSProperties => ({
  fontFamily:
    value.fontFamily === "default" ? fallbackFamily : value.fontFamily,
  fontSize: pxOrUndefined(value.fontSize),
  fontWeight: pxOrUndefined(value.fontWeight),
  fontStyle: pxOrUndefined(value.fontStyle),
  textTransform: pxOrUndefined(value.textTransform),
  color: getTextColorCss(color, fallbackColorToken),
});

export const hasImageUrl = (image: unknown): boolean => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const imageRecord = image as Record<string, unknown>;
  if (typeof imageRecord.url === "string" && imageRecord.url.trim()) {
    return true;
  }

  const nestedImage = imageRecord.image;
  return Boolean(
    nestedImage &&
      typeof nestedImage === "object" &&
      typeof (nestedImage as Record<string, unknown>).url === "string" &&
      ((nestedImage as Record<string, unknown>).url as string).trim(),
  );
};
