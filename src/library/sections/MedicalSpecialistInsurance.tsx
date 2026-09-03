import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";

import {
  createItemSource,
  EntityField,
  getDefaultRTF,
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
  color: getTextColorCss(color, fallbackColorToken),
});

const pxOrUndefined = (value?: string) =>
  !value || value === "default" ? undefined : value;

type InsuranceGroupFields = {
  title: YextEntityField<TranslatableString>;
  contents: YextEntityField<TranslatableRichText>;
};

const insuranceGroupsSource = createItemSource<InsuranceGroupFields>({
  label: "Insurance Groups",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: {
        types: ["type.string"],
        includeListsOnly: false,
      },
    },
    contents: {
      type: "entityField",
      label: "Contents",
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

.medical-specialist-insurance__wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px;
}

.medical-specialist-insurance__heading {
  margin: 0 0 12px;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-insurance__description {
  margin: 0 0 32px;
  text-align: center;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

.medical-specialist-insurance__accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 960px;
  margin: 0 auto;
}

.medical-specialist-insurance__item {
  border: 1px solid rgba(38, 14, 1, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
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
  font-size: 22px;
  line-height: 1;
  color: rgba(38, 14, 1, 0.7);
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
  letter-spacing: -0.02em;
}

@media (max-width: 809px) {
  .medical-specialist-insurance__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
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
    { richTextStyleOverrides: descriptionStyleOverrides },
  );
  const bodyStyleOverrides = getRichTextStyleOverrides(
    props.bodyStyles,
    props.bodyColor,
    getReadableSectionForeground(props.accordionItemBackgroundColor),
  );
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
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
                        { richTextStyleOverrides: bodyStyleOverrides },
                      )
                    : undefined;

                  return (
                    <details
                      className="medical-specialist-insurance__item"
                      key={`${title}-${index}`}
                      open={index === 0}
                      style={{
                        backgroundColor: toThemeCss(
                          props.accordionItemBackgroundColor?.selectedColor,
                          "rgba(255, 255, 255, 0.6)",
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
                          '"Manrope", Inter, sans-serif',
                          accordionItemForeground,
                        )}
                      >
                        {title}
                      </summary>
                      <div
                        style={getTextStyle(
                          props.bodyStyles,
                          props.bodyColor,
                          "'Krub', 'Krub Fallback', sans-serif",
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
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistInsurance: YextComponentConfig<MedicalSpecialistInsuranceProps> =
  {
    label: "Insurance",
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
      groups: insuranceGroupsSource.field,
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
      accordionItemBackgroundColor: {
        label: "Accordion Item Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
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
      summaryStyles: { label: "Summary Styles", type: "styledText" },
      summaryColor: {
        label: "Summary Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      bodyStyles: { label: "Body Styles", type: "styledText" },
      bodyColor: {
        label: "Body Color",
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
  displayName: "Insurance",
  description: "Insurance",
  pageSetTypes: ["ENTITY"],
};
