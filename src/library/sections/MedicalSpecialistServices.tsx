import type { SectionConfig } from "@yext/visual-editor";
import {
  getReadableSectionForeground,
  getRichTextStyleOverrides,
  getTextStyle,
  pxOrUndefined,
} from "../shared/sectionHelpers";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";

import {
  Background,
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  type ComprehensiveCTAValue,
  getDefaultRTF,
  getSurfaceColorStyle,
  MaybeRTF,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  type RichText,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "@yext/visual-editor";

type ServiceCardFields = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: ComprehensiveCTAValue;
};

const getDefaultServiceCardCta = (label: string): ComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        ctaType: "textAndLink",
        label: {
          defaultValue: label,
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
    button: {
      fontFamily: "'Krub', 'Krub Fallback', sans-serif",
      fontSize: "16px",
      fontWeight: "500",
      fontStyle: "default",
      textTransform: "default",
      letterSpacing: "-0.02em",
      borderRadius: "6px",
    },
    link: {
      fontFamily: "'Krub', 'Krub Fallback', sans-serif",
      fontSize: "16px",
      fontWeight: "500",
      fontStyle: "default",
      textTransform: "default",
      letterSpacing: "-0.02em",
      includeCaret: "none",
    },
  },
});

const serviceCardsSource = createItemSource<ServiceCardFields>({
  label: "Service Cards",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"], includeListsOnly: false },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"], includeListsOnly: false },
    },
    cta: { type: "comprehensiveCTA", label: "Call to Action" },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Urgent Care & Express Care",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer bibendum purus at ex feugiat tristique.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      cta: getDefaultServiceCardCta("View Lorem Guide"),
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Primary Care Services",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nulla facilisi etiam dignissim diam.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      cta: getDefaultServiceCardCta("Explore Ipsum Details"),
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Diagnostic Imaging",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      cta: getDefaultServiceCardCta("Read Dolor Notes"),
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Lab & Screening Support",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      cta: getDefaultServiceCardCta("Open Amet Brief"),
    },
  ],
});

