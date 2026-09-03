import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  AnalyticsScopeProvider,
  type ComplexImageType,
  type ImageType,
} from "@yext/pages-components";

import {
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  ThemeOptions,
  getDefaultRTF,
  Image,
  MaybeRTF,
  resolveComponentData,
  resolveLocalizedAssetImage,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  useDocument,
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

type ProviderImageValue = ImageType | ComplexImageType | TranslatableAssetImage;

type RenderableProviderImage = {
  url?: string;
  alternateText?: string;
  width?: number;
  height?: number;
  assetImage?: unknown;
};

type ProviderCardFields = {
  name: YextEntityField<TranslatableString>;
  role: YextEntityField<TranslatableString>;
  certificationLabel: YextEntityField<TranslatableString>;
  certificationValue: YextEntityField<TranslatableString>;
  specialties: YextEntityField<string[]>;
  image: YextEntityField<ProviderImageValue>;
};

const providerTextValue = (
  defaultValue: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: { defaultValue, hasLocalizedValue: "true" },
  constantValueEnabled: true,
});

const providerCardsSource = createItemSource<ProviderCardFields>({
  label: "Provider Cards",
  mappingFields: {
    name: {
      type: "entityField",
      label: "Name",
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    role: {
      type: "entityField",
      label: "Role",
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    certificationLabel: {
      type: "entityField",
      label: "Certification Label",
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    certificationValue: {
      type: "entityField",
      label: "Certification Value",
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    specialties: {
      type: "entityField",
      label: "Specialties",
      filter: { types: ["type.string"], includeListsOnly: true },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
  },
  defaultValues: [
    {
      name: providerTextValue("Dr. Elena Rodriguez, MD"),
      role: providerTextValue("Chief of Medicine"),
      certificationLabel: providerTextValue("Board Certification"),
      certificationValue: providerTextValue(
        "American Board of Family Medicine",
      ),
      specialties: {
        field: "",
        constantValue: [
          "Emergency medicine",
          "Acute care stabilization",
          "Chronic disease management",
        ],
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
          alternateText: "Provider profile photo",
        },
        constantValueEnabled: true,
      },
    },
    {
      name: providerTextValue("Dr. Thomas Hayes, DO"),
      role: providerTextValue("Urgent Care Director"),
      certificationLabel: providerTextValue("Board Certification"),
      certificationValue: providerTextValue(
        "American Osteopathic Board of Emergency Medicine",
      ),
      specialties: {
        field: "",
        constantValue: [
          "Minor trauma",
          "Orthopedic injuries",
          "Pediatric urgent care",
        ],
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
          alternateText: "Provider profile photo",
        },
        constantValueEnabled: true,
      },
    },
    {
      name: providerTextValue("Laura Croft, FNP-BC"),
      role: providerTextValue("Family Nurse Practitioner"),
      certificationLabel: providerTextValue(""),
      certificationValue: providerTextValue(""),
      specialties: {
        field: "",
        constantValue: [
          "Women's health",
          "Preventative screenings",
          "Wellness coaching",
        ],
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
          alternateText: "Provider profile photo",
        },
        constantValueEnabled: true,
      },
    },
    {
      name: providerTextValue("Stephen Menendez, PA-C"),
      role: providerTextValue("Physician Assistant"),
      certificationLabel: providerTextValue(""),
      certificationValue: providerTextValue(""),
      specialties: {
        field: "",
        constantValue: ["Sports medicine", "Wound care", "Occupational health"],
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
          alternateText: "Provider profile photo",
        },
        constantValueEnabled: true,
      },
    },
  ],
});

type TextBlock = {
  text: YextEntityField<TranslatableString>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type RichTextBlock = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type MedicalSpecialistProvidersProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  heading: TextBlock;
  description: RichTextBlock;
  cta: {
    data?: ComprehensiveCTAValue["data"];
    styles?: ComprehensiveCTAValue["styles"];
    className?: string;
    eventName?: string;
  };
  nameStyles: StyledTextValue;
  nameColor?: ThemeColor;
  roleStyles: StyledTextValue;
  roleColor?: ThemeColor;
  bodyStyles: StyledTextValue;
  bodyColor?: ThemeColor;
  cardBackgroundColor: ThemeColor;
  cardImage: {
    styles: StyledImageValue;
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
  };
  cards: typeof providerCardsSource.value;
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
  fontFamily: value.fontFamily,
  fontSize: value.fontSize,
  fontWeight: value.fontWeight,
  fontStyle: value.fontStyle,
  textTransform: value.textTransform,
  color: color ?? fallbackColorToken,
});

