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
  Image,
  MaybeRTF,
  ThemeOptions,
  getAnalyticsScopeHash,
  getDefaultRTF,
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

type OutreachImageValue = ImageType | ComplexImageType | TranslatableAssetImage;

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

type OutreachCtaValue = {
  data?: ComprehensiveCTAValue["data"];
  styles?: ComprehensiveCTAValue["styles"];
  className?: string;
  eventName?: string;
};

type OutreachImage = {
  image: YextEntityField<OutreachImageValue>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type MedicalSpecialistOutreachProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  imageBackgroundColor: ThemeColor;
  heading: StyledTextBlock;
  description: StyledRtfBlock;
  cta: OutreachCtaValue;
  image: OutreachImage;
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

const getButtonStyle = (value: OutreachCtaValue): React.CSSProperties => {
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
    border: `1px solid ${accentColor}`,
  };
};

const getTarget = (openInNewTab: boolean, isEditing: boolean) =>
  openInNewTab ? "_blank" : isEditing ? undefined : "_top";

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

.medical-specialist-outreach__inner {
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(360px, 1.05fr) minmax(0, 0.95fr);
  gap: 32px;
  align-items: center;
}

.medical-specialist-outreach__copy {
  display: grid;
  gap: 20px;
}

.medical-specialist-outreach__heading,
.medical-specialist-outreach__description {
  margin: 0;
}

.medical-specialist-outreach__heading {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-outreach__description p {
  margin: 0;
}

.medical-specialist-outreach__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 48px;
  padding: 0 18px;
  text-decoration: none;
  box-shadow: 0 10px 26px rgba(38, 14, 1, 0.08);
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.medical-specialist-outreach__cta:hover,
.medical-specialist-outreach__cta:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(38, 14, 1, 0.12);
}

.medical-specialist-outreach__media {
  position: relative;
  width: min(100%, 440px);
  min-height: 420px;
  justify-self: start;
  padding-right: clamp(18px, 4vw, 36px);
}

.medical-specialist-outreach__media-offset {
  position: absolute;
  inset: 0 0 0 auto;
  width: calc(100% - clamp(18px, 4vw, 36px));
  height: 100%;
  transform: translateX(clamp(18px, 4vw, 36px));
}

