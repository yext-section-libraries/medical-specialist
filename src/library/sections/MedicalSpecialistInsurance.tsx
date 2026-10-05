import "../shared/typography.css";

import type { SectionConfig } from "@yext/visual-editor";
import {
  getReadableSectionForeground,
  getRichTextStyleOverrides,
  getTextStyle,
  pxOrUndefined,
} from "../shared/sectionHelpers";

import * as React from "react";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";

import {
  msg,
  Background,
  createItemSource,
  EntityField,
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

type InsuranceGroupFields = {
  title: YextEntityField<TranslatableString>;
  contents: YextEntityField<TranslatableRichText>;
};

const insuranceGroupsSource = createItemSource<InsuranceGroupFields>({
  label: msg("fields.insuranceGroups", "Insurance Groups"),
  mappingFields: {
    title: {
      type: "entityField",
      label: msg("fields.title", "Title"),
      filter: {
        types: ["type.string"],
        includeListsOnly: false,
      },
    },
    contents: {
      type: "entityField",
      label: msg("fields.contents", "Contents"),
      filter: {
        types: ["type.rich_text_v2"],
        includeListsOnly: false,
      },
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Private / Commercial Insurance",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      contents: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Lorem ipsum alpha\nDolor sit beta\nAmet gamma coverage",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Public Programs",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      contents: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Lorem public one\nDolor support two\nAmet access three",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Supplemental Options",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      contents: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Lorem add-on\nIpsum flexible option\nDolor premium rider",
          ),
          hasLocalizedValue: "true",
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

type MedicalSpecialistInsuranceProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  accordionItemBackgroundColor: ThemeColor;
  heading: TextBlock;
  description: RichTextBlock;
  summaryStyles: StyledTextValue;
  summaryColor?: ThemeColor;
  bodyStyles: StyledTextValue;
  bodyColor?: ThemeColor;
  groups: typeof insuranceGroupsSource.value;
};

const isRichText = (value: unknown): value is RichText =>
  typeof value === "object" &&
  value !== null &&
  ("html" in value || "json" in value);

const styles = `
.medical-specialist-insurance__wrap {
  max-width: var(--maxWidth-pageSection-contentWidth);
  margin: 0 auto;
  padding: 24px;
}

.medical-specialist-insurance__heading {
  margin: 0 0 12px;
  text-align: center;
  line-height: 1.1;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-insurance__description {
  margin: 0 0 32px;
  text-align: center;
  line-height: 1.5;
}

.medical-specialist-insurance__accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: var(--maxWidth-pageSection-contentWidth);
  margin: 0 auto;
}

.medical-specialist-insurance__item {
  border: 1px solid rgba(38, 14, 1, 0.18);
  border-radius: var(--borderRadius-image-borderRadius);
  background: var(--colors-palette-secondary);
  padding: 14px 16px;
}

.medical-specialist-insurance__item summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.medical-specialist-insurance__item summary::-webkit-details-marker {
  display: none;
}

.medical-specialist-insurance__item summary::after {
  content: "+";
  font-size: var(--fontSize-body-fontSize);
  line-height: 1;
  color: inherit;
}

.medical-specialist-insurance__item[open] summary::after {
  content: "-";
}

.medical-specialist-insurance__item ul {
  margin: 12px 0 4px;
  padding-left: 22px;
}

.medical-specialist-insurance__item li {
  line-height: 1.5;
}

@media (max-width: 809px) {
  .medical-specialist-insurance__heading {
  }
}
`;

const MedicalSpecialistInsuranceComponent = (
  props: MedicalSpecialistInsuranceProps & { id: string; puck: any },
) => {
  const analytics = useAnalytics();
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
          : "Insurance Accepted";
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
  const descriptionStyleOverrides = getRichTextStyleOverrides(
    props.description.styles,
    props.description.fontColor,
    getReadableSectionForeground(props.section.backgroundColor),
  );
  const resolvedDescriptionText = resolveComponentData(
    props.description.text as any,
    locale,
    streamDocument,
  );
  const bodyStyleOverrides = getRichTextStyleOverrides(
    props.bodyStyles,
    props.bodyColor,
    getReadableSectionForeground(props.accordionItemBackgroundColor),
  );
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "var(--maxWidth-pageSection-contentWidth)";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "var(--padding-pageSection-verticalPadding)";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const accordionItemForeground = getReadableSectionForeground(
    props.accordionItemBackgroundColor,
  );
  const insuranceGroups = insuranceGroupsSource.resolveItems(
    props.groups,
    streamDocument,
  );

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistInsurance${getAnalyticsScopeHash(props.id)}`}
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
            className="medical-specialist-insurance__wrap"
            style={{ maxWidth: sectionWidth }}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="medical-specialist-insurance__heading"
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
              constantValueEnabled={props.description.text.constantValueEnabled}
            >
              <div
                className="medical-specialist-insurance__description"
                style={getTextStyle(
                  props.description.styles,
                  props.description.fontColor,
                  "var(--fontFamily-body-fontFamily)",
                  sectionForeground,
                )}
              >
                {React.isValidElement(resolvedDescriptionText) ? (
                  resolvedDescriptionText
                ) : (
                  <MaybeRTF
                    data={
                      typeof resolvedDescriptionText === "string" ||
                      isRichText(resolvedDescriptionText)
                        ? resolvedDescriptionText
                        : undefined
                    }
                    richTextStyleOverrides={descriptionStyleOverrides}
                  />
                )}
              </div>
            </EntityField>
            <EntityField
              displayName="Insurance Groups"
              fieldId={props.groups.field}
              constantValueEnabled={props.groups.constantValueEnabled}
            >
              <div className="medical-specialist-insurance__accordion">
                {insuranceGroups.map((group, index) => {
                  const title =
                    resolveComponentData(group.title, locale, streamDocument, {
                      output: "plainText",
                    }).trim() || `Group ${index + 1}`;
                  const resolvedContents = group.contents
                    ? resolveComponentData(
                        group.contents,
                        locale,
                        streamDocument,
                      )
                    : undefined;

                  return (
                    <details
                      className="medical-specialist-insurance__item"
                      key={`${title}-${index}`}
                      open={index === 0}
                      style={{
                        ...getSurfaceColorStyle(
                          props.accordionItemBackgroundColor,
                          streamDocument,
                        ),
                      }}
                      onToggle={(event) =>
                        analytics?.track({
                          action: (event.currentTarget as HTMLDetailsElement)
                            .open
                            ? "EXPAND"
                            : "COLLAPSE",
                          eventName: `insuranceAccordion${index}`,
                        })
                      }
                    >
                      <summary
                        style={getTextStyle(
                          props.summaryStyles,
                          props.summaryColor,
                          "var(--fontFamily-h2-fontFamily)",
                          accordionItemForeground,
                        )}
                      >
                        {title}
                      </summary>
                      <div
                        style={getTextStyle(
                          props.bodyStyles,
                          props.bodyColor,
                          "var(--fontFamily-body-fontFamily)",
                          accordionItemForeground,
                        )}
                      >
                        {React.isValidElement(resolvedContents) ? (
                          resolvedContents
                        ) : (
                          <MaybeRTF
                            data={
                              typeof resolvedContents === "string" ||
                              isRichText(resolvedContents)
                                ? resolvedContents
                                : undefined
                            }
                            richTextStyleOverrides={bodyStyleOverrides}
                          />
                        )}
                      </div>
                    </details>
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

export const MedicalSpecialistInsurance: YextComponentConfig<MedicalSpecialistInsuranceProps> =
  {
    label: msg("components.medicalSpecialistInsurance", "Insurance Section"),
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
      groups: insuranceGroupsSource.field,
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
      accordionItemBackgroundColor: {
        label: msg("fields.accordionItemBackgroundColor", "Accordion Item Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
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
      summaryStyles: { label: msg("fields.summaryStyles", "Summary Styles"), type: "styledText" },
      summaryColor: {
        label: msg("fields.summaryColor", "Summary Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      bodyStyles: { label: msg("fields.bodyStyles", "Body Styles"), type: "styledText" },
      bodyColor: {
        label: msg("fields.bodyColor", "Body Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
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
            defaultValue: "Insurance Accepted",
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
      accordionItemBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at commodo metus, ut posuere nibh.",
            ),
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
      summaryStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      summaryColor: undefined,
      bodyStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      bodyColor: undefined,
      groups: insuranceGroupsSource.defaultValue,
    },
    render: (props) => <MedicalSpecialistInsuranceComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistInsurance",
  displayName: "Insurance Section",
  description: "Insurance Section",
  pageSetTypes: ["ENTITY"],
};
