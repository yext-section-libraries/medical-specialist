import type { SectionConfig } from "@yext/visual-editor";
import {
  getReadableSectionForeground,
  getTextStyle,
  pxOrUndefined,
  toThemeCss,
} from "../shared/sectionHelpers";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";
import { convertDistance, getDistance } from "geolib";
import {
  msg,
  Background,
  EntityField,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  type NearbyLocationsResponse,
  type StyledButtonValue,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "@yext/visual-editor";

type NearbyDoc = {
  id?: string;
  uid?: string;
  name?: string;
  address?: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
  };
  mainPhone?: string;
  yextDisplayCoordinate?: {
    latitude?: number;
    longitude?: number;
  };
};

type TextBlock = {
  text: YextEntityField<TranslatableString>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type MedicalSpecialistNearbyProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  heading: TextBlock;
  cardTitleStyles: StyledTextValue;
  cardTitleColor?: ThemeColor;
  distanceStyles: StyledTextValue;
  distanceColor?: ThemeColor;
  metaStyles: StyledTextValue;
  metaColor?: ThemeColor;
  primaryButtonVariant: "solid" | "outline";
  primaryButtonStyles: StyledButtonValue;
  primaryButtonColor: ThemeColor;
  secondaryButtonVariant: "solid" | "outline";
  secondaryButtonStyles: StyledButtonValue;
  secondaryButtonColor: ThemeColor;
  cardBackgroundColor: ThemeColor;
  radiusMiles: number;
  limit: number;
  primaryCtaLabel: YextEntityField<TranslatableString>;
  secondaryCtaLabel: YextEntityField<TranslatableString>;
};

const getButtonStyle = (
  value: StyledButtonValue,
  variant: "solid" | "outline",
  color: ThemeColor,
): React.CSSProperties => {
  const accentColor = toThemeCss(color.selectedColor, "#7d9e77");

  return {
    fontFamily:
      value.fontFamily === "default"
        ? "var(--fontFamily-button-fontFamily)"
        : value.fontFamily,
    fontSize:
      value.fontSize === "default"
        ? "var(--fontSize-button-fontSize)"
        : value.fontSize,
    fontWeight:
      value.fontWeight === "default"
        ? "var(--fontWeight-button-fontWeight)"
        : value.fontWeight,
    fontStyle:
      value.fontStyle === "default"
        ? "var(--fontStyle-button-fontStyle)"
        : value.fontStyle,
    textTransform:
      value.textTransform === "default"
        ? "var(--textTransform-button-textTransform)"
        : value.textTransform,
    letterSpacing:
      value.letterSpacing === "default"
        ? "var(--letterSpacing-button-letterSpacing)"
        : value.letterSpacing,
    borderRadius:
      value.borderRadius === "default"
        ? "var(--borderRadius-button-borderRadius)"
        : value.borderRadius,
    color:
      variant === "solid"
        ? toThemeCss(color.contrastingColor, "#ffffff")
        : accentColor,
    backgroundColor: variant === "solid" ? accentColor : "transparent",
    border: `1px solid ${accentColor}`,
  };
};

