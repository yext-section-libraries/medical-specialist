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

type FaqItemFields = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const faqItemsSource = createItemSource<FaqItemFields>({
  label: "FAQ Items",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: {
        types: ["type.string"],
        includeListsOnly: false,
      },
    },
    answer: {
      type: "entityField",
      label: "Answer",
      filter: {
        types: ["type.rich_text_v2"],
        includeListsOnly: false,
      },
    },
  },
  defaultValues: [
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "When should I go to urgent care versus the ER?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pulvinar velit ac mi pulvinar, vitae interdum nunc suscipit.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do I need an appointment before I visit?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ornare lectus sit amet est placerat in egestas erat.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "How can I prepare for my visit?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
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

type MedicalSpecialistFaqProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  faqItemBackgroundColor: ThemeColor;
  heading: TextBlock;
  questionStyles: StyledTextValue;
  questionColor?: ThemeColor;
  answerStyles: StyledTextValue;
  answerColor?: ThemeColor;
  items: typeof faqItemsSource.value;
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

.medical-specialist-faq__wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px;
}

.medical-specialist-faq__heading {
  margin: 0 0 20px;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-faq__accordion {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.medical-specialist-faq__item {
  border: 1px solid rgba(38, 14, 1, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  padding: 14px 16px;
}

.medical-specialist-faq__item summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.medical-specialist-faq__item summary::-webkit-details-marker {
  display: none;
}

.medical-specialist-faq__item summary::after {
  content: "+";
  font-size: 22px;
  line-height: 1;
  color: rgba(38, 14, 1, 0.7);
}

.medical-specialist-faq__item[open] summary::after {
  content: "-";
}

.medical-specialist-faq__answer {
  margin: 12px 0 4px;
  line-height: 1.5;
  letter-spacing: -0.02em;
}

@media (max-width: 809px) {
  .medical-specialist-faq__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
  }
}
`;

const MedicalSpecialistFaqComponent = (
  props: MedicalSpecialistFaqProps & { id: string; puck: any },
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
          : "Frequently Asked Questions";
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
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const faqItemForeground = getReadableSectionForeground(
    props.faqItemBackgroundColor,
  );
  const answerStyleOverrides = getRichTextStyleOverrides(
    props.answerStyles,
    props.answerColor,
    faqItemForeground,
  );
  const faqItems = faqItemsSource.resolveItems(props.items, streamDocument);

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistFaq${getAnalyticsScopeHash(props.id)}`}
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
            className="medical-specialist-faq__wrap"
            style={{ maxWidth: sectionWidth }}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="medical-specialist-faq__heading"
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
              displayName="FAQ Items"
              fieldId={props.items.field}
              constantValueEnabled={props.items.constantValueEnabled}
            >
              <div className="medical-specialist-faq__accordion">
                {faqItems.map((item, index) => {
                  const question =
                    resolveComponentData(
                      item.question,
                      locale,
                      streamDocument,
                      { output: "plainText" },
                    ).trim() || `FAQ ${index + 1}`;
                  const resolvedAnswer = item.answer
                    ? resolveComponentData(
                        item.answer,
                        locale,
                        streamDocument,
                        {
                          richTextStyleOverrides: answerStyleOverrides,
                        },
                      )
                    : undefined;

                  return (
                    <details
                      className="medical-specialist-faq__item"
                      key={`${question}-${index}`}
                      open={index === 0}
                      style={{
                        backgroundColor: toThemeCss(
                          props.faqItemBackgroundColor?.selectedColor,
                          "rgba(255, 255, 255, 0.6)",
                        ),
                      }}
                      onToggle={(event) =>
                        analytics?.track({
                          action: (event.currentTarget as HTMLDetailsElement)
                            .open
                            ? "EXPAND"
                            : "COLLAPSE",
                          eventName: `faqAccordion${index}`,
                        })
                      }
                    >
                      <summary
                        style={getTextStyle(
                          props.questionStyles,
                          props.questionColor,
                          '"Manrope", Inter, sans-serif',
                          faqItemForeground,
                        )}
                      >
                        {question}
                      </summary>
                      <div
                        className="medical-specialist-faq__answer"
                        style={getTextStyle(
                          props.answerStyles,
                          props.answerColor,
                          "'Krub', 'Krub Fallback', sans-serif",
                          faqItemForeground,
                        )}
                      >
                        {React.isValidElement(resolvedAnswer) ? (
                          resolvedAnswer
                        ) : (
                          <MaybeRTF
                            data={
                              typeof resolvedAnswer === "string" ||
                              isRichText(resolvedAnswer)
                                ? resolvedAnswer
                                : undefined
                            }
                            richTextStyleOverrides={answerStyleOverrides}
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

export const MedicalSpecialistFaq: YextComponentConfig<MedicalSpecialistFaqProps> =
  {
    label: "FAQ",
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
      items: faqItemsSource.field,
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
      faqItemBackgroundColor: {
        label: "FAQ Item Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      questionStyles: { label: "Question Styles", type: "styledText" },
      questionColor: {
        label: "Question Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      answerStyles: { label: "Answer Styles", type: "styledText" },
      answerColor: {
        label: "Answer Color",
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
            defaultValue: "Frequently Asked Questions",
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
      faqItemBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      questionStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      questionColor: undefined,
      answerStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      answerColor: undefined,
      items: faqItemsSource.defaultValue,
    },
    render: (props) => <MedicalSpecialistFaqComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistFaq",
  displayName: "FAQ",
  description: "FAQ",
  pageSetTypes: ["ENTITY"],
};
