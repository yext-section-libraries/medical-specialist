import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  AnalyticsScopeProvider,
  Address,
  HoursTable,
  Link,
} from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";

import {
  ComprehensiveCTA,
  EntityField,
  MaybeRTF,
  type ComprehensiveCTAValue,
  resolveComponentData,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  useDocument,
  type RichText,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "@yext/visual-editor";

const toThemeCss = (token?: string, fallback?: string) => {
  if (!token) return fallback;
  if (token.startsWith("[") && token.endsWith("]")) {
    return token.slice(1, -1);
  }
  if (
    token.startsWith("#") ||
    token.startsWith("rgb(") ||
    token.startsWith("rgba(") ||
    token.startsWith("hsl(") ||
    token.startsWith("hsla(") ||
    token.startsWith("oklch(") ||
    token.startsWith("oklab(")
  ) {
    return token;
  }
  switch (token) {
    case "white":
      return "#ffffff";
    case "black":
      return "#000000";
    case "palette-primary":
      return "var(--colors-palette-primary)";
    case "palette-secondary":
      return "var(--colors-palette-secondary)";
    case "palette-tertiary":
      return "var(--colors-palette-tertiary)";
    case "palette-quaternary":
      return "var(--colors-palette-quaternary)";
    case "palette-primary-light":
      return "hsl(from var(--colors-palette-primary) h s 98)";
    case "palette-secondary-light":
      return "hsl(from var(--colors-palette-secondary) h s 98)";
    case "palette-tertiary-light":
      return "hsl(from var(--colors-palette-tertiary) h s 98)";
    case "palette-quaternary-light":
      return "hsl(from var(--colors-palette-quaternary) h s 98)";
    case "palette-primary-dark":
      return "hsl(from var(--colors-palette-primary) h s 20)";
    case "palette-secondary-dark":
      return "hsl(from var(--colors-palette-secondary) h s 20)";
    default:
      return `var(--colors-${token}, ${fallback ?? "transparent"})`;
  }
};

const getThemeToken = (color?: ThemeColor | string, fallbackToken?: string) => {
  if (typeof color === "string") {
    const token = color.trim();
    return !token || token.toLowerCase() === "default" ? fallbackToken : token;
  }

  if (!color || typeof color !== "object") {
    return fallbackToken;
  }

  const token =
    typeof color.selectedColor === "string" ? color.selectedColor.trim() : "";
  return !token || token.toLowerCase() === "default" ? fallbackToken : token;
};

const getReadableSectionForeground = (backgroundColor?: ThemeColor) => {
  const token =
    typeof backgroundColor?.contrastingColor === "string"
      ? backgroundColor.contrastingColor
      : undefined;

  return getThemeToken(token, "palette-quaternary");
};

const getTextColorCss = (
  color?: ThemeColor | string,
  fallbackToken?: string,
  fallbackCss?: string,
) => {
  const token = getThemeToken(color, fallbackToken);
  const resolvedFallback = fallbackToken
    ? toThemeCss(fallbackToken, fallbackCss)
    : fallbackCss;
  return toThemeCss(token, resolvedFallback);
};

const getRichTextStyleOverrides = (
  value: StyledTextValue,
  color?: ThemeColor | string,
  fallbackColorToken?: string,
) => ({
  fontFamily: pxOrUndefined(value.fontFamily),
  fontSize: pxOrUndefined(value.fontSize),
  fontWeight: pxOrUndefined(value.fontWeight),
  fontStyle: value.fontStyle === "default" ? undefined : value.fontStyle,
  textTransform:
    value.textTransform === "default" ? undefined : value.textTransform,
  color: color ?? fallbackColorToken,
});

const pxOrUndefined = (value?: string) =>
  !value || value === "default" ? undefined : value;

const getPreferredBlackOrWhite = (color?: ThemeColor | string) => {
  if (!color || typeof color === "string") {
    return undefined;
  }

  const token =
    typeof color.contrastingColor === "string"
      ? color.contrastingColor.trim().toLowerCase()
      : "";

  if (token === "black") {
    return "#000000";
  }

  if (token === "white") {
    return "#ffffff";
  }

  return undefined;
};

const getContrastTextColor = (color?: ThemeColor | string) => {
  const preferredColor = getPreferredBlackOrWhite(color);
  if (preferredColor) {
    return preferredColor;
  }
  return "#ffffff";
};

const isRichText = (value: unknown): value is RichText =>
  typeof value === "object" &&
  value !== null &&
  ("html" in value || "json" in value);

type StyledTextBlock = {
  text: YextEntityField<TranslatableString | any>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type TextBlock = {
  text: YextEntityField<TranslatableString | any>;
};

type StyledRtfBlock = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type CoreLink = {
  cta: {
    data?: ComprehensiveCTAValue["data"];
    styles?: ComprehensiveCTAValue["styles"];
    className?: string;
    eventName?: string;
  };
};

type PhoneItem = {
  number: YextEntityField<string>;
  label?: string;
};

type MedicalSpecialistCoreInfoProps = {
  section: {
    backgroundColor: ThemeColor;
    accentColor?: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  heading: StyledTextBlock;
  visitCardTitle: TextBlock;
  hoursCardTitle: TextBlock;
  detailsCardTitle: TextBlock;
  visitAddress: {
    address: YextEntityField<any>;
    showRegion: boolean;
    showCountry: boolean;
  };
  visitPhones: {
    items: PhoneItem[];
    phoneFormat: "international" | "domestic";
    includeHyperlink?: boolean;
  };
  cardTitleStyles: StyledTextValue;
  cardTitleColor?: ThemeColor;
  bodyStyles: StyledTextValue;
  visitLinks: CoreLink[];
  details: StyledRtfBlock;
  hours: YextEntityField<any>;
  hoursStyles: {
    startOfWeek: string;
    collapseDays: boolean;
    showAdditionalHoursText: boolean;
    alignment: "items-start" | "items-center" | "items-end";
    textStyles: StyledTextValue;
  };
};

const getTextStyle = (
  value: StyledTextValue,
  color: ThemeColor | string | undefined,
  fallbackFamily: string,
  fallbackColorToken?: string,
): React.CSSProperties => ({
  fontFamily:
    value.fontFamily === "default" ? fallbackFamily : value.fontFamily,
  fontSize: pxOrUndefined(value.fontSize),
  fontWeight: pxOrUndefined(value.fontWeight),
  fontStyle: value.fontStyle === "default" ? undefined : value.fontStyle,
  textTransform:
    value.textTransform === "default" ? undefined : value.textTransform,
  color: getTextColorCss(color, fallbackColorToken),
});

const getButtonStyle = (
  value: CoreLink["cta"],
  fallbackTextColor?: string,
): React.CSSProperties => {
  const buttonStyles = value.styles?.button;
  const buttonColor = value.styles?.color;
  const variant = value.styles?.variant ?? "primary";
  const accentToken = getThemeToken(buttonColor);
  const accentColor = accentToken ? toThemeCss(accentToken) : undefined;
  const isLinkVariant = variant === "link";
  const accentTextColor = getTextColorCss(
    buttonColor,
    undefined,
    fallbackTextColor,
  );
  const textColor =
    variant === "primary" ? getContrastTextColor(buttonColor) : accentTextColor;

  const style: React.CSSProperties = {
    fontFamily:
      buttonStyles?.fontFamily === "default" || !buttonStyles?.fontFamily
        ? '"Manrope", Inter, sans-serif'
        : buttonStyles.fontFamily,
    fontSize: pxOrUndefined(buttonStyles?.fontSize) ?? "16px",
    fontWeight: pxOrUndefined(buttonStyles?.fontWeight) ?? "700",
    fontStyle:
      buttonStyles?.fontStyle === "default"
        ? undefined
        : buttonStyles?.fontStyle,
    textTransform:
      buttonStyles?.textTransform === "default"
        ? undefined
        : buttonStyles?.textTransform,
    letterSpacing: pxOrUndefined(buttonStyles?.letterSpacing) ?? "-0.02em",
    borderRadius: pxOrUndefined(buttonStyles?.borderRadius) ?? "6px",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35em",
    whiteSpace: "nowrap",
  };

  if (textColor) {
    style.color = textColor;
  }

  if (isLinkVariant) {
    style.backgroundColor = "transparent";
    style.border = "none";
  } else if (accentColor) {
    style.border = `1px solid ${accentColor}`;
    if (variant === "primary") {
      style.backgroundColor = accentColor;
    } else {
      style.backgroundColor = "transparent";
    }
  }

  return style;
};

const isLinkVariantCta = (value: CoreLink["cta"]) =>
  value.data?.actionType === "button" && value.styles?.variant === "link";

const getCoreLinkSummary = (item: CoreLink | undefined, index?: number) => {
  const constantValue = item?.cta?.data?.cta?.constantValue;
  const label =
    item?.cta?.data?.actionType === "button"
      ? item?.cta?.data?.buttonText
      : constantValue?.label;

  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }
  if (label && typeof label === "object") {
    if ("text" in (label as Record<string, unknown>)) {
      const text = (label as Record<string, unknown>).text;
      if (typeof text === "string" || typeof text === "number") {
        return String(text);
      }
    }
    if ("defaultValue" in (label as Record<string, unknown>)) {
      const defaultValue = (label as Record<string, unknown>).defaultValue;
      if (
        typeof defaultValue === "string" ||
        typeof defaultValue === "number"
      ) {
        return String(defaultValue);
      }
    }
  }
  return `Visit Link ${(index ?? 0) + 1}`;
};

const VisitIcon = () => (
  <svg viewBox="0 0 256 256" aria-hidden="true">
    <g fill="currentColor">
      <path
        d="M63.81,192.19c-47.89-79.81,16-159.62,151.64-151.64C223.43,176.23,143.62,240.08,63.81,192.19Z"
        opacity="0.2"
      />
      <path d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z" />
    </g>
  </svg>
);

const AccessibilityIcon = () => (
  <svg viewBox="0 0 256 256" aria-hidden="true">
    <g fill="currentColor">
      <path
        d="M40,96H88V208H32V104A8,8,0,0,1,40,96Zm176,40H168v72h56V144A8,8,0,0,0,216,136Z"
        opacity="0.2"
      />
      <path d="M112.41,102.53a8,8,0,0,1,5.06-10.12l12-4A8,8,0,0,1,140,96v40a8,8,0,0,1-16,0V107.1l-1.47.49A8,8,0,0,1,112.41,102.53ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16h8V104A16,16,0,0,1,40,88H80V56A16,16,0,0,1,96,40h64a16,16,0,0,1,16,16v72h40a16,16,0,0,1,16,16v56h8A8,8,0,0,1,248,208Zm-72-64v56h40V144ZM96,200h64V56H96Zm-56,0H80V104H40Z" />
    </g>
  </svg>
);

const HoursIcon = () => (
  <svg viewBox="0 0 256 256" aria-hidden="true">
    <g fill="currentColor">
      <path
        d="M240,124a48,48,0,0,1-32,45.27h0V176a40,40,0,0,1-80,0,40,40,0,0,1-80,0v-6.73h0a48,48,0,0,1,0-90.54V72a40,40,0,0,1,80,0,40,40,0,0,1,80,0v6.73A48,48,0,0,1,240,124Z"
        opacity="0.2"
      />
      <path d="M248,124a56.11,56.11,0,0,0-32-50.61V72a48,48,0,0,0-88-26.49A48,48,0,0,0,40,72v1.39a56,56,0,0,0,0,101.2V176a48,48,0,0,0,88,26.49A48,48,0,0,0,216,176v-1.41A56.09,56.09,0,0,0,248,124ZM88,208a32,32,0,0,1-31.81-28.56A55.87,55.87,0,0,0,64,180h8a8,8,0,0,0,0-16H64A40,40,0,0,1,50.67,86.27,8,8,0,0,0,56,78.73V72a32,32,0,0,1,64,0v68.26A47.8,47.8,0,0,0,88,128a8,8,0,0,0,0,16,32,32,0,0,1,0,64Zm104-44h-8a8,8,0,0,0,0,16h8a55.87,55.87,0,0,0,7.81-.56A32,32,0,1,1,168,144a8,8,0,0,0,0-16,47.8,47.8,0,0,0-32,12.26V72a32,32,0,0,1,64,0v6.73a8,8,0,0,0,5.33,7.54A40,40,0,0,1,192,164Zm16-52a8,8,0,0,1-8,8h-4a36,36,0,0,1-36-36V80a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4A8,8,0,0,1,208,112ZM60,120H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,84V80a8,8,0,0,1,16,0v4A36,36,0,0,1,60,120Z" />
    </g>
  </svg>
);

const styles = `
p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.medical-specialist-core-info {
  position: relative;
  overflow: hidden;
}

.medical-specialist-core-info::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.28;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20px 20px, rgba(38, 14, 1, 0.035) 0 2px, transparent 2px),
    radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.38) 0 1px, transparent 1px),
    linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0));
  background-size: 36px 36px, 18px 18px, 100% 100%;
  background-position: left top, left top, center;
}

.medical-specialist-core-info__inner {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 32px;
}

.medical-specialist-core-info__intro {
  display: grid;
  gap: 16px;
  justify-items: center;
}

.medical-specialist-core-info__heading {
  margin: 0;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-core-info__supporting {
  margin: 0;
  max-width: 760px;
  text-align: center;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

.medical-specialist-core-info__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.medical-specialist-core-info__card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}

.medical-specialist-core-info__icon {
  width: 52px;
  height: 52px;
  color: currentColor;
  flex-shrink: 0;
}

.medical-specialist-core-info__card-copy {
  display: grid;
  gap: 12px;
  width: 100%;
}

.medical-specialist-core-info__card-header {
  display: grid;
  gap: 10px;
  justify-items: center;
  text-align: center;
}

.medical-specialist-core-info__title {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-core-info__title-accent {
  width: 72px;
  height: 10px;
  border-radius: 999px;
  background: currentColor;
  transform: skewX(20deg) skewY(-2deg);
}

.medical-specialist-core-info__body {
  color: rgba(38, 14, 1, 0.7);
}

.medical-specialist-core-info__body,
.medical-specialist-core-info__body li {
  margin: 0;
  line-height: 1.95;
  letter-spacing: -0.02em;
}

.medical-specialist-core-info__details .rtf-wrapper,
.medical-specialist-core-info__details .rtf-wrapper p,
.medical-specialist-core-info__details .rtf-wrapper li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.medical-specialist-core-info__visit-lines {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.medical-specialist-core-info__visit-address,
.medical-specialist-core-info__visit-phone {
  margin: 0;
}

.medical-specialist-core-info__visit-phone-label {
  font-weight: 500;
}

.medical-specialist-core-info__visit-link {
  display: inline-block;
  margin: 8px 0 14px;
  text-decoration: underline;
  text-underline-offset: 0.16em;
  width: fit-content;
  max-width: 100%;
}

.medical-specialist-core-info__visit-button {
  display: inline-block;
  margin: 8px 0 14px;
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
}

.medical-specialist-core-info__visit-button--link,
.medical-specialist-core-info__visit-button--link > *,
.medical-specialist-core-info__visit-button--link > * > * {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 0.35em;
  width: auto !important;
  max-width: 100%;
  white-space: nowrap;
  vertical-align: middle;
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.medical-specialist-core-info__visit-button--link svg {
  flex-shrink: 0;
}

.medical-specialist-core-info__visit-link:hover,
.medical-specialist-core-info__visit-link:focus-visible,
.medical-specialist-core-info__visit-button--link:hover,
.medical-specialist-core-info__visit-button--link:focus-visible,
.medical-specialist-core-info__visit-button--link:hover > *,
.medical-specialist-core-info__visit-button--link:focus-visible > *,
.medical-specialist-core-info__visit-button--link:hover > * > *,
.medical-specialist-core-info__visit-button--link:focus-visible > * > * {
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.medical-specialist-core-info__visit-button:hover,
.medical-specialist-core-info__visit-button:focus-visible {
  opacity: 0.82;
}

.medical-specialist-core-info__visit-button:not(.medical-specialist-core-info__visit-button--link):hover,
.medical-specialist-core-info__visit-button:not(.medical-specialist-core-info__visit-button--link):focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.medical-specialist-core-info__detail-list {
  margin: 0;
  padding-left: 18px;
  text-align: left;
  list-style: disc;
}

.medical-specialist-core-info__detail-list li {
  margin: 0 0 8px;
}

.medical-specialist-core-info__detail-list li:last-child {
  margin-bottom: 0;
}

.medical-specialist-core-info__hours {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.medical-specialist-core-info__hours-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.medical-specialist-core-info__hours-day {
  white-space: nowrap;
}

.medical-specialist-core-info__hours-time {
  text-align: right;
  white-space: nowrap;
  margin-left: auto;
}

.medical-specialist-core-info__hours-row.is-today .medical-specialist-core-info__hours-day,
.medical-specialist-core-info__hours-row.is-today .medical-specialist-core-info__hours-time {
  color: var(--medical-specialist-core-info-foreground, inherit);
  font-weight: 700;
}

@media (max-width: 1199px) {
  .medical-specialist-core-info__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 809px) {
  .medical-specialist-core-info__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-core-info__title {
    font-size: 22px !important;
    line-height: 1.12 !important;
  }

  .medical-specialist-core-info__grid {
    grid-template-columns: 1fr;
  }

  .medical-specialist-core-info__body,
  .medical-specialist-core-info__body li,
  .medical-specialist-core-info__hours {
    font-size: 16px;
    line-height: 1.65;
  }

  .medical-specialist-core-info__hours {
    text-align: center;
  }

  .medical-specialist-core-info__hours-row {
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .medical-specialist-core-info__hours-day,
  .medical-specialist-core-info__hours-time {
    white-space: normal;
    text-align: center;
    width: 100%;
  }

  .medical-specialist-core-info__hours-time {
    margin-left: 0;
  }
}
`;

const MedicalSpecialistCoreInfoComponent = (
  props: MedicalSpecialistCoreInfoProps & { id: string; puck: any },
) => {
  const streamDocument = useDocument<Record<string, unknown>>();
  const streamData = streamDocument as Record<string, unknown>;
  const locale =
    typeof streamData.meta === "object" &&
    streamData.meta &&
    typeof (streamData.meta as { locale?: unknown }).locale === "string"
      ? String((streamData.meta as { locale?: unknown }).locale)
      : typeof streamData.locale === "string"
        ? streamData.locale
        : "en";
  const headingText = (() => {
    const resolvedValue = resolveComponentData(
      props.heading.text as any,
      locale,
      streamDocument,
    );
    const constantValue = props.heading.text?.constantValue;
    const constantRecord =
      constantValue && typeof constantValue === "object"
        ? (constantValue as Record<string, unknown>)
        : undefined;
    const fallback =
      typeof constantValue === "string" || typeof constantValue === "number"
        ? String(constantValue)
        : typeof constantRecord?.text === "string"
          ? constantRecord.text
          : typeof constantRecord?.text === "number"
            ? String(constantRecord.text)
            : typeof constantRecord?.defaultValue === "string"
              ? constantRecord.defaultValue
              : typeof constantRecord?.defaultValue === "number"
                ? String(constantRecord.defaultValue)
                : "";
    const resolvedRecord =
      resolvedValue && typeof resolvedValue === "object"
        ? (resolvedValue as Record<string, unknown>)
        : undefined;
    return (
      typeof resolvedValue === "string" || typeof resolvedValue === "number"
        ? String(resolvedValue)
        : typeof resolvedRecord?.text === "string"
          ? resolvedRecord.text
          : typeof resolvedRecord?.text === "number"
            ? String(resolvedRecord.text)
            : typeof resolvedRecord?.defaultValue === "string"
              ? resolvedRecord.defaultValue
              : typeof resolvedRecord?.defaultValue === "number"
                ? String(resolvedRecord.defaultValue)
                : fallback
    ).trim();
  })();
  const visitCardTitle = (() => {
    const resolvedValue = resolveComponentData(
      props.visitCardTitle.text as any,
      locale,
      streamDocument,
    );
    const constantValue = props.visitCardTitle.text?.constantValue;
    const constantRecord =
      constantValue && typeof constantValue === "object"
        ? (constantValue as Record<string, unknown>)
        : undefined;
    const fallback =
      typeof constantValue === "string" || typeof constantValue === "number"
        ? String(constantValue)
        : typeof constantRecord?.text === "string"
          ? constantRecord.text
          : typeof constantRecord?.text === "number"
            ? String(constantRecord.text)
            : typeof constantRecord?.defaultValue === "string"
              ? constantRecord.defaultValue
              : typeof constantRecord?.defaultValue === "number"
                ? String(constantRecord.defaultValue)
                : "Visit Us";
    const resolvedRecord =
      resolvedValue && typeof resolvedValue === "object"
        ? (resolvedValue as Record<string, unknown>)
        : undefined;
    return (
      typeof resolvedValue === "string" || typeof resolvedValue === "number"
        ? String(resolvedValue)
        : typeof resolvedRecord?.text === "string"
          ? resolvedRecord.text
          : typeof resolvedRecord?.text === "number"
            ? String(resolvedRecord.text)
            : typeof resolvedRecord?.defaultValue === "string"
              ? resolvedRecord.defaultValue
              : typeof resolvedRecord?.defaultValue === "number"
                ? String(resolvedRecord.defaultValue)
                : fallback
    ).trim();
  })();
  const hoursCardTitle = (() => {
    const resolvedValue = resolveComponentData(
      props.hoursCardTitle.text as any,
      locale,
      streamDocument,
    );
    const constantValue = props.hoursCardTitle.text?.constantValue;
    const constantRecord =
      constantValue && typeof constantValue === "object"
        ? (constantValue as Record<string, unknown>)
        : undefined;
    const fallback =
      typeof constantValue === "string" || typeof constantValue === "number"
        ? String(constantValue)
        : typeof constantRecord?.text === "string"
          ? constantRecord.text
          : typeof constantRecord?.text === "number"
            ? String(constantRecord.text)
            : typeof constantRecord?.defaultValue === "string"
              ? constantRecord.defaultValue
              : typeof constantRecord?.defaultValue === "number"
                ? String(constantRecord.defaultValue)
                : "Opening Hours";
    const resolvedRecord =
      resolvedValue && typeof resolvedValue === "object"
        ? (resolvedValue as Record<string, unknown>)
        : undefined;
    return (
      typeof resolvedValue === "string" || typeof resolvedValue === "number"
        ? String(resolvedValue)
        : typeof resolvedRecord?.text === "string"
          ? resolvedRecord.text
          : typeof resolvedRecord?.text === "number"
            ? String(resolvedRecord.text)
            : typeof resolvedRecord?.defaultValue === "string"
              ? resolvedRecord.defaultValue
              : typeof resolvedRecord?.defaultValue === "number"
                ? String(resolvedRecord.defaultValue)
                : fallback
    ).trim();
  })();
  const detailsCardTitle = (() => {
    const resolvedValue = resolveComponentData(
      props.detailsCardTitle.text as any,
      locale,
      streamDocument,
    );
    const constantValue = props.detailsCardTitle.text?.constantValue;
    const constantRecord =
      constantValue && typeof constantValue === "object"
        ? (constantValue as Record<string, unknown>)
        : undefined;
    const fallback =
      typeof constantValue === "string" || typeof constantValue === "number"
        ? String(constantValue)
        : typeof constantRecord?.text === "string"
          ? constantRecord.text
          : typeof constantRecord?.text === "number"
            ? String(constantRecord.text)
            : typeof constantRecord?.defaultValue === "string"
              ? constantRecord.defaultValue
              : typeof constantRecord?.defaultValue === "number"
                ? String(constantRecord.defaultValue)
                : "Accessibility";
    const resolvedRecord =
      resolvedValue && typeof resolvedValue === "object"
        ? (resolvedValue as Record<string, unknown>)
        : undefined;
    return (
      typeof resolvedValue === "string" || typeof resolvedValue === "number"
        ? String(resolvedValue)
        : typeof resolvedRecord?.text === "string"
          ? resolvedRecord.text
          : typeof resolvedRecord?.text === "number"
            ? String(resolvedRecord.text)
            : typeof resolvedRecord?.defaultValue === "string"
              ? resolvedRecord.defaultValue
              : typeof resolvedRecord?.defaultValue === "number"
                ? String(resolvedRecord.defaultValue)
                : fallback
    ).trim();
  })();
  const address = (() => {
    const resolvedValue = resolveComponentData(
      props.visitAddress.address as any,
      locale,
      streamDocument,
    );
    return (
      resolvedValue ??
      props.visitAddress.address.constantValue ?? {
        line1: "",
        city: "",
        postalCode: "",
        countryCode: "",
        region: "",
      }
    );
  })();
  const resolvedPhoneItems = (props.visitPhones.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number as any,
        locale,
        streamDocument,
      );
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      if (!normalizedNumber) {
        return null;
      }
      const cleanedPhoneNumberString = normalizedNumber.replace(
        /(?!^\+)\+|[^\d+]/g,
        "",
      );
      const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);
      const formattedNumber =
        !parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined
          ? normalizedNumber
          : props.visitPhones.phoneFormat === "international"
            ? parsedPhoneNumber.number.international
            : parsedPhoneNumber.number.national;
      return {
        entityField: item.number,
        label: item.label?.trim() ?? "",
        formattedNumber,
        telDigits: normalizedNumber.replace(/\D/g, ""),
      };
    })
    .filter(
      (
        item,
      ): item is {
        entityField: YextEntityField<string>;
        label: string;
        formattedNumber: string;
        telDigits: string;
      } => item !== null,
    );
  const resolvedHours =
    resolveComponentData(props.hours as any, locale, streamDocument) ??
    props.hours.constantValue ??
    {};
  const detailsStyleOverrides = getRichTextStyleOverrides(
    props.details.styles,
    props.details.fontColor,
    getReadableSectionForeground(props.section.backgroundColor),
  );
  const resolvedDetails =
    resolveComponentData(props.details.text as any, locale, streamDocument, {
      richTextStyleOverrides: detailsStyleOverrides,
    }) ?? props.details.text.constantValue;
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const accentColor = getTextColorCss(props.section.accentColor);
  const visitLinks = props.visitLinks ?? [];
  const leadingVisitLink = visitLinks[0];
  const secondaryVisitLink = visitLinks[1];
  const remainingVisitLinks = visitLinks.slice(2);
  const showIntro = Boolean(headingText);

  const bodyTextStyle = getTextStyle(
    props.bodyStyles,
    undefined,
    "'Krub', 'Krub Fallback', sans-serif",
    sectionForeground,
  );
  const bodyTextColor = getTextColorCss(undefined, sectionForeground);

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistCoreInfo${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{styles}</style>
        <section
          className="medical-specialist-core-info"
          style={{
            ["--medical-specialist-core-info-foreground" as string]:
              bodyTextColor,
            backgroundColor: toThemeCss(
              props.section.backgroundColor?.selectedColor,
              "#fdf7f4",
            ),
            padding: `${verticalPadding} 40px`,
          }}
        >
          <div
            className="medical-specialist-core-info__inner"
            style={{ maxWidth: sectionWidth }}
          >
            {showIntro ? (
              <div className="medical-specialist-core-info__intro">
                {headingText ? (
                  <EntityField
                    displayName="Heading"
                    fieldId={props.heading.text.field}
                    constantValueEnabled={
                      props.heading.text.constantValueEnabled
                    }
                  >
                    <h2
                      className="medical-specialist-core-info__heading"
                      style={getTextStyle(
                        props.heading.styles,
                        props.heading.fontColor,
                        '"Manrope", Inter, sans-serif',
                        sectionForeground,
                      )}
                    >
                      {headingText}
                    </h2>
                  </EntityField>
                ) : null}
              </div>
            ) : null}

            <div className="medical-specialist-core-info__grid">
              <article className="medical-specialist-core-info__card">
                <div
                  className="medical-specialist-core-info__icon"
                  style={{ color: accentColor }}
                >
                  <VisitIcon />
                </div>
                <div className="medical-specialist-core-info__card-copy">
                  <div className="medical-specialist-core-info__card-header">
                    <EntityField
                      displayName="Visit Card Title"
                      fieldId={props.visitCardTitle.text.field}
                      constantValueEnabled={
                        props.visitCardTitle.text.constantValueEnabled
                      }
                    >
                      <h3
                        className="medical-specialist-core-info__title"
                        style={getTextStyle(
                          props.cardTitleStyles,
                          props.cardTitleColor,
                          '"Manrope", Inter, sans-serif',
                          sectionForeground,
                        )}
                      >
                        {visitCardTitle}
                      </h3>
                    </EntityField>
                    <div
                      className="medical-specialist-core-info__title-accent"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <div
                    className="medical-specialist-core-info__body medical-specialist-core-info__visit-lines"
                    style={bodyTextStyle}
                  >
                    <EntityField
                      displayName="Visit Address"
                      fieldId={props.visitAddress.address.field}
                      constantValueEnabled={
                        props.visitAddress.address.constantValueEnabled
                      }
                    >
                      <Address
                        address={address as any}
                        showRegion={props.visitAddress.showRegion}
                        showCountry={props.visitAddress.showCountry}
                      />
                    </EntityField>
                    {leadingVisitLink ? (
                      <EntityField
                        displayName="Visit CTA"
                        fieldId={leadingVisitLink.cta.data?.cta.field}
                        constantValueEnabled={
                          leadingVisitLink.cta.data?.cta.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          className={
                            leadingVisitLink.cta.data?.actionType === "button"
                              ? `medical-specialist-core-info__visit-button${
                                  isLinkVariantCta(leadingVisitLink.cta)
                                    ? " medical-specialist-core-info__visit-button--link"
                                    : ""
                                }`
                              : "medical-specialist-core-info__visit-link"
                          }
                          value={
                            leadingVisitLink.cta as Partial<ComprehensiveCTAValue>
                          }
                          eventName="visitLink0"
                          target={
                            leadingVisitLink.cta.data?.openInNewTab
                              ? "_blank"
                              : props.puck.isEditing
                                ? undefined
                                : "_top"
                          }
                          style={
                            leadingVisitLink.cta.data?.actionType === "button"
                              ? getButtonStyle(
                                  leadingVisitLink.cta,
                                  bodyTextColor,
                                )
                              : {
                                  color: getTextColorCss(
                                    leadingVisitLink.cta.styles?.color,
                                    undefined,
                                    bodyTextColor,
                                  ),
                                }
                          }
                        />
                      </EntityField>
                    ) : null}
                    {resolvedPhoneItems.map((item, index) => (
                      <EntityField
                        key={`${item.formattedNumber}-${index}`}
                        displayName="Visit Phone"
                        fieldId={item.entityField.field}
                        constantValueEnabled={
                          item.entityField.constantValueEnabled
                        }
                      >
                        {props.visitPhones.includeHyperlink !== false ? (
                          <Link
                            className="medical-specialist-core-info__visit-link"
                            cta={{ link: item.telDigits, linkType: "PHONE" }}
                            eventName={`visitPhone${index}`}
                            style={{ color: bodyTextColor }}
                          >
                            {item.label
                              ? `${item.label} ${item.formattedNumber}`
                              : item.formattedNumber}
                          </Link>
                        ) : (
                          <p className="medical-specialist-core-info__visit-phone">
                            {item.label
                              ? `${item.label} ${item.formattedNumber}`
                              : item.formattedNumber}
                          </p>
                        )}
                      </EntityField>
                    ))}
                    {secondaryVisitLink ? (
                      <EntityField
                        displayName="Visit CTA"
                        fieldId={secondaryVisitLink.cta.data?.cta.field}
                        constantValueEnabled={
                          secondaryVisitLink.cta.data?.cta.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          className={
                            secondaryVisitLink.cta.data?.actionType === "button"
                              ? `medical-specialist-core-info__visit-button${
                                  isLinkVariantCta(secondaryVisitLink.cta)
                                    ? " medical-specialist-core-info__visit-button--link"
                                    : ""
                                }`
                              : "medical-specialist-core-info__visit-link"
                          }
                          value={
                            secondaryVisitLink.cta as Partial<ComprehensiveCTAValue>
                          }
                          eventName="visitLink1"
                          target={
                            secondaryVisitLink.cta.data?.openInNewTab
                              ? "_blank"
                              : props.puck.isEditing
                                ? undefined
                                : "_top"
                          }
                          style={
                            secondaryVisitLink.cta.data?.actionType === "button"
                              ? getButtonStyle(
                                  secondaryVisitLink.cta,
                                  bodyTextColor,
                                )
                              : {
                                  color: getTextColorCss(
                                    secondaryVisitLink.cta.styles?.color,
                                    undefined,
                                    bodyTextColor,
                                  ),
                                }
                          }
                        />
                      </EntityField>
                    ) : null}
                    {remainingVisitLinks.map((item, index) => {
                      const eventIndex = index + 2;
                      const label = getCoreLinkSummary(item, eventIndex);

                      return (
                        <EntityField
                          key={`${label}-${eventIndex}`}
                          displayName="Visit CTA"
                          fieldId={item.cta.data?.cta.field}
                          constantValueEnabled={
                            item.cta.data?.cta.constantValueEnabled
                          }
                        >
                          <ComprehensiveCTA
                            className={
                              item.cta.data?.actionType === "button"
                                ? `medical-specialist-core-info__visit-button${
                                    isLinkVariantCta(item.cta)
                                      ? " medical-specialist-core-info__visit-button--link"
                                      : ""
                                  }`
                                : "medical-specialist-core-info__visit-link"
                            }
                            value={item.cta as Partial<ComprehensiveCTAValue>}
                            eventName={`visitLink${eventIndex}`}
                            target={
                              item.cta.data?.openInNewTab
                                ? "_blank"
                                : props.puck.isEditing
                                  ? undefined
                                  : "_top"
                            }
                            style={
                              item.cta.data?.actionType === "button"
                                ? getButtonStyle(item.cta, bodyTextColor)
                                : {
                                    color: getTextColorCss(
                                      item.cta.styles?.color,
                                      undefined,
                                      bodyTextColor,
                                    ),
                                  }
                            }
                          />
                        </EntityField>
                      );
                    })}
                  </div>
                </div>
              </article>

              <article className="medical-specialist-core-info__card">
                <div
                  className="medical-specialist-core-info__icon"
                  style={{ color: accentColor }}
                >
                  <AccessibilityIcon />
                </div>
                <div className="medical-specialist-core-info__card-copy">
                  <div className="medical-specialist-core-info__card-header">
                    <EntityField
                      displayName="Details Card Title"
                      fieldId={props.detailsCardTitle.text.field}
                      constantValueEnabled={
                        props.detailsCardTitle.text.constantValueEnabled
                      }
                    >
                      <h3
                        className="medical-specialist-core-info__title"
                        style={getTextStyle(
                          props.cardTitleStyles,
                          props.cardTitleColor,
                          '"Manrope", Inter, sans-serif',
                          sectionForeground,
                        )}
                      >
                        {detailsCardTitle}
                      </h3>
                    </EntityField>
                    <div
                      className="medical-specialist-core-info__title-accent"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <EntityField
                    displayName="Details"
                    fieldId={props.details.text.field}
                    constantValueEnabled={
                      props.details.text.constantValueEnabled
                    }
                  >
                    <div
                      className="medical-specialist-core-info__body medical-specialist-core-info__details"
                      style={getTextStyle(
                        props.details.styles,
                        props.details.fontColor,
                        "var(--fontFamily-body-fontFamily)",
                        sectionForeground,
                      )}
                    >
                      {React.isValidElement(resolvedDetails) ? (
                        resolvedDetails
                      ) : (
                        <MaybeRTF
                          data={
                            typeof resolvedDetails === "string" ||
                            isRichText(resolvedDetails)
                              ? resolvedDetails
                              : undefined
                          }
                          richTextStyleOverrides={detailsStyleOverrides}
                        />
                      )}
                    </div>
                  </EntityField>
                </div>
              </article>

              <article className="medical-specialist-core-info__card">
                <div
                  className="medical-specialist-core-info__icon"
                  style={{ color: accentColor }}
                >
                  <HoursIcon />
                </div>
                <div className="medical-specialist-core-info__card-copy">
                  <div className="medical-specialist-core-info__card-header">
                    <EntityField
                      displayName="Hours Card Title"
                      fieldId={props.hoursCardTitle.text.field}
                      constantValueEnabled={
                        props.hoursCardTitle.text.constantValueEnabled
                      }
                    >
                      <h3
                        className="medical-specialist-core-info__title"
                        style={getTextStyle(
                          props.cardTitleStyles,
                          props.cardTitleColor,
                          '"Manrope", Inter, sans-serif',
                          sectionForeground,
                        )}
                      >
                        {hoursCardTitle}
                      </h3>
                    </EntityField>
                    <div
                      className="medical-specialist-core-info__title-accent"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <div
                    className="medical-specialist-core-info__body"
                    style={bodyTextStyle}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          props.hoursStyles.alignment === "items-center"
                            ? "center"
                            : props.hoursStyles.alignment === "items-end"
                              ? "flex-end"
                              : "flex-start",
                        fontFamily:
                          props.hoursStyles.textStyles.fontFamily === "default"
                            ? "var(--fontFamily-body-fontFamily)"
                            : props.hoursStyles.textStyles.fontFamily,
                        fontSize:
                          props.hoursStyles.textStyles.fontSize === "default"
                            ? "var(--fontSize-body-fontSize)"
                            : props.hoursStyles.textStyles.fontSize,
                        fontWeight:
                          props.hoursStyles.textStyles.fontWeight === "default"
                            ? "var(--fontWeight-body-fontWeight)"
                            : props.hoursStyles.textStyles.fontWeight,
                        fontStyle:
                          props.hoursStyles.textStyles.fontStyle === "default"
                            ? "var(--fontStyle-body-fontStyle)"
                            : props.hoursStyles.textStyles.fontStyle,
                        textTransform:
                          props.hoursStyles.textStyles.textTransform ===
                          "default"
                            ? "var(--textTransform-body-textTransform)"
                            : props.hoursStyles.textStyles.textTransform,
                      }}
                    >
                      <EntityField
                        displayName="Hours"
                        fieldId={props.hours.field}
                        constantValueEnabled={props.hours.constantValueEnabled}
                      >
                        <HoursTable
                          hours={resolvedHours as any}
                          comingSoon={Boolean(
                            (streamDocument as any)?.comingSoon,
                          )}
                          startOfWeek={props.hoursStyles.startOfWeek as any}
                          collapseDays={props.hoursStyles.collapseDays}
                        />
                      </EntityField>
                      {props.hoursStyles.showAdditionalHoursText &&
                      typeof (streamDocument as any)?.additionalHoursText ===
                        "string" &&
                      (streamDocument as any).additionalHoursText.trim() ? (
                        <p style={{ margin: "16px 0 0" }}>
                          {(streamDocument as any).additionalHoursText.trim()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistCoreInfo: YextComponentConfig<MedicalSpecialistCoreInfoProps> =
  {
    label: "Core Info",
    fields: {
      section: {
        label: "Section",
        type: "object",
        objectFields: {
          backgroundColor: {
            label: "Background Fill",
            type: "basicSelector",
            options: "BACKGROUND_COLOR",
          },
          accentColor: {
            label: "Accent Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          visibleOnLivePage: {
            label: "Visible on Live Page",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          styles: { label: "Section Styles", type: "styledPageSection" },
        },
      },
      heading: {
        label: "Heading",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
              includeListsOnly: false,
            },
          },
          fontColor: {
            label: "Text Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          styles: { label: "Text Styles", type: "styledText" },
        },
      },
      visitCardTitle: {
        label: "Visit Card Title",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
              includeListsOnly: false,
            },
          },
        },
      },
      hoursCardTitle: {
        label: "Hours Card Title",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
              includeListsOnly: false,
            },
          },
        },
      },
      detailsCardTitle: {
        label: "Details Card Title",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
              includeListsOnly: false,
            },
          },
        },
      },
      visitAddress: {
        label: "Visit Address",
        type: "object",
        objectFields: {
          address: {
            type: "entityField",
            label: "Address",
            filter: {
              types: ["type.address"],
            },
          },
          showRegion: {
            label: "Show Region",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showCountry: {
            label: "Show Country",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      visitPhones: {
        label: "Visit Phones",
        type: "object",
        objectFields: {
          items: {
            label: "Items",
            type: "array",
            arrayFields: {
              number: {
                type: "entityField",
                label: "Number",
                filter: {
                  types: ["type.phone"],
                },
              },
              label: {
                label: "Label",
                type: "text",
              },
            },
            defaultItemProps: {
              number: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              } as YextEntityField<string>,
              label: "",
            },
          },
          phoneFormat: {
            label: "Phone Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      cardTitleStyles: { label: "Card Title Styles", type: "styledText" },
      cardTitleColor: {
        label: "Card Title Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      bodyStyles: { label: "Visit Styles", type: "styledText" },
      visitLinks: {
        label: "Visit Links",
        type: "array",
        arrayFields: {
          cta: {
            label: "Call to Action",
            type: "comprehensiveCTA",
          },
        },
        defaultItemProps: {
          cta: {
            data: {
              actionType: "link",
              cta: {
                field: "",
                constantValue: {
                  label: {
                    defaultValue: "Visit Link",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                  linkType: "URL",
                },
                constantValueEnabled: true,
                selectedType: "textAndLink",
              },
              openInNewTab: false,
            },
            styles: {
              variant: "link",
              color: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
              link: {
                fontFamily: "default",
                fontSize: "default",
                fontWeight: "default",
                fontStyle: "default",
                textTransform: "default",
                letterSpacing: "default",
                includeCaret: "none",
              },
            },
          },
        },
        getItemSummary: (item: CoreLink, index?: number) =>
          getCoreLinkSummary(item, index),
      },
      details: {
        label: "Details",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.rich_text_v2"],
              includeListsOnly: false,
            },
          },
          fontColor: {
            label: "Text Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          styles: { label: "Text Styles", type: "styledText" },
        },
      },
      hours: {
        label: "Hours",
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
        disableConstantValueToggle: true,
      },
      hoursStyles: {
        label: "Hours Styles",
        type: "object",
        objectFields: {
          startOfWeek: {
            label: "Start Of Week",
            type: "select",
            options: [
              { label: "Monday", value: "monday" },
              { label: "Tuesday", value: "tuesday" },
              { label: "Wednesday", value: "wednesday" },
              { label: "Thursday", value: "thursday" },
              { label: "Friday", value: "friday" },
              { label: "Saturday", value: "saturday" },
              { label: "Sunday", value: "sunday" },
              { label: "Today", value: "today" },
            ],
          },
          collapseDays: {
            label: "Collapse Days",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showAdditionalHoursText: {
            label: "Show Additional Hours Text",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          alignment: {
            label: "Alignment",
            type: "select",
            options: [
              { label: "Start", value: "items-start" },
              { label: "Center", value: "items-center" },
              { label: "End", value: "items-end" },
            ],
          },
          textStyles: { label: "Text Styles", type: "styledText" },
        },
      },
    },
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-quaternary",
          contrastingColor: "palette-quaternary-contrast",
        },
        accentColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        visibleOnLivePage: true,
        styles: {
          contentWidth: "1280px",
          verticalPadding: "16px",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "Manrope",
          fontSize: "56px",
          fontWeight: "700",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      visitCardTitle: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Visit Us",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
      },
      hoursCardTitle: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Opening Hours",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
      },
      detailsCardTitle: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Accessibility",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
      },
      visitAddress: {
        address: {
          field: "address",
          constantValue: {
            line1: "",
            city: "",
            postalCode: "",
            countryCode: "",
            region: "",
          },
          constantValueEnabled: false,
        },
        showRegion: true,
        showCountry: false,
      },
      visitPhones: {
        items: [
          {
            number: {
              field: "mainPhone",
              constantValue: "+1 (303) 555-0142",
              constantValueEnabled: false,
            },
            label: "Main Phone:",
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      cardTitleStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      cardTitleColor: undefined,
      bodyStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      visitLinks: [
        {
          cta: {
            data: {
              actionType: "link",
              cta: {
                field: "",
                constantValue: {
                  label: {
                    defaultValue: "Get Directions",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                  linkType: "URL",
                },
                constantValueEnabled: true,
                selectedType: "textAndLink",
              },
              openInNewTab: false,
            },
            styles: {
              variant: "link",
              color: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
              link: {
                fontFamily: "default",
                fontSize: "default",
                fontWeight: "default",
                fontStyle: "default",
                textTransform: "default",
                letterSpacing: "default",
                includeCaret: "none",
              },
            },
          },
        },
        {
          cta: {
            data: {
              actionType: "link",
              cta: {
                field: "",
                constantValue: {
                  label: {
                    defaultValue: "Make Appointment",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                  linkType: "URL",
                },
                constantValueEnabled: true,
                selectedType: "textAndLink",
              },
              openInNewTab: false,
            },
            styles: {
              variant: "link",
              color: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
              link: {
                fontFamily: "default",
                fontSize: "default",
                fontWeight: "default",
                fontStyle: "default",
                textTransform: "default",
                letterSpacing: "default",
                includeCaret: "none",
              },
            },
          },
        },
      ],
      details: {
        text: {
          field: "",
          constantValue: {
            defaultValue: {
              html: "<ul><li><span>Wheelchair accessible entrances</span></li><li><span>Mobility accessible routes</span></li><li><span>Elevators</span></li><li><span>Accessible restrooms</span></li><li><span>Patient drop-off</span></li></ul>",
              json: '{"root":{"children":[{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Wheelchair accessible entrances","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Mobility accessible routes","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":2,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Elevators","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":3,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Accessible restrooms","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":4,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Patient drop-off","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":5,"version":1}],"direction":"ltr","format":"","indent":0,"listType":"bullet","start":1,"tag":"ul","type":"list","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
            },
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
      hoursStyles: {
        startOfWeek: "today",
        collapseDays: false,
        showAdditionalHoursText: true,
        alignment: "items-start",
        textStyles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      },
    },
    render: (props) => <MedicalSpecialistCoreInfoComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistCoreInfo",
  displayName: "Core Info",
  description: "Core Info",
  pageSetTypes: ["ENTITY"],
};