.medical-specialist-outreach__media-image-wrap {
  position: relative;
  width: calc(100% - clamp(18px, 4vw, 36px));
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.medical-specialist-outreach__media-image {
  width: 100%;
  height: 100%;
}

.medical-specialist-outreach__media img {
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 1279px) {
  .medical-specialist-outreach__inner {
    grid-template-columns: 1fr;
  }

  .medical-specialist-outreach__media {
    justify-self: center;
    padding-right: clamp(14px, 3vw, 26px);
  }

  .medical-specialist-outreach__media-offset {
    width: calc(100% - clamp(14px, 3vw, 26px));
    transform: translateX(clamp(14px, 3vw, 26px));
  }

  .medical-specialist-outreach__media-image-wrap {
    width: calc(100% - clamp(14px, 3vw, 26px));
  }
}

@media (max-width: 1199px) {
  .medical-specialist-outreach__copy {
    justify-items: center;
    text-align: center;
  }

  .medical-specialist-outreach__cta {
    width: 100%;
  }
}

@media (max-width: 809px) {
  .medical-specialist-outreach__heading {
    font-size: 38px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-outreach__media {
    min-height: 0;
    height: auto;
    width: min(100%, 400px);
    padding-right: clamp(10px, 2.4vw, 18px);
  }

  .medical-specialist-outreach__media-offset {
    width: calc(100% - clamp(10px, 2.4vw, 18px));
    transform: translateX(clamp(10px, 2.4vw, 18px));
  }

  .medical-specialist-outreach__media-image-wrap {
    width: calc(100% - clamp(10px, 2.4vw, 18px));
  }

  .medical-specialist-outreach__media img {
    height: auto;
  }
}
`;

const MedicalSpecialistOutreachComponent = (
  props: MedicalSpecialistOutreachProps & {
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
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const resolvedHeading = resolveComponentData(
    props.heading.text as any,
    locale,
    documentData,
  );
  const headingText =
    typeof resolvedHeading === "string" || typeof resolvedHeading === "number"
      ? String(resolvedHeading).trim() || "Community Outreach"
      : "Community Outreach";
  const descriptionStyleOverrides = getRichTextStyleOverrides(
    props.description.styles,
    props.description.fontColor,
    sectionForeground,
  );
  const descriptionValue = resolveComponentData(
    props.description.text as any,
    locale,
    documentData,
    { richTextStyleOverrides: descriptionStyleOverrides },
  );
  const resolvedImageValue = resolveComponentData(
    props.image.image as any,
    locale,
    documentData,
  );
  const localizedImage =
    resolvedImageValue && typeof resolvedImageValue === "object"
      ? (resolveLocalizedAssetImage(
          resolvedImageValue as TranslatableAssetImage | ImageType,
          locale,
        ) ?? (resolvedImageValue as OutreachImageValue))
      : undefined;
  const outreachImage = hasImageUrl(localizedImage)
    ? localizedImage
    : undefined;
  const normalizedDescription: RichText | string | undefined =
    typeof descriptionValue === "string"
      ? descriptionValue
      : descriptionValue &&
          typeof descriptionValue === "object" &&
          ("html" in descriptionValue || "json" in descriptionValue)
        ? (descriptionValue as RichText)
        : undefined;

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistOutreach${getAnalyticsScopeHash(props.id)}`}
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
            padding: `${verticalPadding} 40px 24px`,
          }}
        >
          <div
            className="medical-specialist-outreach__inner"
            style={{ maxWidth: sectionWidth }}
          >
            <div
              className="medical-specialist-outreach__media"
              style={{
                aspectRatio:
                  props.image.aspectRatio > 0
                    ? String(props.image.aspectRatio)
                    : undefined,
              }}
            >
              <div
                className="medical-specialist-outreach__media-offset"
                style={{
                  borderRadius:
                    pxOrUndefined(props.image.styles.borderRadius) ?? "20px",
                  backgroundColor: toThemeCss(
                    props.imageBackgroundColor?.selectedColor,
                    "var(--colors-palette-primary)",
                  ),
                }}
              />
              <div
                className="medical-specialist-outreach__media-image-wrap"
                style={{
                  borderRadius:
                    pxOrUndefined(props.image.styles.borderRadius) ?? "20px",
                }}
              >
                {outreachImage ? (
                  <EntityField
                    displayName="Outreach Image"
                    fieldId={props.image.image.field}
                    constantValueEnabled={
                      props.image.image.constantValueEnabled
                    }
                    fullHeight
                  >
                    <Image
                      image={outreachImage}
                      className="medical-specialist-outreach__media-image"
                      style={{
                        objectFit:
                          props.image.imageConstrain === "fixed"
                            ? "contain"
                            : "cover",
                      }}
                    />
                  </EntityField>
                ) : null}
              </div>
            </div>
            <div className="medical-specialist-outreach__copy">
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  className="medical-specialist-outreach__heading"
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
                  className="medical-specialist-outreach__description"
                  style={getTextStyle(
                    props.description.styles,
                    props.description.fontColor,
                    "'Krub', 'Krub Fallback', sans-serif",
                    sectionForeground,
                  )}
                >
                  {React.isValidElement(descriptionValue) ? (
                    descriptionValue
                  ) : (
                    <MaybeRTF
                      data={normalizedDescription}
                      richTextStyleOverrides={descriptionStyleOverrides}
                    />
                  )}
                </div>
              </EntityField>
              <EntityField
                displayName="Outreach CTA"
                fieldId={props.cta.data?.cta.field}
                constantValueEnabled={props.cta.data?.cta.constantValueEnabled}
              >
                <ComprehensiveCTA
                  value={props.cta as Partial<ComprehensiveCTAValue>}
                  className="medical-specialist-outreach__cta"
                  eventName="outreachCta"
                  target={getTarget(
                    props.cta.data?.openInNewTab ?? false,
                    props.puck.isEditing,
                  )}
                  style={getButtonStyle(props.cta)}
                />
              </EntityField>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistOutreach: YextComponentConfig<MedicalSpecialistOutreachProps> =
  {
    label: "Outreach",
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
      imageBackgroundColor: {
        label: "Image Background Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      image: {
        label: "Outreach Image",
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
        styles: { contentWidth: "1280px", verticalPadding: "16px" },
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Community Outreach",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
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
      imageBackgroundColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vulputate augue id velit commodo, sit amet dapibus dui feugiat.",
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
                defaultValue: "View Community Calendar",
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
          color: undefined,
          button: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            letterSpacing: "default",
            borderRadius: "default",
          },
          link: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            letterSpacing: "default",
            includeCaret: "default",
          },
        },
      },
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
            width: 1267,
            height: 1900,
            alternateText: "Outreach image",
          },
          constantValueEnabled: true,
        },
        aspectRatio: 0.75,
        imageConstrain: "filled",
        styles: { borderRadius: "9999px" },
      },
    },
    render: (props) => <MedicalSpecialistOutreachComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistOutreach",
  displayName: "Outreach",
  description: "Outreach",
  pageSetTypes: ["ENTITY"],
};
