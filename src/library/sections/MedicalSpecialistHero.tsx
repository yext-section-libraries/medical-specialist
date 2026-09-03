import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  AnalyticsScopeProvider,
  type ComplexImageType,
  type ImageType,
} from "@yext/pages-components";

import {
  ComprehensiveCTA,
  EntityField,
  ThemeOptions,
  getAnalyticsScopeHash,
  getDefaultRTF,
  Image,
  MaybeRTF,
  resolveComponentData,
  resolveLocalizedAssetImage,
  useDocument,
  VisibilityWrapper,
  type ComprehensiveCTAValue,
  type RichText,
  type StyledImageValue,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "@yext/visual-editor";

type HeroImageValue = ImageType | ComplexImageType | TranslatableAssetImage;

const hasImageUrl = (image: unknown): boolean => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const imageRecord = image as Record<string, unknown>;
  if (
    typeof imageRecord.url === "string" &&
    imageRecord.url.trim().length > 0
  ) {
    return true;
  }

  const nestedImage = imageRecord.image;
  return (
    Boolean(nestedImage) &&
    typeof nestedImage === "object" &&
    typeof (nestedImage as Record<string, unknown>).url === "string" &&
    ((nestedImage as Record<string, unknown>).url as string).trim().length > 0
  );
};