const pxOrUndefined = (value?: string) =>
  !value || value === "default" ? undefined : value;

const getTextStyle = (
  value: StyledTextValue,
  color: ThemeColor | string | undefined,
  fallbackFamily: string,
  fallbackColorToken?: string,
) => ({
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
  value: MedicalSpecialistProvidersProps["cta"],
): React.CSSProperties => {
  const buttonStyles = value.styles?.button;
  const buttonColor = value.styles?.color;
  const variant = value.styles?.variant ?? "primary";
  const accentColor = toThemeCss(
    typeof buttonColor === "string" ? buttonColor : buttonColor?.selectedColor,
    "#7d9e77",
  );

  return {
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
    color: variant === "primary" ? "#ffffff" : accentColor,
    backgroundColor: variant === "primary" ? accentColor : "transparent",
    borderColor: accentColor,
  };
};

const isRichText = (value: unknown): value is RichText =>
  typeof value === "object" &&
  value !== null &&
  ("html" in value || "json" in value);

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

.medical-specialist-providers__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.medical-specialist-providers__intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.medical-specialist-providers__intro-copy {
  display: grid;
  gap: 12px;
  max-width: 640px;
}

.medical-specialist-providers__heading,
.medical-specialist-providers__description {
  margin: 0;
}

.medical-specialist-providers__heading,
.medical-specialist-providers__name {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-providers__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid currentColor;
  text-decoration: none;
  transition: filter 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.medical-specialist-providers__cta:hover,
.medical-specialist-providers__cta:focus-visible {
  box-shadow: 0 10px 24px rgba(38, 14, 1, 0.12);
  transform: translateY(-1px);
  outline: 2px solid rgba(125, 158, 119, 0.3);
  outline-offset: 3px;
}

.medical-specialist-providers__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.medical-specialist-providers__card {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 20px;
  padding: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-decoration: none;
}

.medical-specialist-providers__image {
  height: 300px;
  overflow: hidden;
  border-radius: 16px;
}

.medical-specialist-providers__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.medical-specialist-providers__body {
  padding: 16px;
  display: grid;
  gap: 0;
  min-height: 54px;
}

.medical-specialist-providers__name,
.medical-specialist-providers__role,
.medical-specialist-providers__meta-label,
.medical-specialist-providers__meta-value {
  margin: 0;
}

.medical-specialist-providers__role {
  margin-bottom: 16px;
}

.medical-specialist-providers__meta-label {
  color: rgb(153, 153, 153);
  font-style: italic;
}

.medical-specialist-providers__specialties {
  margin: 0;
  padding-left: 22px;
}

.medical-specialist-providers__specialties li {
  margin: 0;
}

@media (max-width: 1199px) {
  .medical-specialist-providers__intro {
    flex-direction: column;
    align-items: flex-start;
  }

  .medical-specialist-providers__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 809px) {
  .medical-specialist-providers__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-providers__name {
    font-size: 20px !important;
    line-height: 1.15 !important;
  }

  .medical-specialist-providers__intro,
  .medical-specialist-providers__intro-copy {
    align-items: center;
    text-align: center;
  }

  .medical-specialist-providers__cta {
    width: 100%;
  }

  .medical-specialist-providers__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .medical-specialist-providers__image {
    height: 220px;
  }

  .medical-specialist-providers__body {
    padding: 14px;
    justify-items: center;
    text-align: center;
  }

  .medical-specialist-providers__specialties {
    text-align: left;
    width: fit-content;
  }
}
`;

const MedicalSpecialistProvidersComponent = (
  props: MedicalSpecialistProvidersProps & { id: string; puck: any },
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
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const cardForeground = getReadableSectionForeground(
    props.cardBackgroundColor,
  );
  const resolvedHeading = resolveComponentData(
    props.heading.text as any,
    locale,
    documentData,
  );
  const headingText =
    typeof resolvedHeading === "string" || typeof resolvedHeading === "number"
      ? String(resolvedHeading).trim() || "Meet Our Providers"
      : "Meet Our Providers";
  const resolvedDescription = resolveComponentData(
    props.description.text as any,
    locale,
    documentData,
  );
  const providerCards = providerCardsSource.resolveItems(
    props.cards,
    streamDocument,
  );

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistProviders${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{styles}</style>
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
            className="medical-specialist-providers__inner"
            style={{ maxWidth: sectionWidth }}
          >
            <div className="medical-specialist-providers__intro">
              <div className="medical-specialist-providers__intro-copy">
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2
                    className="medical-specialist-providers__heading"
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
                <EntityField
                  displayName="Description"
                  fieldId={props.description.text.field}
                  constantValueEnabled={
                    props.description.text.constantValueEnabled
                  }
                >
                  <div
                    className="medical-specialist-providers__description"
                    style={getTextStyle(
                      props.description.styles,
                      props.description.fontColor,
                      "'Krub', 'Krub Fallback', sans-serif",
                      sectionForeground,
                    )}
                  >
                    {React.isValidElement(resolvedDescription) ? (
                      resolvedDescription
                    ) : (
                      <MaybeRTF
                        data={
                          typeof resolvedDescription === "string" ||
                          isRichText(resolvedDescription)
                            ? resolvedDescription
                            : undefined
                        }
                        richTextStyleOverrides={getRichTextStyleOverrides(
                          props.description.styles,
                          props.description.fontColor,
                          sectionForeground,
                        )}
                      />
                    )}
                  </div>
                </EntityField>
              </div>
              <EntityField
                displayName="Provider Directory CTA"
                fieldId={props.cta.data?.cta.field}
                constantValueEnabled={props.cta.data?.cta.constantValueEnabled}
              >
                <ComprehensiveCTA
                  className="medical-specialist-providers__cta"
                  value={props.cta as Partial<ComprehensiveCTAValue>}
                  eventName="providersDirectoryCta"
                  target={props.cta.data?.openInNewTab ? "_blank" : undefined}
                  style={getButtonStyle(props.cta)}
                />
              </EntityField>
            </div>
            <EntityField
              displayName="Provider Cards"
              fieldId={props.cards.field}
              constantValueEnabled={props.cards.constantValueEnabled}
            >
              <div className="medical-specialist-providers__grid">
                {providerCards.map((card, index) => {
                  const name =
                    resolveComponentData(card.name, locale, documentData, {
                      output: "plainText",
                    }).trim() || `Provider ${index + 1}`;
                  const role = resolveComponentData(
                    card.role,
                    locale,
                    documentData,
                    { output: "plainText" },
                  ).trim();
                  const certificationLabel = resolveComponentData(
                    card.certificationLabel,
                    locale,
                    documentData,
                    { output: "plainText" },
                  ).trim();
                  const certificationValue = resolveComponentData(
                    card.certificationValue,
                    locale,
                    documentData,
                    { output: "plainText" },
                  ).trim();
                  const specialties = (card.specialties ?? [])
                    .map((item) => String(item).trim())
                    .filter(Boolean);
                  const imageCandidate =
                    card.image && typeof card.image === "object"
                      ? ((resolveLocalizedAssetImage(
                          card.image as TranslatableAssetImage | ImageType,
                          locale,
                        ) ?? card.image) as RenderableProviderImage)
                      : undefined;
                  const imageUrl =
                    imageCandidate &&
                    typeof imageCandidate.url === "string" &&
                    imageCandidate.url.trim().length > 0
                      ? imageCandidate.url
                      : undefined;
                  return (
                    <article
                      key={`${name}-${index}`}
                      className="medical-specialist-providers__card"
                      style={{
                        backgroundColor: toThemeCss(
                          props.cardBackgroundColor?.selectedColor,
                          "rgba(255, 255, 255, 0.5)",
                        ),
                      }}
                    >
                      {imageCandidate && imageUrl ? (
                        <div
                          className="medical-specialist-providers__image"
                          style={{
                            borderRadius:
                              pxOrUndefined(
                                props.cardImage.styles.borderRadius,
                              ) ?? "16px",
                          }}
                        >
                          <Image
                            image={imageCandidate as any}
                            aspectRatio={props.cardImage.aspectRatio}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit:
                                props.cardImage.imageConstrain === "fixed"
                                  ? "contain"
                                  : "cover",
                            }}
                          />
                        </div>
                      ) : null}
                      <div className="medical-specialist-providers__body">
                        <h3
                          className="medical-specialist-providers__name"
                          style={getTextStyle(
                            props.nameStyles,
                            props.nameColor,
                            "'Krub', 'Krub Fallback', sans-serif",
                            cardForeground,
                          )}
                        >
                          {name}
                        </h3>
                        <p
                          className="medical-specialist-providers__role"
                          style={getTextStyle(
                            props.roleStyles,
                            props.roleColor,
                            "'Krub', 'Krub Fallback', sans-serif",
                            cardForeground,
                          )}
                        >
                          {role}
                        </p>
                        {certificationLabel ? (
                          <p
                            className="medical-specialist-providers__meta-label"
                            style={getTextStyle(
                              props.bodyStyles,
                              props.bodyColor,
                              "'Krub', 'Krub Fallback', sans-serif",
                              cardForeground,
                            )}
                          >
                            {certificationLabel}
                          </p>
                        ) : null}
                        {certificationValue ? (
                          <p
                            className="medical-specialist-providers__meta-value"
                            style={getTextStyle(
                              props.bodyStyles,
                              props.bodyColor,
                              "'Krub', 'Krub Fallback', sans-serif",
                              cardForeground,
                            )}
                          >
                            {certificationValue}
                          </p>
                        ) : null}
                        {specialties.length > 0 ? (
                          <>
                            <p
                              className="medical-specialist-providers__meta-label"
                              style={getTextStyle(
                                props.bodyStyles,
                                props.bodyColor,
                                "'Krub', 'Krub Fallback', sans-serif",
                                cardForeground,
                              )}
                            >
                              Specialties
                            </p>
                            <ul
                              className="medical-specialist-providers__specialties"
                              style={getTextStyle(
                                props.bodyStyles,
                                props.bodyColor,
                                "'Krub', 'Krub Fallback', sans-serif",
                                cardForeground,
                              )}
                            >
                              {specialties.map((specialty, specialtyIndex) => (
                                <li key={`${specialty}-${specialtyIndex}`}>
                                  {specialty}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistProviders: YextComponentConfig<MedicalSpecialistProvidersProps> =
  {
    label: "Providers",
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
          styles: { label: "Section Styles", type: "styledPageSection" },
        },
      },
      cards: providerCardsSource.field,
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
      cta: {
        label: "Call to Action",
        type: "comprehensiveCTA",
      },
      nameStyles: { label: "Name Styles", type: "styledText" },
      nameColor: {
        label: "Name Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      roleStyles: { label: "Role Styles", type: "styledText" },
      roleColor: {
        label: "Role Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      bodyStyles: { label: "Body Styles", type: "styledText" },
      bodyColor: {
        label: "Body Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      cardBackgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      cardImage: {
        label: "Card Image",
        type: "object",
        objectFields: {
          styles: { label: "Image Styles", type: "styledImage" },
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
        styles: { contentWidth: "1280px", verticalPadding: "16px" },
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Meet Our Providers",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "Manrope",
          fontSize: "60px",
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
              "Board-certified clinicians serving Central Campus.",
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
      cta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "Provider Directory",
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
      nameStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      nameColor: undefined,
      roleStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      roleColor: undefined,
      bodyStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      bodyColor: undefined,
      cardBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      cardImage: {
        styles: { borderRadius: "default" },
        aspectRatio: 0,
        imageConstrain: "filled",
      },
      cards: providerCardsSource.defaultValue,
    },
    render: (props) => <MedicalSpecialistProvidersComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistProviders",
  displayName: "Providers",
  description: "Providers",
  pageSetTypes: ["ENTITY"],
};
