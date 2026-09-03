import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  getAggregateRating,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  resolveComponentData,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  useDocument,
} from "@yext/visual-editor";

const createTextFieldValue = (
  defaultValue = "",
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const defaultThemeColor = (
  selectedColor: string,
  contrastingColor = "white",
): ThemeColor => ({
  selectedColor,
  contrastingColor,
});

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

const normalizeThemeColor = (
  value: ThemeColor | string | undefined,
  fallback: ThemeColor,
): ThemeColor => {
  if (typeof value === "string") {
    const selectedColor = value.trim();
    if (!selectedColor || selectedColor.toLowerCase() === "default") {
      return fallback;
    }

    return {
      selectedColor,
      contrastingColor: fallback.contrastingColor,
    };
  }

  if (!value || typeof value !== "object") {
    return fallback;
  }

  return {
    selectedColor:
      typeof value.selectedColor === "string"
        ? value.selectedColor
        : fallback.selectedColor,
    contrastingColor:
      typeof value.contrastingColor === "string"
        ? value.contrastingColor
        : fallback.contrastingColor,
  };
};

type FirstPartyReviewComment = {
  content?: string;
  commentDate?: string;
};

type FirstPartyReview = {
  authorName?: string;
  rating?: number;
  content?: string;
  reviewDate?: string;
  comments?: FirstPartyReviewComment[];
};

type FirstPartyAggregate = {
  publisher?: string;
  topReviews?: FirstPartyReview[];
};

type ReviewsDocument = {
  ref_reviewsAgg?: FirstPartyAggregate[];
};

type TextBlock = {
  text: YextEntityField<TranslatableString>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type MedicalSpecialistReviewsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  heading: TextBlock;
  reviewCardBackgroundColor: ThemeColor;
  starColor: ThemeColor;
  summaryStyles: StyledTextValue;
  summaryColor?: ThemeColor;
  ratingDescriptionColor?: ThemeColor;
  quoteStyles: StyledTextValue;
  quoteColor?: ThemeColor;
  authorStyles: StyledTextValue;
  authorColor?: ThemeColor;
};

const pxOrUndefined = (value?: string) =>
  !value || value === "default" ? undefined : value;

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

const normalizeTextBlock = (
  value: Partial<TextBlock> | undefined,
  fallbackText: string,
  fallbackFontColor: ThemeColor,
  fallbackStyles: StyledTextValue,
): TextBlock => ({
  text:
    value && "text" in value && value.text !== undefined
      ? (value.text as YextEntityField<TranslatableString>)
      : createTextFieldValue(fallbackText),
  fontColor: normalizeThemeColor(value?.fontColor, fallbackFontColor),
  styles: {
    fontFamily: value?.styles?.fontFamily ?? fallbackStyles.fontFamily,
    fontSize: value?.styles?.fontSize ?? fallbackStyles.fontSize,
    fontWeight: value?.styles?.fontWeight ?? fallbackStyles.fontWeight,
    fontStyle: value?.styles?.fontStyle ?? fallbackStyles.fontStyle,
    textTransform: value?.styles?.textTransform ?? fallbackStyles.textTransform,
  },
});

const formatReviewDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const renderStars = (rating?: number) => {
  const rounded = Math.max(0, Math.min(5, Math.round(rating ?? 5)));
  return "★★★★★".slice(0, rounded).padEnd(5, "☆");
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

.medical-specialist-reviews__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.medical-specialist-reviews__heading {
  margin: 0;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-reviews__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.medical-specialist-reviews__card {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(38, 14, 1, 0.12);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.medical-specialist-reviews__stars {
  letter-spacing: 2px;
  font-size: 18px;
  line-height: 1;
}

.medical-specialist-reviews__rating-text {
  margin: 0;
  font-family: "'Krub', 'Krub Fallback', sans-serif", Inter, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.medical-specialist-reviews__quote,
.medical-specialist-reviews__author,
.medical-specialist-reviews__date,
.medical-specialist-reviews__response {
  margin: 0;
}

.medical-specialist-reviews__date {
  font-family: "'Krub', 'Krub Fallback', sans-serif", Inter, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: rgba(38, 14, 1, 0.58);
}

.medical-specialist-reviews__response {
  padding-top: 8px;
  border-top: 1px solid rgba(38, 14, 1, 0.1);
  font-family: "'Krub', 'Krub Fallback', sans-serif", Inter, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: rgba(38, 14, 1, 0.72);
}

.medical-specialist-reviews__empty {
  margin: 0 auto;
  max-width: 720px;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px dashed rgba(38, 14, 1, 0.18);
  text-align: center;
  font-family: "'Krub', 'Krub Fallback', sans-serif", Inter, sans-serif;
  line-height: 1.5;
  color: rgba(38, 14, 1, 0.68);
}

@media (max-width: 1199px) {
  .medical-specialist-reviews__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}

@media (max-width: 809px) {
  .medical-specialist-reviews__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-reviews__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .medical-specialist-reviews__card {
    align-items: center;
    text-align: center;
  }
}
`;

const MedicalSpecialistReviewsComponent = (
  props: MedicalSpecialistReviewsProps & { id: string; puck: any },
) => {
  const streamDocument = useDocument<ReviewsDocument>();
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const reviewCardForeground = getReadableSectionForeground(
    props.reviewCardBackgroundColor,
  );
  const reviewCardForegroundCss = getTextColorCss(
    undefined,
    reviewCardForeground,
  );
  const normalizedHeading = normalizeTextBlock(
    props.heading,
    "Patient Reviews",
    defaultThemeColor(sectionForeground ?? "palette-quaternary", "white"),
    {
      fontFamily: "Manrope",
      fontSize: "60px",
      fontWeight: "700",
      fontStyle: "default",
      textTransform: "default",
    },
  );
  const aggregateRating = getAggregateRating(streamDocument as any);
  const firstPartyAggregate = streamDocument?.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const streamData = streamDocument as unknown as Record<string, unknown>;
  const locale =
    typeof streamData.meta === "object" &&
    streamData.meta &&
    typeof (streamData.meta as { locale?: unknown }).locale === "string"
      ? String((streamData.meta as { locale?: unknown }).locale)
      : typeof streamData.locale === "string"
        ? streamData.locale
        : "en";
  const resolvedHeading = resolveComponentData(
    normalizedHeading.text as any,
    locale,
    streamData,
  );
  const headingConstantValue = normalizedHeading.text?.constantValue;
  const headingConstantRecord =
    headingConstantValue && typeof headingConstantValue === "object"
      ? (headingConstantValue as Record<string, unknown>)
      : undefined;
  const headingFallback =
    typeof headingConstantValue === "string" ||
    typeof headingConstantValue === "number"
      ? String(headingConstantValue)
      : typeof headingConstantRecord?.text === "string"
        ? headingConstantRecord.text
        : typeof headingConstantRecord?.text === "number"
          ? String(headingConstantRecord.text)
          : typeof headingConstantRecord?.defaultValue === "string"
            ? headingConstantRecord.defaultValue
            : typeof headingConstantRecord?.defaultValue === "number"
              ? String(headingConstantRecord.defaultValue)
              : "Patient Reviews";
  const resolvedHeadingRecord =
    resolvedHeading && typeof resolvedHeading === "object"
      ? (resolvedHeading as Record<string, unknown>)
      : undefined;
  const headingText = (
    typeof resolvedHeading === "string" || typeof resolvedHeading === "number"
      ? String(resolvedHeading)
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

  if (!reviews.length) {
    if (!props.puck.isEditing) {
      return null;
    }

    return (
      <AnalyticsScopeProvider
        name={`MedicalSpecialistReviews${getAnalyticsScopeHash(props.id)}`}
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
              className="medical-specialist-reviews__inner"
              style={{ maxWidth: sectionWidth }}
            >
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  className="medical-specialist-reviews__heading"
                  style={getTextStyle(
                    normalizedHeading.styles,
                    normalizedHeading.fontColor,
                    '"Manrope", Inter, sans-serif',
                    sectionForeground,
                  )}
                >
                  {headingText}
                </h2>
              </EntityField>
              <p className="medical-specialist-reviews__empty">
                No first-party reviews are available for this entity yet.
              </p>
            </div>
          </section>
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  }

  const averageRatingValue =
    typeof aggregateRating?.averageRating === "number"
      ? aggregateRating.averageRating.toFixed(1)
      : "5.0";
  const reviewCountValue =
    typeof aggregateRating?.reviewCount === "number"
      ? aggregateRating.reviewCount
      : reviews.length;
  const summaryText = `${averageRatingValue} stars from ${reviewCountValue} patient review${
    reviewCountValue === 1 ? "" : "s"
  }`;

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistReviews${getAnalyticsScopeHash(props.id)}`}
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
            className="medical-specialist-reviews__inner"
            style={{ maxWidth: sectionWidth }}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="medical-specialist-reviews__heading"
                style={getTextStyle(
                  normalizedHeading.styles,
                  normalizedHeading.fontColor,
                  '"Manrope", Inter, sans-serif',
                  sectionForeground,
                )}
              >
                {headingText}
              </h2>
            </EntityField>
            <p
              style={{
                ...getTextStyle(
                  props.summaryStyles,
                  props.summaryColor,
                  "'Krub', 'Krub Fallback', sans-serif",
                ),
                textAlign: "center",
                margin: "0",
              }}
            >
              {summaryText}
            </p>
            <div className="medical-specialist-reviews__grid">
              {reviews.map((review, index) => {
                const quote =
                  typeof review.content === "string" ? review.content : "";
                const author =
                  typeof review.authorName === "string" &&
                  review.authorName.trim()
                    ? review.authorName.trim()
                    : `Review ${index + 1}`;
                const rating =
                  typeof review.rating === "number" &&
                  Number.isFinite(review.rating)
                    ? review.rating
                    : 5;
                const reviewDate = formatReviewDate(review.reviewDate);
                const response = review.comments?.[0];
                const responseContent =
                  typeof response?.content === "string"
                    ? response.content.trim()
                    : "";
                const responseDate = formatReviewDate(response?.commentDate);

                return (
                  <article
                    key={`${author}-${review.reviewDate ?? index}`}
                    className="medical-specialist-reviews__card"
                    style={{
                      backgroundColor: toThemeCss(
                        props.reviewCardBackgroundColor?.selectedColor,
                        "rgba(255, 255, 255, 0.5)",
                      ),
                      color: reviewCardForegroundCss,
                    }}
                  >
                    <div
                      className="medical-specialist-reviews__stars"
                      style={{
                        color: toThemeCss(
                          props.starColor?.selectedColor,
                          "#7d9e77",
                        ),
                      }}
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {renderStars(rating)}
                    </div>
                    <p
                      className="medical-specialist-reviews__rating-text"
                      style={{
                        color: getTextColorCss(
                          props.ratingDescriptionColor,
                          reviewCardForeground,
                        ),
                      }}
                    >
                      {`${rating}/5 stars`}
                    </p>
                    {quote ? (
                      <p
                        className="medical-specialist-reviews__quote"
                        style={getTextStyle(
                          props.quoteStyles,
                          props.quoteColor,
                          "'Krub', 'Krub Fallback', sans-serif",
                          reviewCardForeground,
                        )}
                      >
                        “{quote}”
                      </p>
                    ) : null}
                    <p
                      className="medical-specialist-reviews__author"
                      style={getTextStyle(
                        props.authorStyles,
                        props.authorColor,
                        "'Krub', 'Krub Fallback', sans-serif",
                        reviewCardForeground,
                      )}
                    >
                      {author}
                    </p>
                    {reviewDate ? (
                      <p
                        className="medical-specialist-reviews__date"
                        style={{ color: reviewCardForegroundCss }}
                      >
                        {reviewDate}
                      </p>
                    ) : null}
                    {responseContent ? (
                      <p className="medical-specialist-reviews__response">
                        {responseDate
                          ? `Response (${responseDate}): `
                          : "Response: "}
                        {responseContent}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistReviews: YextComponentConfig<MedicalSpecialistReviewsProps> =
  {
    label: "Reviews",
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
      reviewCardBackgroundColor: {
        label: "Review Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      starColor: {
        label: "Star Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      summaryStyles: { label: "Summary Text Styles", type: "styledText" },
      summaryColor: {
        label: "Summary Text Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      ratingDescriptionColor: {
        label: "Rating Description Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      quoteStyles: { label: "Quote Styles", type: "styledText" },
      quoteColor: {
        label: "Quote Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      authorStyles: { label: "Author Styles", type: "styledText" },
      authorColor: {
        label: "Author Color",
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
            defaultValue: "Patient Reviews",
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
      reviewCardBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      starColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      summaryStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "18px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
      },
      summaryColor: undefined,
      ratingDescriptionColor: undefined,
      quoteStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "21px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
      },
      quoteColor: undefined,
      authorStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "18px",
        fontWeight: "600",
        fontStyle: "default",
        textTransform: "default",
      },
      authorColor: undefined,
    },
    render: (props) => <MedicalSpecialistReviewsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistReviews",
  displayName: "Reviews",
  description: "Reviews",
  pageSetTypes: ["ENTITY"],
};