type StyledTextBlock = {
  text: YextEntityField<TranslatableString>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type StyledRtfBlock = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type HeroCtaValue = {
  data?: ComprehensiveCTAValue["data"];
  styles?: ComprehensiveCTAValue["styles"];
  className?: string;
  eventName?: string;
};

type HeroButton = {
  cta: HeroCtaValue;
};

type HeroRenderVariant = "primary" | "secondary" | "tertiary";

type HeroImage = {
  image: YextEntityField<HeroImageValue>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type MedicalSpecialistHeroProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  eyebrow: StyledTextBlock;
  title: StyledTextBlock;
  description: StyledRtfBlock;
  ctas: HeroButton[];
  imageBackgroundColor: ThemeColor;
  heroImage: HeroImage;
};

const getResolvedHeroButtonVariant = (value: HeroButton): HeroRenderVariant => {
  const variant =
    typeof value.cta.styles?.variant === "string"
      ? String(value.cta.styles.variant)
      : "";

  if (variant === "secondary") {
    return "secondary";
  }

  if (variant === "link") {
    return "tertiary";
  }

  return "primary";
};

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

const getThemeFallbackCss = (fallbackToken?: string, fallbackCss?: string) => {
  if (fallbackToken) {
    return toThemeCss(fallbackToken, fallbackCss);
  }

  return fallbackCss;
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
  return toThemeCss(token, getThemeFallbackCss(fallbackToken, fallbackCss));
};

const getRichTextStyleOverrides = (
  value: StyledTextValue,
  color?: ThemeColor | string,
  fallbackColorToken?: string,
) => ({
  fontFamily: value.fontFamily,
  fontSize: value.fontSize,
  fontWeight: value.fontWeight,
  fontStyle: value.fontStyle,
  textTransform: value.textTransform,
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

const renderResolvedRichText = (
  resolvedValue: unknown,
  styles: StyledTextValue,
  color?: ThemeColor | string,
  fallbackColorToken?: string,
) => {
  if (React.isValidElement(resolvedValue)) {
    return resolvedValue;
  }

  const normalizedValue: RichText | string | undefined =
    typeof resolvedValue === "string"
      ? resolvedValue
      : isRichText(resolvedValue)
        ? resolvedValue
        : undefined;

  return (
    <MaybeRTF
      data={normalizedValue}
      richTextStyleOverrides={getRichTextStyleOverrides(
        styles,
        color,
        fallbackColorToken,
      )}
    />
  );
};

const resolveHeroImage = (
  value: HeroImage,
  streamDocument: Record<string, unknown>,
  locale: string,
): HeroImageValue | undefined => {
  const resolvedValue = resolveComponentData(
    value.image as any,
    locale,
    streamDocument,
  );

  if (!resolvedValue || typeof resolvedValue !== "object") {
    return undefined;
  }

  const localizedImage =
    resolveLocalizedAssetImage(
      resolvedValue as TranslatableAssetImage | ImageType,
      locale,
    ) ?? (resolvedValue as HeroImageValue);

  return hasImageUrl(localizedImage) ? localizedImage : undefined;
};

const getTextStyle = (
  value: StyledTextValue,
  color: ThemeColor | string | undefined,
  fallbackFamily: string,
  fallbackToken?: string,
) => ({
  fontFamily:
    value.fontFamily === "default" ? fallbackFamily : value.fontFamily,
  fontSize: pxOrUndefined(value.fontSize),
  fontWeight: pxOrUndefined(value.fontWeight),
  fontStyle: value.fontStyle === "default" ? undefined : value.fontStyle,
  textTransform:
    value.textTransform === "default" ? undefined : value.textTransform,
  color: getTextColorCss(color, fallbackToken),
});

const getButtonStyle = (
  value: HeroButton["cta"],
  variant: HeroRenderVariant,
  sectionForeground?: string,
): React.CSSProperties => {
  const buttonStyles = value.styles?.button;
  const buttonColor = value.styles?.color;
  const fillToken = getThemeToken(buttonColor, "palette-primary");
  const outlineToken =
    variant === "tertiary"
      ? getThemeToken(buttonColor, sectionForeground)
      : fillToken;
  const fillColor = toThemeCss(fillToken, "#7d9e77");
  const outlineColor = toThemeCss(outlineToken, "#7d9e77");
  const textColor =
    variant === "primary"
      ? getContrastTextColor(buttonColor)
      : toThemeCss(outlineToken, "#ffffff");

  return {
    fontFamily:
      buttonStyles?.fontFamily === "default" || !buttonStyles?.fontFamily
        ? '"Manrope", Inter, sans-serif'
        : buttonStyles.fontFamily,
    fontSize: pxOrUndefined(buttonStyles?.fontSize) ?? "18px",
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
    color: textColor,
    backgroundColor: variant === "primary" ? fillColor : "transparent",
    border: `1px solid ${outlineColor}`,
  };
};

const getTarget = (openInNewTab: boolean, isEditing: boolean) =>
  openInNewTab ? "_blank" : isEditing ? undefined : "_top";

const readBaseName = (streamDocument: Record<string, unknown>) =>
  (typeof streamDocument.name === "string" ? streamDocument.name.trim() : "") ||
  (typeof (streamDocument.location as Record<string, unknown> | undefined)
    ?.name === "string"
    ? String(
        (streamDocument.location as Record<string, unknown> | undefined)?.name,
      ).trim()
    : "") ||
  "Medical Specialist";

const getCtaSummary = (cta: HeroButton | undefined, index?: number) => {
  const constantValue = cta?.cta?.data?.cta?.constantValue;
  const label =
    cta?.cta?.data?.actionType === "button"
      ? cta?.cta?.data?.buttonText
      : constantValue?.label;
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }
  if (label && typeof label === "object") {
    const record = label as Record<string, unknown>;
    if (typeof record.text === "string") {
      return record.text;
    }
    if (typeof record.text === "number") {
      return String(record.text);
    }
    if (typeof record.defaultValue === "string") {
      return record.defaultValue;
    }
    if (typeof record.defaultValue === "number") {
      return String(record.defaultValue);
    }
  }
  return `CTA ${(index ?? 0) + 1}`;
};

const heroStyles = `
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

.medical-specialist-hero__panel {
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(24px, 4vw, 44px);
  align-items: center;
}

.medical-specialist-hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  min-width: 0;
}

.medical-specialist-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
}

.medical-specialist-hero__title {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.05em;
  max-width: 9ch;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-hero__description {
  margin: 0;
  max-width: 560px;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

.medical-specialist-hero__description p {
  margin: 0;
}

.medical-specialist-hero__cta-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.medical-specialist-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 18px;
  width: auto;
  min-width: 0;
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease, background-color 180ms ease;
}

.medical-specialist-hero__cta:hover,
.medical-specialist-hero__cta:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(38, 14, 1, 0.12);
}

.medical-specialist-hero__cta--secondary,
.medical-specialist-hero__cta--tertiary {
  box-shadow: none;
}

.medical-specialist-hero__cta--secondary:hover,
.medical-specialist-hero__cta--secondary:focus-visible,
.medical-specialist-hero__cta--tertiary:hover,
.medical-specialist-hero__cta--tertiary:focus-visible {
  box-shadow: 0 10px 24px rgba(38, 14, 1, 0.08);
}

.medical-specialist-hero__media {
  position: relative;
  width: min(
    100%,
    calc(
      var(--medical-specialist-hero-media-max-height, 520px) *
        var(--medical-specialist-hero-media-aspect-ratio, 1)
    )
  );
  min-width: 0;
  max-width: 100%;
  max-height: var(--medical-specialist-hero-media-max-height, 520px);
  height: auto;
  align-self: center;
  justify-self: end;
  padding-right: clamp(18px, 4vw, 36px);
}

.medical-specialist-hero__media-offset {
  position: absolute;
  inset: 0 0 0 auto;
  width: calc(100% - clamp(18px, 4vw, 36px));
  height: 100%;
  transform: translateX(clamp(18px, 4vw, 36px));
}

.medical-specialist-hero__media-image-wrap {
  position: relative;
  width: calc(100% - clamp(18px, 4vw, 36px));
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.medical-specialist-hero__media-image {
  width: 100%;
  height: 100%;
}

.medical-specialist-hero__media img {
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 1024px) {
  .medical-specialist-hero__panel {
    grid-template-columns: minmax(0, 1fr);
  }

  .medical-specialist-hero__title {
    max-width: none;
  }

  .medical-specialist-hero__media {
    --medical-specialist-hero-media-max-height: 420px;
    justify-self: center;
    padding-right: clamp(14px, 3vw, 26px);
  }

  .medical-specialist-hero__media-offset {
    width: calc(100% - clamp(14px, 3vw, 26px));
    transform: translateX(clamp(14px, 3vw, 26px));
  }

  .medical-specialist-hero__media-image-wrap {
    width: calc(100% - clamp(14px, 3vw, 26px));
  }
}

@media (max-width: 720px) {
  .medical-specialist-hero__copy {
    gap: 20px;
  }

  .medical-specialist-hero__cta-group {
    justify-content: center;
  }

  .medical-specialist-hero__cta {
    width: 100%;
    min-width: 0;
  }

  .medical-specialist-hero__media {
    --medical-specialist-hero-media-max-height: 392px;
    padding-right: clamp(10px, 2.4vw, 18px);
  }

  .medical-specialist-hero__media-offset {
    width: calc(100% - clamp(10px, 2.4vw, 18px));
    transform: translateX(clamp(10px, 2.4vw, 18px));
  }

  .medical-specialist-hero__media-image-wrap {
    width: calc(100% - clamp(10px, 2.4vw, 18px));
  }
}
`;

const MedicalSpecialistHeroComponent = (
  props: MedicalSpecialistHeroProps & {
    id: string;
    puck: { isEditing: boolean };
  },
) => {
  const streamDocument = useDocument<Record<string, unknown>>();
  const documentData = streamDocument ?? {};
  const locale =
    typeof documentData.meta === "object" &&
    documentData.meta &&
    typeof (documentData.meta as { locale?: unknown }).locale === "string"
      ? String((documentData.meta as { locale?: unknown }).locale)
      : typeof documentData.locale === "string"
        ? documentData.locale
        : "en";
  const resolvedTitle = resolveComponentData(
    props.title.text as any,
    locale,
    documentData,
  );
  const titleConstantValue = props.title.text?.constantValue;
  const titleConstantRecord =
    titleConstantValue && typeof titleConstantValue === "object"
      ? (titleConstantValue as Record<string, unknown>)
      : undefined;
  const titleFallback =
    typeof titleConstantValue === "string" ||
    typeof titleConstantValue === "number"
      ? String(titleConstantValue)
      : typeof titleConstantRecord?.text === "string"
        ? titleConstantRecord.text
        : typeof titleConstantRecord?.text === "number"
          ? String(titleConstantRecord.text)
          : typeof titleConstantRecord?.defaultValue === "string"
            ? titleConstantRecord.defaultValue
            : typeof titleConstantRecord?.defaultValue === "number"
              ? String(titleConstantRecord.defaultValue)
              : readBaseName(documentData);
  const resolvedTitleRecord =
    resolvedTitle && typeof resolvedTitle === "object"
      ? (resolvedTitle as Record<string, unknown>)
      : undefined;
  const title =
    (typeof resolvedTitle === "string" || typeof resolvedTitle === "number"
      ? String(resolvedTitle)
      : typeof resolvedTitleRecord?.text === "string"
        ? resolvedTitleRecord.text
        : typeof resolvedTitleRecord?.text === "number"
          ? String(resolvedTitleRecord.text)
          : typeof resolvedTitleRecord?.defaultValue === "string"
            ? resolvedTitleRecord.defaultValue
            : typeof resolvedTitleRecord?.defaultValue === "number"
              ? String(resolvedTitleRecord.defaultValue)
              : titleFallback
    ).trim() || titleFallback;
  const resolvedEyebrow = resolveComponentData(
    props.eyebrow.text as any,
    locale,
    documentData,
  );
  const eyebrowConstantValue = props.eyebrow.text?.constantValue;
  const eyebrowConstantRecord =
    eyebrowConstantValue && typeof eyebrowConstantValue === "object"
      ? (eyebrowConstantValue as Record<string, unknown>)
      : undefined;
  const eyebrowFallback =
    typeof eyebrowConstantValue === "string" ||
    typeof eyebrowConstantValue === "number"
      ? String(eyebrowConstantValue)
      : typeof eyebrowConstantRecord?.text === "string"
        ? eyebrowConstantRecord.text
        : typeof eyebrowConstantRecord?.text === "number"
          ? String(eyebrowConstantRecord.text)
          : typeof eyebrowConstantRecord?.defaultValue === "string"
            ? eyebrowConstantRecord.defaultValue
            : typeof eyebrowConstantRecord?.defaultValue === "number"
              ? String(eyebrowConstantRecord.defaultValue)
              : "Central Campus";
  const resolvedEyebrowRecord =
    resolvedEyebrow && typeof resolvedEyebrow === "object"
      ? (resolvedEyebrow as Record<string, unknown>)
      : undefined;
  const eyebrowText =
    (typeof resolvedEyebrow === "string" || typeof resolvedEyebrow === "number"
      ? String(resolvedEyebrow)
      : typeof resolvedEyebrowRecord?.text === "string"
        ? resolvedEyebrowRecord.text
        : typeof resolvedEyebrowRecord?.text === "number"
          ? String(resolvedEyebrowRecord.text)
          : typeof resolvedEyebrowRecord?.defaultValue === "string"
            ? resolvedEyebrowRecord.defaultValue
            : typeof resolvedEyebrowRecord?.defaultValue === "number"
              ? String(resolvedEyebrowRecord.defaultValue)
              : eyebrowFallback
    ).trim() || eyebrowFallback;
  const descriptionValue = resolveComponentData(
    props.description.text as any,
    locale,
    documentData,
  );
  const heroImage = resolveHeroImage(props.heroImage, documentData, locale);
  const heroImageAspectRatio =
    props.heroImage.aspectRatio > 0 ? props.heroImage.aspectRatio : undefined;
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "32px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistHero${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{heroStyles}</style>
        <section
          style={{
            backgroundColor: toThemeCss(
              props.section.backgroundColor?.selectedColor,
              "#fdf7f4",
            ),
            padding: `${verticalPadding} 40px`,
          }}
        >
          <div
            className="medical-specialist-hero__panel"
            style={{ maxWidth: sectionWidth }}
          >
            <div className="medical-specialist-hero__copy">
              <EntityField
                displayName="Eyebrow"
                fieldId={props.eyebrow.text.field}
                constantValueEnabled={props.eyebrow.text.constantValueEnabled}
              >
                <span
                  className="medical-specialist-hero__eyebrow"
                  style={getTextStyle(
                    props.eyebrow.styles,
                    props.eyebrow.fontColor,
                    "'Krub', 'Krub Fallback', sans-serif",
                    sectionForeground,
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                  >
                    <path d="M12 1.75 14.77 7l5.98.83-4.34 4.22 1.02 5.95L12 15.14 6.57 18l1.02-5.95L3.25 7.83 9.23 7 12 1.75Z" />
                  </svg>
                  {eyebrowText}
                </span>
              </EntityField>
              <EntityField
                displayName="Title"
                fieldId={props.title.text.field}
                constantValueEnabled={props.title.text.constantValueEnabled}
              >
                <h1
                  className="medical-specialist-hero__title"
                  style={getTextStyle(
                    props.title.styles,
                    props.title.fontColor,
                    '"Manrope", Inter, sans-serif',
                    sectionForeground,
                  )}
                >
                  {title}
                </h1>
              </EntityField>
              <EntityField
                displayName="Description"
                fieldId={props.description.text.field}
                constantValueEnabled={
                  props.description.text.constantValueEnabled
                }
              >
                <div
                  className="medical-specialist-hero__description"
                  style={getTextStyle(
                    props.description.styles,
                    props.description.fontColor,
                    "'Krub', 'Krub Fallback', sans-serif",
                    sectionForeground,
                  )}
                >
                  {renderResolvedRichText(
                    descriptionValue,
                    props.description.styles,
                    props.description.fontColor,
                    sectionForeground,
                  )}
                </div>
              </EntityField>
              <div className="medical-specialist-hero__cta-group">
                {props.ctas.map((cta, index) => {
                  const resolvedVariant = getResolvedHeroButtonVariant(cta);

                  return (
                    <EntityField
                      key={`${getCtaSummary(cta, index)}-${index}`}
                      displayName="Hero CTA"
                      fieldId={cta.cta.data?.cta.field}
                      constantValueEnabled={
                        cta.cta.data?.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={cta.cta as Partial<ComprehensiveCTAValue>}
                        className={`medical-specialist-hero__cta medical-specialist-hero__cta--${resolvedVariant}`}
                        eventName={`heroCta${index}`}
                        target={getTarget(
                          cta.cta.data?.openInNewTab ?? false,
                          props.puck.isEditing,
                        )}
                        style={getButtonStyle(
                          cta.cta,
                          resolvedVariant,
                          sectionForeground,
                        )}
                      />
                    </EntityField>
                  );
                })}
              </div>
            </div>
            <div
              className="medical-specialist-hero__media"
              style={{
                aspectRatio: heroImageAspectRatio
                  ? String(heroImageAspectRatio)
                  : undefined,
                borderRadius:
                  pxOrUndefined(props.heroImage.styles.borderRadius) ?? "32px",
                ["--medical-specialist-hero-media-aspect-ratio" as any]:
                  heroImageAspectRatio ? String(heroImageAspectRatio) : "1",
              }}
            >
              <div
                className="medical-specialist-hero__media-offset"
                style={{
                  borderRadius:
                    pxOrUndefined(props.heroImage.styles.borderRadius) ??
                    "32px",
                  backgroundColor: toThemeCss(
                    props.imageBackgroundColor?.selectedColor,
                    "var(--colors-palette-primary)",
                  ),
                }}
              />
              <div
                className="medical-specialist-hero__media-image-wrap"
                style={{
                  borderRadius:
                    pxOrUndefined(props.heroImage.styles.borderRadius) ??
                    "32px",
                }}
              >
                {heroImage ? (
                  <EntityField
                    displayName="Hero Image"
                    fieldId={props.heroImage.image.field}
                    constantValueEnabled={
                      props.heroImage.image.constantValueEnabled
                    }
                    fullHeight
                  >
                    <Image
                      image={heroImage}
                      className="medical-specialist-hero__media-image"
                      style={{
                        objectFit:
                          props.heroImage.imageConstrain === "fixed"
                            ? "contain"
                            : "cover",
                      }}
                    />
                  </EntityField>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistHero: YextComponentConfig<MedicalSpecialistHeroProps> =
  {
    label: "Hero",
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
          visibleOnLivePage: {
            label: "Visible on Live Page",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          styles: {
            label: "Section Styles",
            type: "styledPageSection",
          },
        },
      },
      eyebrow: {
        label: "Eyebrow",
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
      title: {
        label: "Title",
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
      description: {
        label: "Description",
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
      ctas: {
        label: "CTAs",
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
                    defaultValue: "Call to Action",
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
          },
        },
        getItemSummary: (item: HeroButton, index?: number) =>
          getCtaSummary(item, index),
      },
      imageBackgroundColor: {
        label: "Image Background Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      heroImage: {
        label: "Hero Image",
        type: "object",
        objectFields: {
          image: {
            type: "entityField",
            label: "Image",
            filter: {
              types: ["type.image"],
            },
          },
          aspectRatio: {
            label: "Aspect Ratio",
            type: "basicSelector",
            options: ThemeOptions.ASPECT_RATIO,
          },
          imageConstrain: {
            label: "Image Constrain",
            type: "select",
            options: [
              { label: "Fixed", value: "fixed" },
              { label: "Filled", value: "filled" },
            ],
          },
          styles: { label: "Image Styles", type: "styledImage" },
        },
      },
    },
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-quaternary",
          contrastingColor: "palette-quaternary-contrast",
        },
        visibleOnLivePage: true,
        styles: {
          contentWidth: "1280px",
          verticalPadding: "32px",
        },
      },
      eyebrow: {
        text: {
          field: "geomodifier",
          constantValue: {
            defaultValue: "Central Campus",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: false,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "'Krub', 'Krub Fallback', sans-serif",
          fontSize: "18px",
          fontWeight: "400",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      title: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: false,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "Manrope",
          fontSize: "72px",
          fontWeight: "700",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat, sem ac blandit placerat, velit neque volutpat libero, et mattis urna erat ut nisi.",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "'Krub', 'Krub Fallback', sans-serif",
          fontSize: "18px",
          fontWeight: "500",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      ctas: [
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
              variant: "primary",
              color: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
              button: {
                fontFamily: "'Krub', 'Krub Fallback', sans-serif",
                fontSize: "18px",
                fontWeight: "400",
                fontStyle: "default",
                textTransform: "default",
                letterSpacing: "-0.02em",
                borderRadius: "6px",
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
                    defaultValue: "Find Care",
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
              variant: "secondary",
              color: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
              button: {
                fontFamily: "'Krub', 'Krub Fallback', sans-serif",
                fontSize: "18px",
                fontWeight: "400",
                fontStyle: "default",
                textTransform: "default",
                letterSpacing: "-0.02em",
                borderRadius: "6px",
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
                    defaultValue: "View Patient Resources",
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
              variant: "secondary",
              color: {
                selectedColor: "[#260e01]",
                contrastingColor: "white",
              },
              button: {
                fontFamily: "'Krub', 'Krub Fallback', sans-serif",
                fontSize: "18px",
                fontWeight: "400",
                fontStyle: "default",
                textTransform: "default",
                letterSpacing: "-0.02em",
                borderRadius: "6px",
              },
            },
          },
        },
      ],
      imageBackgroundColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      heroImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
            alternateText: "Medical specialist hero image",
          },
          constantValueEnabled: true,
        },
        aspectRatio: 0.75,
        imageConstrain: "filled",
        styles: {
          borderRadius: "9999px",
        },
      },
    },
    render: (props) => <MedicalSpecialistHeroComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistHero",
  displayName: "Hero",
  description: "Hero",
  pageSetTypes: ["ENTITY"],
};
