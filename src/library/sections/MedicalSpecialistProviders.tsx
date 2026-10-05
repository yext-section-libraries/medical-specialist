import "../shared/typography.css";

import type { SectionConfig } from "@yext/visual-editor";
import {
  aspectRatioOptions,
  getReadableSectionForeground,
  getRichTextStyleOverrides,
  getTextStyle,
  pxOrUndefined,
  toThemeCss,
} from "../shared/sectionHelpers";

import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  AnalyticsScopeProvider,
  type ComplexImageType,
  type ImageType,
} from "@yext/pages-components";

import {
  msg,
  Background,
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  getDefaultRTF,
  getSurfaceColorStyle,
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
  label: msg("fields.providerCards", "Provider Cards"),
  mappingFields: {
    name: {
      type: "entityField",
      label: msg("fields.name", "Name"),
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    role: {
      type: "entityField",
      label: msg("fields.role", "Role"),
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    certificationLabel: {
      type: "entityField",
      label: msg("fields.certificationLabel", "Certification Label"),
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    certificationValue: {
      type: "entityField",
      label: msg("fields.certificationValue", "Certification Value"),
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    specialties: {
      type: "entityField",
      label: msg("fields.specialties", "Specialties"),
      filter: { types: ["type.string"], includeListsOnly: true },
    },
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
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

const getButtonStyle = (
  value: MedicalSpecialistProvidersProps["cta"],
): React.CSSProperties => {
  const buttonStyles = value.styles?.button;
  const buttonColor = value.styles?.color;
  const variant = value.styles?.variant ?? "primary";
  const accentColor = toThemeCss(
    typeof buttonColor === "string" ? buttonColor : buttonColor?.selectedColor,
    "var(--colors-palette-primary)",
  );

  const typography = variant === "link" ? "link" : "button";

  return {
    fontFamily:
      buttonStyles?.fontFamily === "default" || !buttonStyles?.fontFamily
        ? `var(--fontFamily-${typography}-fontFamily)`
        : buttonStyles.fontFamily,
    fontSize: pxOrUndefined(buttonStyles?.fontSize) ?? `var(--fontSize-${typography}-fontSize)`,
    fontWeight: pxOrUndefined(buttonStyles?.fontWeight) ?? `var(--fontWeight-${typography}-fontWeight)`,
    fontStyle:
      buttonStyles?.fontStyle === "default" || !buttonStyles?.fontStyle
        ? `var(--fontStyle-${typography}-fontStyle)`
        : buttonStyles.fontStyle,
    textTransform:
      buttonStyles?.textTransform === "default" || !buttonStyles?.textTransform
        ? `var(--textTransform-${typography}-textTransform)`
        : buttonStyles.textTransform,
    letterSpacing: pxOrUndefined(buttonStyles?.letterSpacing) ?? `var(--letterSpacing-${typography}-letterSpacing)`,
    borderRadius: pxOrUndefined(buttonStyles?.borderRadius) ?? "var(--borderRadius-button-borderRadius)",
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
.medical-specialist-providers__inner {
  max-width: var(--maxWidth-pageSection-contentWidth);
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
  background: var(--colors-palette-secondary);
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: var(--borderRadius-image-borderRadius);
  padding: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.medical-specialist-providers__image {
  height: 300px;
  overflow: hidden;
  border-radius: var(--borderRadius-image-borderRadius);
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
  color: inherit;
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
  }

  .medical-specialist-providers__name {
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
  const { t } = useTranslation();
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
    pxOrUndefined(props.section.styles.contentWidth) ?? "var(--maxWidth-pageSection-contentWidth)";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "var(--padding-pageSection-verticalPadding)";
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
        <Background
          as="section"
          background={props.section.backgroundColor}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
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
                      "var(--fontFamily-h2-fontFamily)",
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
                      "var(--fontFamily-body-fontFamily)",
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
                        ...getSurfaceColorStyle(
                          props.cardBackgroundColor,
                          streamDocument,
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
                              ) ?? "var(--borderRadius-image-borderRadius)",
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
                            "var(--fontFamily-body-fontFamily)",
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
                            "var(--fontFamily-body-fontFamily)",
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
                              "var(--fontFamily-body-fontFamily)",
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
                              "var(--fontFamily-body-fontFamily)",
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
                                "var(--fontFamily-body-fontFamily)",
                                cardForeground,
                              )}
                            >
                              {t("fields.specialties", "Specialties")}
                            </p>
                            <ul
                              className="medical-specialist-providers__specialties"
                              style={getTextStyle(
                                props.bodyStyles,
                                props.bodyColor,
                                "var(--fontFamily-body-fontFamily)",
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
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistProviders: YextComponentConfig<MedicalSpecialistProvidersProps> =
  {
    label: msg("components.medicalSpecialistProviders", "Providers Section"),
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
      cards: providerCardsSource.field,
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
      description: {
        label: msg("fields.description", "Description"),
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
      cta: {
        label: msg("fields.callToAction", "Call to Action"),
        type: "comprehensiveCTA",
      },
      nameStyles: { label: msg("fields.nameStyles", "Name Styles"), type: "styledText" },
      nameColor: {
        label: msg("fields.nameColor", "Name Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      roleStyles: { label: msg("fields.roleStyles", "Role Styles"), type: "styledText" },
      roleColor: {
        label: msg("fields.roleColor", "Role Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      bodyStyles: { label: msg("fields.bodyStyles", "Body Styles"), type: "styledText" },
      bodyColor: {
        label: msg("fields.bodyColor", "Body Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      cardBackgroundColor: {
        label: msg("fields.cardBackgroundColor", "Card Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      cardImage: {
        label: msg("fields.cardImage", "Card Image"),
        type: "object",
        objectFields: {
          styles: { label: msg("fields.imageStyles", "Image Styles"), type: "styledImage" },
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
  displayName: "Providers Section",
  description: "Providers Section",
  pageSetTypes: ["ENTITY"],
};