const formatAddress = (address?: NearbyDoc["address"]) => {
  if (!address) return "";
  return [
    address.line1,
    [address.city, address.region].filter(Boolean).join(", "),
    address.postalCode,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

const formatPhoneNumber = (phoneNumber: string) => {
  const normalizedPhoneNumber = phoneNumber.trim();
  if (!normalizedPhoneNumber) {
    return "";
  }

  const cleanedPhoneNumber = normalizedPhoneNumber.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumber, {
    regionCode: "US",
  });

  if (!parsedPhoneNumber.valid || !parsedPhoneNumber.number) {
    return normalizedPhoneNumber;
  }

  return parsedPhoneNumber.number.national;
};

const formatDistanceMiles = (
  from?: { latitude?: number; longitude?: number },
  to?: { latitude?: number; longitude?: number },
  locale = "en",
) => {
  if (
    from?.latitude == null ||
    from?.longitude == null ||
    to?.latitude == null ||
    to?.longitude == null
  ) {
    return "";
  }

  const meters = getDistance(
    {
      latitude: from.latitude,
      longitude: from.longitude,
    },
    {
      latitude: to.latitude,
      longitude: to.longitude,
    },
  );
  const miles = convertDistance(meters, "mi");
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(miles)} miles away`;
};

const getDirectionsUrl = (coordinate?: {
  latitude?: number;
  longitude?: number;
}) => {
  if (coordinate?.latitude == null || coordinate?.longitude == null) return "#";
  return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
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

.medical-specialist-nearby__inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.medical-specialist-nearby__heading {
  margin: 0;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.05em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-nearby__grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.medical-specialist-nearby__card {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 228px;
}

.medical-specialist-nearby__title,
.medical-specialist-nearby__distance,
.medical-specialist-nearby__meta {
  margin: 0;
}

.medical-specialist-nearby__title {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.medical-specialist-nearby__distance {
  margin-top: 4px;
  line-height: 24px;
  letter-spacing: -0.02em;
}

.medical-specialist-nearby__meta {
  white-space: pre-line;
}

.medical-specialist-nearby__actions {
  margin-top: auto;
  padding-top: 12px;
  display: inline-flex;
  width: fit-content;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.medical-specialist-nearby__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  text-decoration: none;
  box-shadow: 0 10px 26px rgba(38, 14, 1, 0.08);
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.medical-specialist-nearby__btn:hover,
.medical-specialist-nearby__btn:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(38, 14, 1, 0.12);
}

@media (max-width: 1199px) {
  .medical-specialist-nearby__grid {
    grid-template-columns: 1fr;
  }

  .medical-specialist-nearby__actions {
    width: 100%;
    justify-content: center;
  }

  .medical-specialist-nearby__btn {
    width: 100%;
  }
}

@media (max-width: 809px) {
  .medical-specialist-nearby__heading {
    font-size: 30px !important;
    line-height: 1.08 !important;
  }

  .medical-specialist-nearby__title {
    font-size: 22px !important;
    line-height: 1.12 !important;
  }
}
`;

const MedicalSpecialistNearbyComponent = (
  props: MedicalSpecialistNearbyProps & { id: string; puck: any },
) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<Record<string, any>>();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "16px";
  const coordinate = streamDocument?.yextDisplayCoordinate;
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const cardForeground = getReadableSectionForeground(
    props.cardBackgroundColor,
  );
  const radiusMiles = Number.isFinite(props.radiusMiles)
    ? props.radiusMiles
    : 10;
  const limit = Number.isFinite(props.limit) ? props.limit : 3;
  const enabled =
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    Number.isFinite(radiusMiles) &&
    radiusMiles > 0 &&
    Number.isFinite(limit) &&
    limit > 0;
  const { data: nearbyLocationsData, status: nearbyLocationsStatus } =
    useNearbyLocations({
      streamDocument,
      latitude: coordinate?.latitude,
      longitude: coordinate?.longitude,
      radiusMi: radiusMiles,
      limit,
      enabled,
    });

  const nearbyLocationDocs =
    (nearbyLocationsData as NearbyLocationsResponse | undefined)?.response
      ?.docs ?? [];

  if (!enabled) {
    return <></>;
  }

  if (
    nearbyLocationsStatus !== "pending" &&
    (nearbyLocationsStatus !== "success" || !nearbyLocationDocs.length)
  ) {
    if (!props.puck.isEditing) {
      return <></>;
    }
  }

  const locale =
    typeof streamDocument?.meta?.locale === "string"
      ? streamDocument.meta.locale
      : typeof streamDocument?.locale === "string"
        ? streamDocument.locale
        : "en";
  const resolvedPrimaryLabel = resolveComponentData(
    props.primaryCtaLabel as any,
    locale,
    streamDocument,
  );
  const primaryConstantValue = props.primaryCtaLabel?.constantValue;
  const primaryConstantRecord =
    primaryConstantValue && typeof primaryConstantValue === "object"
      ? (primaryConstantValue as Record<string, unknown>)
      : undefined;
  const primaryLabelFallback =
    typeof primaryConstantValue === "string" ||
    typeof primaryConstantValue === "number"
      ? String(primaryConstantValue)
      : typeof primaryConstantRecord?.text === "string"
        ? primaryConstantRecord.text
        : typeof primaryConstantRecord?.text === "number"
          ? String(primaryConstantRecord.text)
          : typeof primaryConstantRecord?.defaultValue === "string"
            ? primaryConstantRecord.defaultValue
            : typeof primaryConstantRecord?.defaultValue === "number"
              ? String(primaryConstantRecord.defaultValue)
              : "More Details";
  const resolvedPrimaryRecord =
    resolvedPrimaryLabel && typeof resolvedPrimaryLabel === "object"
      ? (resolvedPrimaryLabel as Record<string, unknown>)
      : undefined;
  const primaryLabel = (
    typeof resolvedPrimaryLabel === "string" ||
    typeof resolvedPrimaryLabel === "number"
      ? String(resolvedPrimaryLabel)
      : typeof resolvedPrimaryRecord?.text === "string"
        ? resolvedPrimaryRecord.text
        : typeof resolvedPrimaryRecord?.text === "number"
          ? String(resolvedPrimaryRecord.text)
          : typeof resolvedPrimaryRecord?.defaultValue === "string"
            ? resolvedPrimaryRecord.defaultValue
            : typeof resolvedPrimaryRecord?.defaultValue === "number"
              ? String(resolvedPrimaryRecord.defaultValue)
              : primaryLabelFallback
  ).trim();
  const resolvedSecondaryLabel = resolveComponentData(
    props.secondaryCtaLabel as any,
    locale,
    streamDocument,
  );
  const secondaryConstantValue = props.secondaryCtaLabel?.constantValue;
  const secondaryConstantRecord =
    secondaryConstantValue && typeof secondaryConstantValue === "object"
      ? (secondaryConstantValue as Record<string, unknown>)
      : undefined;
  const secondaryLabelFallback =
    typeof secondaryConstantValue === "string" ||
    typeof secondaryConstantValue === "number"
      ? String(secondaryConstantValue)
      : typeof secondaryConstantRecord?.text === "string"
        ? secondaryConstantRecord.text
        : typeof secondaryConstantRecord?.text === "number"
          ? String(secondaryConstantRecord.text)
          : typeof secondaryConstantRecord?.defaultValue === "string"
            ? secondaryConstantRecord.defaultValue
            : typeof secondaryConstantRecord?.defaultValue === "number"
              ? String(secondaryConstantRecord.defaultValue)
              : "Get Directions";
  const resolvedSecondaryRecord =
    resolvedSecondaryLabel && typeof resolvedSecondaryLabel === "object"
      ? (resolvedSecondaryLabel as Record<string, unknown>)
      : undefined;
  const secondaryLabel = (
    typeof resolvedSecondaryLabel === "string" ||
    typeof resolvedSecondaryLabel === "number"
      ? String(resolvedSecondaryLabel)
      : typeof resolvedSecondaryRecord?.text === "string"
        ? resolvedSecondaryRecord.text
        : typeof resolvedSecondaryRecord?.text === "number"
          ? String(resolvedSecondaryRecord.text)
          : typeof resolvedSecondaryRecord?.defaultValue === "string"
            ? resolvedSecondaryRecord.defaultValue
            : typeof resolvedSecondaryRecord?.defaultValue === "number"
              ? String(resolvedSecondaryRecord.defaultValue)
              : secondaryLabelFallback
  ).trim();
  const resolvedHeading = resolveComponentData(
    props.heading.text as any,
    locale,
    streamDocument,
  );
  const headingConstantValue = props.heading.text?.constantValue;
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
              : "Nearby Facilities";
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
  const sectionWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1280px";

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistNearby${getAnalyticsScopeHash(props.id)}`}
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
            padding: `${verticalPadding} 40px 24px`,
          }}
        >
          <div
            className="medical-specialist-nearby__inner"
            style={{ maxWidth: sectionWidth }}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="medical-specialist-nearby__heading"
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

            {nearbyLocationsStatus === "pending" ? (
              <p
                style={getTextStyle(
                  props.metaStyles,
                  props.metaColor,
                  "'Krub', 'Krub Fallback', sans-serif",
                  sectionForeground,
                )}
              >
                {t("loadingNearbyLocations", "Loading nearby locations")}
              </p>
            ) : nearbyLocationsStatus !== "success" ||
              !nearbyLocationDocs.length ? (
              <p
                style={getTextStyle(
                  props.metaStyles,
                  props.metaColor,
                  "'Krub', 'Krub Fallback', sans-serif",
                  sectionForeground,
                )}
              >
                {t(
                  "noNearbyLocationsFound",
                  "No nearby locations found for this location",
                )}
              </p>
            ) : (
              <div className="medical-specialist-nearby__grid">
                {nearbyLocationDocs.map((locationData, index) => {
                  const location = locationData as NearbyDoc;
                  const mergedDocument = mergeMeta(
                    locationData as Record<string, any>,
                    streamDocument,
                  );
                  const resolvedUrl = resolveUrlTemplate(
                    mergedDocument,
                    relativePrefixToRoot ?? "",
                  );
                  const title =
                    location.name?.trim() || `Location ${index + 1}`;
                  const distance = formatDistanceMiles(
                    coordinate,
                    location.yextDisplayCoordinate,
                    locale,
                  );
                  const formattedPhone = location.mainPhone
                    ? formatPhoneNumber(location.mainPhone)
                    : "";
                  const details = [
                    formatAddress(location.address),
                    formattedPhone,
                  ]
                    .filter(Boolean)
                    .join("\n");
                  const directionsUrl = getDirectionsUrl(
                    location.yextDisplayCoordinate,
                  );

                  return (
                    <article
                      key={location.id ?? location.uid ?? title}
                      className="medical-specialist-nearby__card"
                      style={{
                        ...getSurfaceColorStyle(
                          props.cardBackgroundColor,
                          streamDocument,
                          {
                            fallbackBackgroundColor: "rgba(255, 255, 255, 0.5)",
                          },
                        ),
                      }}
                    >
                      <h3
                        className="medical-specialist-nearby__title"
                        style={getTextStyle(
                          props.cardTitleStyles,
                          props.cardTitleColor,
                          '"Manrope", sans-serif',
                          cardForeground,
                        )}
                      >
                        {title}
                      </h3>
                      {distance ? (
                        <p
                          className="medical-specialist-nearby__distance"
                          style={getTextStyle(
                            props.distanceStyles,
                            props.distanceColor,
                            "'Krub', 'Krub Fallback', sans-serif",
                            cardForeground,
                          )}
                        >
                          {distance}
                        </p>
                      ) : null}
                      <p
                        className="medical-specialist-nearby__meta"
                        style={getTextStyle(
                          props.metaStyles,
                          props.metaColor,
                          "'Krub', 'Krub Fallback', sans-serif",
                          cardForeground,
                        )}
                      >
                        {details}
                      </p>
                      <div className="medical-specialist-nearby__actions">
                        <EntityField
                          displayName="Primary CTA Label"
                          fieldId={props.primaryCtaLabel.field}
                          constantValueEnabled={
                            props.primaryCtaLabel.constantValueEnabled
                          }
                        >
                          <Link
                            className="medical-specialist-nearby__btn"
                            cta={{ link: resolvedUrl, linkType: "URL" }}
                            eventName={`nearbyPrimaryCta${index}`}
                            style={{
                              ...getButtonStyle(
                                props.primaryButtonStyles,
                                props.primaryButtonVariant,
                                props.primaryButtonColor,
                              ),
                            }}
                          >
                            {primaryLabel}
                          </Link>
                        </EntityField>
                        <EntityField
                          displayName="Secondary CTA Label"
                          fieldId={props.secondaryCtaLabel.field}
                          constantValueEnabled={
                            props.secondaryCtaLabel.constantValueEnabled
                          }
                        >
                          <Link
                            className="medical-specialist-nearby__btn"
                            cta={{ link: directionsUrl, linkType: "URL" }}
                            eventName={`nearbySecondaryCta${index}`}
                            style={{
                              ...getButtonStyle(
                                props.secondaryButtonStyles,
                                props.secondaryButtonVariant,
                                props.secondaryButtonColor,
                              ),
                            }}
                          >
                            {secondaryLabel}
                          </Link>
                        </EntityField>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistNearby: YextComponentConfig<MedicalSpecialistNearbyProps> =
  {
    label: msg("components.medicalSpecialistNearby", "Nearby"),
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
          styles: {
            label: msg("fields.sectionStyles", "Section Styles"),
            type: "styledPageSection",
          },
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
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
        },
      },
      cardTitleStyles: {
        label: msg("fields.cardTitleStyles", "Card Title Styles"),
        type: "styledText",
      },
      cardTitleColor: {
        label: msg("fields.cardTitleColor", "Card Title Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      distanceStyles: {
        label: msg("fields.distanceStyles", "Distance Styles"),
        type: "styledText",
      },
      distanceColor: {
        label: msg("fields.distanceColor", "Distance Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      metaStyles: {
        label: msg("fields.metaStyles", "Meta Styles"),
        type: "styledText",
      },
      metaColor: {
        label: msg("fields.metaColor", "Meta Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      primaryButtonVariant: {
        label: msg("fields.primaryButtonVariant", "Primary Button Variant"),
        type: "select",
        options: [
          { label: msg("fields.options.solid", "Solid"), value: "solid" },
          { label: msg("fields.options.outline", "Outline"), value: "outline" },
        ],
      },
      primaryButtonColor: {
        label: msg("fields.primaryButtonColor", "Primary Button Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      primaryButtonStyles: {
        label: msg("fields.primaryButtonStyles", "Primary Button Styles"),
        type: "styledButton",
      },
      secondaryButtonVariant: {
        label: msg("fields.secondaryButtonVariant", "Secondary Button Variant"),
        type: "select",
        options: [
          { label: msg("fields.options.solid", "Solid"), value: "solid" },
          { label: msg("fields.options.outline", "Outline"), value: "outline" },
        ],
      },
      secondaryButtonColor: {
        label: msg("fields.secondaryButtonColor", "Secondary Button Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      secondaryButtonStyles: {
        label: msg("fields.secondaryButtonStyles", "Secondary Button Styles"),
        type: "styledButton",
      },
      cardBackgroundColor: {
        label: msg("fields.cardBackgroundColor", "Card Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      radiusMiles: {
        label: msg("fields.radiusMiles", "Radius Miles"),
        type: "number",
      },
      limit: { label: msg("fields.cardLimit", "Card Limit"), type: "number" },
      primaryCtaLabel: {
        type: "entityField",
        label: msg("fields.primaryCtaLabel", "Primary CTA Label"),
        filter: {
          types: ["type.string"],
          includeListsOnly: false,
        },
      },
      secondaryCtaLabel: {
        type: "entityField",
        label: msg("fields.secondaryCtaLabel", "Secondary CTA Label"),
        filter: {
          types: ["type.string"],
          includeListsOnly: false,
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
            defaultValue: "Nearby Facilities",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "Manrope",
          fontSize: "57px",
          fontWeight: "700",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      cardTitleStyles: {
        fontFamily: "Manrope",
        fontSize: "24px",
        fontWeight: "400",
        fontStyle: "default",
        textTransform: "default",
      },
      cardTitleColor: undefined,
      distanceStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "16px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
      },
      distanceColor: undefined,
      metaStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "16px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
      },
      metaColor: undefined,
      primaryButtonVariant: "solid",
      primaryButtonColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      primaryButtonStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
        letterSpacing: "default",
        borderRadius: "default",
      },
      secondaryButtonVariant: "outline",
      secondaryButtonColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      secondaryButtonStyles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
        letterSpacing: "default",
        borderRadius: "default",
      },
      cardBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      radiusMiles: 10,
      limit: 3,
      primaryCtaLabel: {
        field: "",
        constantValue: {
          defaultValue: "More Details",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      secondaryCtaLabel: {
        field: "",
        constantValue: {
          defaultValue: "Get Directions",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    render: (props) => <MedicalSpecialistNearbyComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistNearby",
  displayName: "Nearby",
  description: "Nearby",
  pageSetTypes: ["ENTITY"],
};
