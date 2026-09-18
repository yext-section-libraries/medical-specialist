import type { SectionConfig } from "@yext/visual-editor";
import {
  aspectRatioOptions,
  getContrastTextColor,
  getReadableSectionForeground,
  getRichTextStyleOverrides,
  getTextColorCss,
  getTextStyle,
  getThemeToken,
  hasImageUrl,
  pxOrUndefined,
  toThemeCss,
} from "../shared/sectionHelpers";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";

import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  type ComprehensiveCTAValue,
  getDefaultRTF,
  getSurfaceColorStyle,
  Image,
  MaybeRTF,
  resolveComponentData,
  resolveLocalizedAssetImage,
  useDocument,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  type RichText,
  type StyledImageValue,
  type StyledLinkValue,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "@yext/visual-editor";

type ImageConstantValue = {
  url?: string;
  width?: number;
  height?: number;
  alternateText?: string;
  assetImage?: unknown;
};

type ImageFieldValue = ImageConstantValue | TranslatableAssetImage;

type TextBlock = {
  text: YextEntityField<TranslatableString | any>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type RichTextBlock = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type ResourceLink = {
  label?: YextEntityField<TranslatableString | any>;
  cta: {
    data?: ComprehensiveCTAValue["data"];
    styles?: ComprehensiveCTAValue["styles"];
    className?: string;
    eventName?: string;
  };
};

type MedicalSpecialistAboutProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  heading: TextBlock;
  bodyText: RichTextBlock;
  imageUrl: {
    image: YextEntityField<ImageFieldValue>;
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
    styles?: StyledImageValue;
  };
  resourceLinks: ResourceLink[];
};

const defaultResourceLinkStyles: StyledLinkValue = {
  fontFamily: "'Krub', 'Krub Fallback', sans-serif",
  fontSize: "14px",
  fontWeight: "500",
  fontStyle: "default",
  textTransform: "default",
  letterSpacing: "-0.02em",
  includeCaret: "none",
};

const defaultResourceLinkColor: ThemeColor = {
  selectedColor: "palette-primary",
  contrastingColor: "palette-primary-contrast",
};

const defaultResourceLinkButtonStyles = {
  fontFamily: defaultResourceLinkStyles.fontFamily,
  fontSize: defaultResourceLinkStyles.fontSize,
  fontWeight: defaultResourceLinkStyles.fontWeight,
  fontStyle: defaultResourceLinkStyles.fontStyle,
  textTransform: defaultResourceLinkStyles.textTransform,
  letterSpacing: defaultResourceLinkStyles.letterSpacing,
  borderRadius: "8px",
};

const getLinkStyle = (value: ResourceLink["cta"]): React.CSSProperties => {
  const buttonStyles = value.styles?.button;
  const ctaColor = value.styles?.color ?? defaultResourceLinkColor;
  const variant = value.styles?.variant ?? "secondary";
  const accentColor = toThemeCss(
    getThemeToken(ctaColor, "palette-primary"),
    "#7d9e77",
  );

  return {
    fontFamily:
      buttonStyles?.fontFamily === "default" || !buttonStyles?.fontFamily
        ? "'Krub', 'Krub Fallback', sans-serif"
        : buttonStyles.fontFamily,
    fontSize:
      pxOrUndefined(buttonStyles?.fontSize) ??
      defaultResourceLinkStyles.fontSize,
    fontWeight:
      pxOrUndefined(buttonStyles?.fontWeight) ??
      defaultResourceLinkStyles.fontWeight,
    fontStyle:
      buttonStyles?.fontStyle === "default"
        ? undefined
        : buttonStyles?.fontStyle,
    textTransform:
      buttonStyles?.textTransform === "default"
        ? undefined
        : buttonStyles?.textTransform,
    letterSpacing:
      pxOrUndefined(buttonStyles?.letterSpacing) ??
      defaultResourceLinkStyles.letterSpacing,
    borderRadius: pxOrUndefined(buttonStyles?.borderRadius) ?? "8px",
    color:
      variant === "primary"
        ? getContrastTextColor(ctaColor)
        : getTextColorCss(ctaColor, undefined, "#7d9e77"),
    backgroundColor:
      variant === "primary" ? accentColor : "rgba(255, 255, 255, 0.7)",
    border: variant === "link" ? "none" : `1px solid ${accentColor}`,
  };
};

const getResourceLinkVariant = (
  value: ResourceLink["cta"],
): "primary" | "secondary" | "link" => {
  if (value.styles?.variant === "link") {
    return "link";
  }

  return value.styles?.variant === "primary" ? "primary" : "secondary";
};