type TextBlock = {
  text: YextEntityField<TranslatableString>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type MedicalSpecialistServicesProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  heading: TextBlock;
  cardTitleStyles: StyledTextValue;
  cardTitleColor?: ThemeColor;
  bodyStyles: StyledTextValue;
  bodyColor?: ThemeColor;
  cardBackgroundColor: ThemeColor;
  cards: typeof serviceCardsSource.value;
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

.medical-specialist-services__inner {
  width: 100%;
  margin: 0 auto;
}

.medical-specialist-services__heading {
  margin: 0;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-services__grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.medical-specialist-services__card {
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(38, 14, 1, 0.12);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.medical-specialist-services__title {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-services__description {
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

.medical-specialist-services__cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  min-height: 40px;
  padding: 0;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.medical-specialist-services__cta--button {
  padding: 0 16px;
  border-bottom: none;
}

.medical-specialist-services__cta:hover,
.medical-specialist-services__cta:focus-visible {
  opacity: 0.82;
  outline: 2px solid rgba(125, 158, 119, 0.6);
  outline-offset: 3px;
}

@media (max-width: 1199px) {
  .medical-specialist-services__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 809px) {
  .medical-specialist-services__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-services__title {
    font-size: 22px !important;
    line-height: 1.12 !important;
  }

  .medical-specialist-services__grid {
    grid-template-columns: 1fr;
  }

  .medical-specialist-services__card {
    align-items: center;
    text-align: center;
  }

  .medical-specialist-services__cta {
    width: 100%;
    justify-content: center;
  }
}
`;

const MedicalSpecialistServicesComponent = (
  props: MedicalSpecialistServicesProps & { id: string; puck: any },
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
          : "Medical Services";
  const resolvedHeadingRecord =
    resolvedHeadingText && typeof resolvedHeadingText === "object"
      ? (resolvedHeadingText as Record<string, unknown>)
      : undefined;
  const headingText = (
    typeof resolvedHeadingText === "string" ||
    typeof resolvedHeadingText === "number"
      ? String(resolvedHeadingText)
      : resolvedHeadingRecord && typeof resolvedHeadingRecord.text === "string"
        ? resolvedHeadingRecord.text
        : resolvedHeadingRecord &&
            typeof resolvedHeadingRecord.text === "number"
          ? String(resolvedHeadingRecord.text)
          : resolvedHeadingRecord &&
              typeof resolvedHeadingRecord.defaultValue === "string"
            ? resolvedHeadingRecord.defaultValue
            : resolvedHeadingRecord &&
                typeof resolvedHeadingRecord.defaultValue === "number"
              ? String(resolvedHeadingRecord.defaultValue)
              : headingFallback
  ).trim();
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1200px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const cardForeground = getReadableSectionForeground(
    props.cardBackgroundColor,
  );
  const bodyStyleOverrides = getRichTextStyleOverrides(
    props.bodyStyles,
    props.bodyColor,
    cardForeground,
  );
  const serviceCards = serviceCardsSource.resolveItems(
    props.cards,
    streamDocument,
  );

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistServices${getAnalyticsScopeHash(props.id)}`}
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
            className="medical-specialist-services__inner"
            style={{ maxWidth: sectionWidth }}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="medical-specialist-services__heading"
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
              displayName="Service Cards"
              fieldId={props.cards.field}
              constantValueEnabled={props.cards.constantValueEnabled}
            >
              <div className="medical-specialist-services__grid">
                {serviceCards.map((card, index) => {
                  const title =
                    resolveComponentData(card.title, locale, streamDocument, {
                      output: "plainText",
                    }).trim() || `Card ${index + 1}`;
                  const resolvedDescription = card.description
                    ? resolveComponentData(
                        card.description,
                        locale,
                        streamDocument,
                      )
                    : undefined;
                  const ctaValue: ComprehensiveCTAValue | undefined = card.cta
                    .data.cta
                    ? {
                        data: {
                          ...card.cta.data,
                          cta: {
                            field: "",
                            constantValue: card.cta.data.cta,
                            constantValueEnabled: true,
                            selectedType:
                              card.cta.data.cta.ctaType ?? "textAndLink",
                          },
                        },
                        styles: card.cta.styles,
                      }
                    : undefined;
                  return (
                    <article
                      key={`${title}-${index}`}
                      className="medical-specialist-services__card"
                      style={{
                        ...getSurfaceColorStyle(
                          props.cardBackgroundColor,
                          streamDocument,
                          {
                            fallbackBackgroundColor:
                              "rgba(255, 255, 255, 0.45)",
                          },
                        ),
                      }}
                    >
                      <h3
                        className="medical-specialist-services__title"
                        style={getTextStyle(
                          props.cardTitleStyles,
                          props.cardTitleColor,
                          '"Manrope", Inter, sans-serif',
                          cardForeground,
                        )}
                      >
                        {title}
                      </h3>
                      <div
                        className="medical-specialist-services__description"
                        style={getTextStyle(
                          props.bodyStyles,
                          props.bodyColor,
                          "'Krub', 'Krub Fallback', sans-serif",
                          cardForeground,
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
                            richTextStyleOverrides={bodyStyleOverrides}
                          />
                        )}
                      </div>
                      {ctaValue ? (
                        <ComprehensiveCTA
                          className={`medical-specialist-services__cta${
                            ctaValue.styles.variant !== "link"
                              ? " medical-specialist-services__cta--button"
                              : ""
                          }`}
                          value={ctaValue}
                          eventName={`servicesCta${index}`}
                          target={
                            ctaValue.data.openInNewTab
                              ? "_blank"
                              : props.puck.isEditing
                                ? undefined
                                : "_top"
                          }
                        />
                      ) : null}
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

export const MedicalSpecialistServices: YextComponentConfig<MedicalSpecialistServicesProps> =
  {
    label: "Services",
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
      cards: serviceCardsSource.field,
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
      cardTitleStyles: { label: "Card Title Styles", type: "styledText" },
      cardTitleColor: {
        label: "Card Title Color",
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
            defaultValue: "Medical Services",
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
      bodyColor: undefined,
      cardBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      cards:
        serviceCardsSource.defaultValue as MedicalSpecialistServicesProps["cards"],
    },
    render: (props) => (
      <MedicalSpecialistServicesComponent
        {...(props as MedicalSpecialistServicesProps & typeof props)}
      />
    ),
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistServices",
  displayName: "Services",
  description: "Services",
  pageSetTypes: ["ENTITY"],
};