const getResourceLinkSummary = (
  item: ResourceLink | undefined,
  index?: number,
) => {
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
  return `Resource Link ${(index ?? 0) + 1}`;
};

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

.medical-specialist-about__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: start;
}

.medical-specialist-about__media {
  min-height: 420px;
  overflow: hidden;
}

.medical-specialist-about__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.medical-specialist-about__copy {
  display: grid;
  gap: 16px;
  text-align: center;
  justify-items: center;
}

.medical-specialist-about__resource-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
  justify-content: center;
}

.medical-specialist-about__resource-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid currentColor;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.7);
  transition: background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.medical-specialist-about__resource-link--link {
  padding: 0;
  border-radius: 0;
  background: transparent;
}

.medical-specialist-about__resource-link:hover,
.medical-specialist-about__resource-link:focus-visible {
  background: rgba(125, 158, 119, 0.12);
  box-shadow: 0 10px 24px rgba(125, 158, 119, 0.14);
  transform: translateY(-1px);
  outline: 2px solid rgba(125, 158, 119, 0.3);
  outline-offset: 3px;
}

.medical-specialist-about__heading {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-about__paragraph {
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

@media (max-width: 1199px) {
  .medical-specialist-about__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 809px) {
  .medical-specialist-about__heading {
    font-size: 28px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-about__media {
    min-height: 0;
    height: auto;
  }

  .medical-specialist-about__media img {
    height: auto;
  }

  .medical-specialist-about__resource-links {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }

  .medical-specialist-about__resource-link {
    width: 100%;
  }
}
`;

const isRichText = (value: unknown): value is RichText =>
  typeof value === "object" &&
  value !== null &&
  ("html" in value || "json" in value);

const MedicalSpecialistAboutComponent = (
  props: MedicalSpecialistAboutProps & { id: string; puck: any },
) => {
  const streamDocument = useDocument<Record<string, unknown>>();
  const locale =
    typeof streamDocument?.meta === "object" &&
    streamDocument.meta &&
    typeof (streamDocument.meta as { locale?: unknown }).locale === "string"
      ? String((streamDocument.meta as { locale?: unknown }).locale)
      : typeof streamDocument?.locale === "string"
        ? streamDocument.locale
        : "en";
  const resolvedHeadingText = resolveComponentData(
    props.heading.text as any,
    locale,
    streamDocument,
  );
  const headingConstantValue = props.heading.text?.constantValue;
  const headingFallback =
    typeof headingConstantValue === "string" ||
    typeof headingConstantValue === "number"
      ? String(headingConstantValue)
      : headingConstantValue &&
          typeof headingConstantValue === "object" &&
          "text" in headingConstantValue &&
          (typeof headingConstantValue.text === "string" ||
            typeof headingConstantValue.text === "number")
        ? String(headingConstantValue.text)
        : headingConstantValue &&
            typeof headingConstantValue === "object" &&
            "defaultValue" in headingConstantValue &&
            (typeof headingConstantValue.defaultValue === "string" ||
              typeof headingConstantValue.defaultValue === "number")
          ? String(headingConstantValue.defaultValue)
          : "About Us";
  const resolvedHeadingRecord =
    resolvedHeadingText && typeof resolvedHeadingText === "object"
      ? (resolvedHeadingText as Record<string, unknown>)
      : undefined;
  const headingText = (
    typeof resolvedHeadingText === "string" ||
    typeof resolvedHeadingText === "number"
      ? String(resolvedHeadingText)
      : typeof resolvedHeadingRecord?.text === "string"
        ? resolvedHeadingRecord.text
        : typeof resolvedHeadingRecord?.text === "number"
          ? String(resolvedHeadingRecord.text)
          : typeof resolvedHeadingRecord?.defaultValue === "string"
            ? resolvedHeadingRecord.defaultValue
            : typeof resolvedHeadingRecord?.defaultValue === "number"
              ? String(resolvedHeadingRecord.defaultValue)
              : headingFallback
  ).trim();
  const resolvedBodyText = resolveComponentData(
    props.bodyText.text as any,
    locale,
    streamDocument,
  );
  const resolvedImageField = resolveComponentData(
    props.imageUrl.image as any,
    locale,
    streamDocument,
  );
  const localizedImage =
    resolvedImageField && typeof resolvedImageField === "object"
      ? ((resolveLocalizedAssetImage(
          resolvedImageField as TranslatableAssetImage,
          locale,
        ) ?? resolvedImageField) as ImageConstantValue)
      : undefined;
  const aboutImage = hasImageUrl(localizedImage) ? localizedImage : undefined;
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistAbout${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{styles}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
              { fallbackBackgroundColor: "#fdf7f4" },
            ),
            padding: `${verticalPadding} 40px`,
          }}
        >
          <div
            className="medical-specialist-about__inner"
            style={{ maxWidth: sectionWidth }}
          >
            <div className="medical-specialist-about__copy">
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  className="medical-specialist-about__heading"
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
              {resolvedBodyText ? (
                <EntityField
                  displayName="Body Text"
                  fieldId={props.bodyText.text.field}
                  constantValueEnabled={
                    props.bodyText.text.constantValueEnabled
                  }
                >
                  <div
                    className="medical-specialist-about__paragraph"
                    style={getTextStyle(
                      props.bodyText.styles,
                      props.bodyText.fontColor,
                      "'Krub', 'Krub Fallback', sans-serif",
                      sectionForeground,
                    )}
                  >
                    {React.isValidElement(resolvedBodyText) ? (
                      resolvedBodyText
                    ) : (
                      <MaybeRTF
                        data={
                          typeof resolvedBodyText === "string" ||
                          isRichText(resolvedBodyText)
                            ? resolvedBodyText
                            : undefined
                        }
                        richTextStyleOverrides={getRichTextStyleOverrides(
                          props.bodyText.styles,
                          props.bodyText.fontColor,
                          sectionForeground,
                        )}
                      />
                    )}
                  </div>
                </EntityField>
              ) : null}
              {(props.resourceLinks ?? []).length > 0 ? (
                <div className="medical-specialist-about__resource-links">
                  {(props.resourceLinks ?? []).map((link, index) =>
                    (() => {
                      const linkVariant = getResourceLinkVariant(link.cta);
                      const resolvedLabel = resolveComponentData(
                        link.label as any,
                        locale,
                        streamDocument,
                      );
                      const labelConstantValue = link.label?.constantValue;
                      const labelConstantRecord =
                        labelConstantValue &&
                        typeof labelConstantValue === "object"
                          ? (labelConstantValue as Record<string, unknown>)
                          : undefined;
                      const labelFallback =
                        typeof labelConstantValue === "string" ||
                        typeof labelConstantValue === "number"
                          ? String(labelConstantValue)
                          : typeof labelConstantRecord?.text === "string"
                            ? labelConstantRecord.text
                            : typeof labelConstantRecord?.text === "number"
                              ? String(labelConstantRecord.text)
                              : typeof labelConstantRecord?.defaultValue ===
                                  "string"
                                ? labelConstantRecord.defaultValue
                                : typeof labelConstantRecord?.defaultValue ===
                                    "number"
                                  ? String(labelConstantRecord.defaultValue)
                                  : `Resource Link ${index + 1}`;
                      const resolvedLabelRecord =
                        resolvedLabel && typeof resolvedLabel === "object"
                          ? (resolvedLabel as Record<string, unknown>)
                          : undefined;
                      const label = (
                        typeof resolvedLabel === "string" ||
                        typeof resolvedLabel === "number"
                          ? String(resolvedLabel)
                          : typeof resolvedLabelRecord?.text === "string"
                            ? resolvedLabelRecord.text
                            : typeof resolvedLabelRecord?.text === "number"
                              ? String(resolvedLabelRecord.text)
                              : typeof resolvedLabelRecord?.defaultValue ===
                                  "string"
                                ? resolvedLabelRecord.defaultValue
                                : typeof resolvedLabelRecord?.defaultValue ===
                                    "number"
                                  ? String(resolvedLabelRecord.defaultValue)
                                  : labelFallback
                      ).trim();

                      return (
                        <EntityField
                          key={`${label}-${index}`}
                          displayName="Resource Link"
                          fieldId={link.cta.data?.cta.field}
                          constantValueEnabled={
                            link.cta.data?.cta.constantValueEnabled
                          }
                        >
                          <ComprehensiveCTA
                            value={link.cta as Partial<ComprehensiveCTAValue>}
                            className={`medical-specialist-about__resource-link${
                              linkVariant === "link"
                                ? " medical-specialist-about__resource-link--link"
                                : ""
                            }`}
                            eventName={`aboutResourceLink${index}`}
                            target={
                              link.cta.data?.openInNewTab
                                ? "_blank"
                                : props.puck.isEditing
                                  ? undefined
                                  : "_top"
                            }
                            style={getLinkStyle(link.cta)}
                          />
                        </EntityField>
                      );
                    })(),
                  )}
                </div>
              ) : null}
            </div>
            {aboutImage ? (
              <EntityField
                displayName="Image"
                fieldId={props.imageUrl.image.field}
                constantValueEnabled={props.imageUrl.image.constantValueEnabled}
              >
                <div
                  className="medical-specialist-about__media"
                  style={{
                    aspectRatio:
                      props.imageUrl.aspectRatio > 0
                        ? String(props.imageUrl.aspectRatio)
                        : undefined,
                    borderRadius:
                      pxOrUndefined(props.imageUrl.styles?.borderRadius) ??
                      "20px",
                  }}
                >
                  <Image
                    image={aboutImage as any}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        props.imageUrl.imageConstrain === "fixed"
                          ? "contain"
                          : "cover",
                    }}
                  />
                </div>
              </EntityField>
            ) : null}
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistAbout: YextComponentConfig<MedicalSpecialistAboutProps> =
  {
    label: msg("components.about", "About"),
    fields: {
      section: {
        label: msg("fields.section", "Section"),
        type: "object",
        objectFields: {
          backgroundColor: {
            label: msg("fields.backgroundFill", "Background Fill"),
            type: "basicSelector",
            options: "BACKGROUND_COLOR",
          },
          visibleOnLivePage: {
            label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
          styles: { label: msg("fields.sectionStyles", "Section Styles"), type: "styledPageSection" },
        },
      },
      heading: {
        label: msg("fields.heading", "Heading"),
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: msg("fields.text", "Text"),
            filter: {
              types: ["type.string"],
              includeListsOnly: false,
            },
          },
          fontColor: {
            label: msg("fields.textColor", "Text Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
        },
      },
      bodyText: {
        label: msg("fields.bodyText", "Body Text"),
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: msg("fields.text", "Text"),
            filter: {
              types: ["type.rich_text_v2"],
              includeListsOnly: false,
            },
          },
          fontColor: {
            label: msg("fields.textColor", "Text Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
        },
      },
      imageUrl: {
        label: msg("fields.aboutImage", "About Image"),
        type: "object",
        objectFields: {
          image: {
            type: "entityField",
            label: msg("fields.image", "Image"),
            filter: {
              types: ["type.image"],
            },
          },
          aspectRatio: {
            label: msg("fields.aspectRatio", "Aspect Ratio"),
            type: "basicSelector",
            options: aspectRatioOptions,
          },
          imageConstrain: {
            label: msg("fields.imageConstrain", "Image Constrain"),
            type: "select",
            options: [
              { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
              { label: msg("fields.options.filled", "Filled"), value: "filled" },
            ],
          },
          styles: { label: msg("fields.imageStyles", "Image Styles"), type: "styledImage" },
        },
      },
      resourceLinks: {
        label: msg("fields.resourceLinks", "Resource Links"),
        type: "array",
        arrayFields: {
          cta: {
            label: msg("fields.callToAction", "Call to Action"),
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
                    defaultValue: "Resource Link",
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
              color: defaultResourceLinkColor,
              button: defaultResourceLinkButtonStyles,
            },
          },
        },
        getItemSummary: (item: ResourceLink, index?: number) =>
          getResourceLinkSummary(item, index),
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
            defaultValue: "About Us",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "Manrope",
          fontSize: "32px",
          fontWeight: "700",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      bodyText: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Our facility is designed for efficiency and patient comfort. By housing advanced imaging, a high-complexity lab, and a diverse team of specialists under one roof, we ensure that diagnosis and treatment happen in hours, not days.\n\nWe are committed to reducing ER wait times and providing the [[address.city]] community with a higher standard of local healthcare.",
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
      imageUrl: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
            width: 1267,
            height: 1900,
            alternateText: "Medical specialist about image",
          },
          constantValueEnabled: true,
        },
        aspectRatio: 2,
        imageConstrain: "filled",
        styles: { borderRadius: "default" },
      },
      resourceLinks: [
        {
          cta: {
            data: {
              actionType: "link",
              cta: {
                field: "",
                constantValue: {
                  label: {
                    defaultValue: "Online Registration Forms",
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
              color: defaultResourceLinkColor,
              button: defaultResourceLinkButtonStyles,
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
                    defaultValue: "Comprehensive Insurance List",
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
              color: defaultResourceLinkColor,
              button: defaultResourceLinkButtonStyles,
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
                    defaultValue: "Financial Assistance Policy",
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
              color: defaultResourceLinkColor,
              button: defaultResourceLinkButtonStyles,
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
                    defaultValue: "Telehealth Sign-In",
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
              color: defaultResourceLinkColor,
              button: defaultResourceLinkButtonStyles,
            },
          },
        },
      ],
    },
    render: (props) => <MedicalSpecialistAboutComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistAbout",
  displayName: "About",
  description: "About",
  pageSetTypes: ["ENTITY"],
};
