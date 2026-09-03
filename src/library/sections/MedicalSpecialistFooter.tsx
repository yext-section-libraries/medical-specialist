import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider, Link, Address } from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";

import {
  ComprehensiveCTA,
  EntityField,
  ThemeOptions,
  type ComprehensiveCTAValue,
  Image,
  resolveComponentData,
  resolveLocalizedAssetImage,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  useDocument,
  type StyledImageValue,
  type StyledLinkValue,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
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

const pxOrUndefined = (value?: string) =>
  !value || value === "default" ? undefined : value;

type FooterLink = {
  label: string;
  link: string;
  openInNewTab: boolean;
};

type FooterText = {
  text: YextEntityField<TranslatableString | any>;
  fontColor?: ThemeColor | string;
  styles: StyledTextValue;
};

type FooterImageValue = Record<string, unknown> | TranslatableAssetImage;

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

type FooterPhoneItem = {
  number: YextEntityField<string>;
  label?: string;
};

type MedicalSpecialistFooterProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  logoImage: {
    image: YextEntityField<FooterImageValue>;
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
    styles?: StyledImageValue;
  };
  linkStyles: StyledLinkValue;
  linkColor?: ThemeColor | string;
  brandText: FooterText;
  footerLinks: FooterLink[];
  contactAddress: {
    address: YextEntityField<any>;
    showRegion: boolean;
    showCountry: boolean;
  };
  contactAddressStyles: StyledTextValue;
  contactAddressColor?: ThemeColor | string;
  contactPhone: {
    items: FooterPhoneItem[];
    phoneFormat: "international" | "domestic";
    includeHyperlink?: boolean;
  };
  contactPhoneStyles: StyledTextValue;
  contactPhoneColor?: ThemeColor | string;
  contactWebsite: {
    data?: ComprehensiveCTAValue["data"];
    styles?: ComprehensiveCTAValue["styles"];
    className?: string;
    eventName?: string;
  };
};

const getLinkStyle = (
  value: StyledLinkValue,
  color: ThemeColor | string | undefined,
  fallbackColorToken?: string,
): React.CSSProperties => ({
  fontFamily:
    value.fontFamily === "default"
      ? '"Manrope", Inter, sans-serif'
      : value.fontFamily,
  fontSize: pxOrUndefined(value.fontSize) ?? "16px",
  fontWeight: pxOrUndefined(value.fontWeight) ?? "500",
  fontStyle: value.fontStyle === "default" ? undefined : value.fontStyle,
  textTransform:
    value.textTransform === "default" ? undefined : value.textTransform,
  letterSpacing: pxOrUndefined(value.letterSpacing) ?? "-0.02em",
  color: getTextColorCss(color, fallbackColorToken, "#ffffff"),
});

const shouldIncludeCaret = (value?: string) =>
  !!value && value !== "none" && value !== "default" && value !== "false";

const getFooterLinkSummary = (item: FooterLink | undefined, index?: number) => {
  const label = item?.label;

  if (label?.trim()) {
    return label;
  }
  return `Footer Link ${(index ?? 0) + 1}`;
};

const getTextStyle = (
  value: StyledTextValue,
  color: ThemeColor | string | undefined,
  fallbackColorToken?: string,
): React.CSSProperties => ({
  fontFamily:
    value.fontFamily === "default"
      ? '"Manrope", Inter, sans-serif'
      : value.fontFamily,
  fontSize: pxOrUndefined(value.fontSize) ?? "16px",
  fontWeight: pxOrUndefined(value.fontWeight) ?? "500",
  fontStyle: value.fontStyle === "default" ? undefined : value.fontStyle,
  textTransform:
    value.textTransform === "default" ? undefined : value.textTransform,
  color: getTextColorCss(color, fallbackColorToken, "#ffffff"),
});

const readDocumentName = (streamDocument: Record<string, unknown>) => {
  const name =
    typeof streamDocument.name === "string" ? streamDocument.name.trim() : "";
  const geomodifier =
    typeof streamDocument.geomodifier === "string"
      ? streamDocument.geomodifier.trim()
      : typeof (streamDocument.location as Record<string, unknown> | undefined)
            ?.geomodifier === "string"
        ? String(
            (streamDocument.location as Record<string, unknown> | undefined)
              ?.geomodifier,
          ).trim()
        : "";
  return geomodifier
    ? `${name} ${geomodifier}`.trim()
    : name || "Medical Specialist";
};

const formatPhone = (
  phoneNumberString: string,
  format: "international" | "domestic",
) => {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);
  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }
  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
};

const footerStyles = `
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

.medical-specialist-footer {
  position: relative;
  overflow: hidden;
}

.medical-specialist-footer__inner {
  width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 36px;
}

.medical-specialist-footer__top {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 60px;
  align-items: flex-start;
}

.medical-specialist-footer__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.medical-specialist-footer__columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
}

.medical-specialist-footer__links,
.medical-specialist-footer__contact {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.medical-specialist-footer__links-copy {
  display: flex;
  flex-wrap: nowrap;
  gap: 14px;
  align-items: center;
  color: inherit;
}

.medical-specialist-footer__link {
  text-decoration: none;
  transition: opacity 180ms ease, text-decoration-color 180ms ease;
}

.medical-specialist-footer__link--with-caret::after {
  content: " >";
}

.medical-specialist-footer__link:hover {
  opacity: 0.78;
  text-decoration: underline;
}

.medical-specialist-footer__link:focus-visible {
  opacity: 0.78;
  text-decoration: underline;
  outline: 2px solid currentColor;
  outline-offset: 3px;
  border-radius: 4px;
}

.medical-specialist-footer__social {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.medical-specialist-footer__social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: currentColor;
}

.medical-specialist-footer__contact-link {
  display: inline-flex;
  align-self: flex-start;
  text-decoration: none;
  transition: opacity 180ms ease, text-decoration-color 180ms ease;
}

.medical-specialist-footer__contact-link:hover {
  opacity: 0.78;
  text-decoration: underline;
}

.medical-specialist-footer__contact-link:focus-visible {
  opacity: 0.78;
  text-decoration: underline;
  outline: 2px solid currentColor;
  outline-offset: 3px;
  border-radius: 4px;
}

@media (max-width: 1199px) {
  .medical-specialist-footer__inner {
    gap: 28px;
  }

  .medical-specialist-footer__top {
    gap: 24px;
    align-items: flex-start;
  }

  .medical-specialist-footer__links-copy {
    flex-wrap: wrap;
  }
}

@media (max-width: 809px) {
  .medical-specialist-footer__top {
    grid-template-columns: 1fr;
  }

  .medical-specialist-footer__inner,
  .medical-specialist-footer__top,
  .medical-specialist-footer__columns {
    justify-items: center;
    text-align: center;
  }

  .medical-specialist-footer__links,
  .medical-specialist-footer__contact {
    align-items: center;
  }

  .medical-specialist-footer__links-copy {
    justify-content: center;
  }

  .medical-specialist-footer__social {
    justify-content: center;
  }
}
`;

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.2-1.6 1.5-1.6H16.7V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8v3.2h2.5v8h3Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 3.3A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2.2A2.3 2.3 0 1 0 14.3 12 2.3 2.3 0 0 0 12 9.7Zm4.9-3.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
  </svg>
);

const YelpIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M11.6 2.1c.5 0 1 .3 1.2.8l1.2 4.1c.2.6-.1 1.3-.7 1.5l-2 .7c-.6.2-1.3-.1-1.5-.7L8.6 4.4c-.2-.6.1-1.3.7-1.5l2-.7c.1 0 .2-.1.3-.1Zm6.5 5.2c.4.3.6.9.4 1.4L17 12.5c-.2.6-.8.9-1.4.8l-2-.5c-.6-.2-1-.8-.8-1.4l1.1-4c.2-.6.8-1 1.4-.8l2 .6c.1 0 .3.1.4.2Zm-12.9.4c.1 0 .2 0 .4.1l3.6 1.9c.6.3.8 1 .5 1.5l-1 1.8c-.3.6-1 .8-1.5.5l-3.6-1.9c-.6-.3-.8-1-.5-1.5l1-1.8c.2-.4.7-.6 1.1-.6Zm15 5.5c.5 0 1 .4 1.1.9l.4 2.1c.1.6-.3 1.2-.9 1.3l-4 .8c-.6.1-1.2-.3-1.3-.9l-.4-2.1c-.1-.6.3-1.2.9-1.3l4-.8h.2Zm-12.4.3c.4.1.8.5.9.9l.7 2c.2.6-.1 1.3-.7 1.5l-3.8 1.4c-.6.2-1.3-.1-1.5-.7l-.7-2c-.2-.6.1-1.3.7-1.5l3.8-1.4c.2-.1.4-.1.6-.1Zm7.1 2.9c.3 0 .6.1.8.4l2.6 3.1c.4.5.4 1.2-.1 1.6l-1.6 1.3c-.5.4-1.2.4-1.6-.1l-2.6-3.1c-.4-.5-.4-1.2.1-1.6l1.6-1.3c.2-.2.5-.3.8-.3Z" />
  </svg>
);

const MedicalSpecialistFooterComponent = (
  props: MedicalSpecialistFooterProps & { id: string; puck: any },
) => {
  const streamDocument = useDocument<Record<string, unknown>>();
  const streamData = streamDocument as Record<string, unknown>;
  const locale =
    typeof streamData.meta === "object" &&
    streamData.meta &&
    typeof (streamData.meta as { locale?: unknown }).locale === "string"
      ? String((streamData.meta as { locale?: unknown }).locale)
      : typeof streamData.locale === "string"
        ? streamData.locale
        : "en";
  const contentWidth =
    pxOrUndefined(props.section.styles.contentWidth) ?? "1200px";
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "40px";
  const sectionForeground = getReadableSectionForeground(
    props.section.backgroundColor,
  );
  const brandName = (() => {
    const resolvedValue = resolveComponentData(
      props.brandText.text as any,
      locale,
      streamDocument,
    );
    const constantValue = props.brandText.text?.constantValue;
    const record =
      constantValue && typeof constantValue === "object"
        ? (constantValue as Record<string, unknown>)
        : undefined;
    const fallback =
      typeof constantValue === "string" || typeof constantValue === "number"
        ? String(constantValue)
        : typeof record?.text === "string"
          ? record.text
          : typeof record?.text === "number"
            ? String(record.text)
            : typeof record?.defaultValue === "string"
              ? record.defaultValue
              : typeof record?.defaultValue === "number"
                ? String(record.defaultValue)
                : readDocumentName(streamData);
    const resolvedRecord =
      resolvedValue && typeof resolvedValue === "object"
        ? (resolvedValue as Record<string, unknown>)
        : undefined;
    return (
      typeof resolvedValue === "string" || typeof resolvedValue === "number"
        ? String(resolvedValue)
        : typeof resolvedRecord?.text === "string"
          ? resolvedRecord.text
          : typeof resolvedRecord?.text === "number"
            ? String(resolvedRecord.text)
            : typeof resolvedRecord?.defaultValue === "string"
              ? resolvedRecord.defaultValue
              : typeof resolvedRecord?.defaultValue === "number"
                ? String(resolvedRecord.defaultValue)
                : fallback
    ).trim();
  })();
  const address = (() => {
    const resolvedValue = resolveComponentData(
      props.contactAddress.address as any,
      locale,
      streamDocument,
    );
    return resolvedValue && typeof resolvedValue === "object"
      ? (resolvedValue as Record<string, unknown>)
      : ({
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
          region: "",
        } as Record<string, unknown>);
  })();
  const resolvedLogoImage = resolveComponentData(
    props.logoImage.image as any,
    locale,
    streamDocument,
  );
  const logoImage =
    resolvedLogoImage && typeof resolvedLogoImage === "object"
      ? (resolveLocalizedAssetImage(
          resolvedLogoImage as TranslatableAssetImage,
          locale,
        ) ?? resolvedLogoImage)
      : undefined;
  const hasLogoImage = hasImageUrl(logoImage);
  const resolvedPhoneItems = (props.contactPhone.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number as any,
        locale,
        streamDocument,
      );
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      const normalizedLabel = item.label?.trim() ?? "";
      if (!normalizedNumber) {
        return null;
      }
      return {
        entityField: item.number,
        label: normalizedLabel,
        formattedNumber: formatPhone(
          normalizedNumber,
          props.contactPhone.phoneFormat,
        ),
        telDigits: normalizedNumber.replace(/\D/g, ""),
      };
    })
    .filter(
      (
        item,
      ): item is {
        entityField: YextEntityField<string>;
        label: string;
        formattedNumber: string;
        telDigits: string;
      } => item !== null,
    );

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistFooter${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{footerStyles}</style>
        <footer
          className="medical-specialist-footer"
          style={{
            backgroundColor: toThemeCss(
              props.section.backgroundColor?.selectedColor,
              "#7d9e77",
            ),
            color: toThemeCss(
              props.section.backgroundColor?.contrastingColor,
              "#ffffff",
            ),
            padding: `${verticalPadding} 40px`,
          }}
        >
          <div
            className="medical-specialist-footer__inner"
            style={{ maxWidth: contentWidth }}
          >
            <div className="medical-specialist-footer__top">
              {hasLogoImage ? (
                <EntityField
                  displayName="Logo Image"
                  fieldId={props.logoImage.image.field}
                  constantValueEnabled={
                    props.logoImage.image.constantValueEnabled
                  }
                >
                  <Link
                    className="medical-specialist-footer__mark"
                    cta={{ link: "#", linkType: "URL" }}
                    aria-label={brandName}
                    eventName="footerLogo"
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "40px",
                        aspectRatio:
                          props.logoImage.aspectRatio > 0
                            ? String(props.logoImage.aspectRatio)
                            : undefined,
                        borderRadius: pxOrUndefined(
                          props.logoImage.styles?.borderRadius,
                        ),
                        overflow:
                          props.logoImage.imageConstrain === "filled" ||
                          Boolean(
                            props.logoImage.styles?.borderRadius &&
                            props.logoImage.styles.borderRadius !== "default",
                          )
                            ? "hidden"
                            : undefined,
                      }}
                    >
                      <Image
                        image={logoImage as any}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit:
                            props.logoImage.imageConstrain === "fixed"
                              ? "contain"
                              : "cover",
                        }}
                      />
                    </div>
                  </Link>
                </EntityField>
              ) : null}
              <div className="medical-specialist-footer__columns">
                <div className="medical-specialist-footer__links">
                  <p className="medical-specialist-footer__links-copy">
                    <EntityField
                      displayName="Brand Text"
                      fieldId={props.brandText.text.field}
                      constantValueEnabled={
                        props.brandText.text.constantValueEnabled
                      }
                    >
                      <Link
                        className="medical-specialist-footer__link"
                        cta={{ link: "#", linkType: "URL" }}
                        eventName="footerBrand"
                        style={getTextStyle(
                          props.brandText.styles,
                          props.brandText.fontColor,
                          sectionForeground,
                        )}
                      >
                        {brandName}
                      </Link>
                    </EntityField>
                    {(props.footerLinks ?? []).map((item, index) => {
                      const label = getFooterLinkSummary(item, index);

                      return (
                        <Link
                          key={`${label}-${index}`}
                          className={`medical-specialist-footer__link${
                            shouldIncludeCaret(props.linkStyles.includeCaret)
                              ? " medical-specialist-footer__link--with-caret"
                              : ""
                          }`}
                          cta={{
                            link: item.link.trim() || "#",
                            linkType: "URL",
                          }}
                          eventName={`footerLink${index}`}
                          target={
                            item.openInNewTab
                              ? "_blank"
                              : props.puck.isEditing
                                ? undefined
                                : "_top"
                          }
                          style={getLinkStyle(
                            props.linkStyles,
                            props.linkColor,
                            sectionForeground,
                          )}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </p>
                  <div
                    className="medical-specialist-footer__social"
                    aria-label="Social links"
                  >
                    <span
                      className="medical-specialist-footer__social-icon"
                      aria-hidden="true"
                    >
                      <FacebookIcon />
                    </span>
                    <span
                      className="medical-specialist-footer__social-icon"
                      aria-hidden="true"
                    >
                      <InstagramIcon />
                    </span>
                    <span
                      className="medical-specialist-footer__social-icon"
                      aria-hidden="true"
                    >
                      <YelpIcon />
                    </span>
                  </div>
                </div>
                <div className="medical-specialist-footer__contact">
                  <EntityField
                    displayName="Contact Address"
                    fieldId={props.contactAddress.address.field}
                    constantValueEnabled={
                      props.contactAddress.address.constantValueEnabled
                    }
                  >
                    <div
                      style={getTextStyle(
                        props.contactAddressStyles,
                        props.contactAddressColor,
                        sectionForeground,
                      )}
                    >
                      <Address
                        address={address as any}
                        showRegion={props.contactAddress.showRegion}
                        showCountry={props.contactAddress.showCountry}
                      />
                    </div>
                  </EntityField>
                  {resolvedPhoneItems.map((item, index) => (
                    <EntityField
                      key={`${item.formattedNumber}-${index}`}
                      displayName="Contact Phone"
                      fieldId={item.entityField.field}
                      constantValueEnabled={
                        item.entityField.constantValueEnabled
                      }
                    >
                      {props.contactPhone.includeHyperlink !== false ? (
                        <Link
                          className="medical-specialist-footer__contact-link"
                          cta={{
                            link: item.telDigits,
                            linkType: "PHONE",
                          }}
                          eventName={`footerPhone${index}`}
                          style={getTextStyle(
                            props.contactPhoneStyles,
                            props.contactPhoneColor,
                            sectionForeground,
                          )}
                        >
                          {item.label
                            ? `${item.label} ${item.formattedNumber}`
                            : item.formattedNumber}
                        </Link>
                      ) : (
                        <p
                          style={getTextStyle(
                            props.contactPhoneStyles,
                            props.contactPhoneColor,
                            sectionForeground,
                          )}
                        >
                          {item.label
                            ? `${item.label} ${item.formattedNumber}`
                            : item.formattedNumber}
                        </p>
                      )}
                    </EntityField>
                  ))}
                  <EntityField
                    displayName="Website CTA"
                    fieldId={props.contactWebsite.data?.cta.field}
                    constantValueEnabled={
                      props.contactWebsite.data?.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      className="medical-specialist-footer__contact-link"
                      value={
                        props.contactWebsite as Partial<ComprehensiveCTAValue>
                      }
                      eventName="footerWebsite"
                      target={
                        props.contactWebsite.data?.openInNewTab
                          ? "_blank"
                          : props.puck.isEditing
                            ? undefined
                            : "_top"
                      }
                      style={getTextStyle(
                        props.contactPhoneStyles,
                        props.contactPhoneColor,
                        sectionForeground,
                      )}
                    />
                  </EntityField>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistFooter: YextComponentConfig<MedicalSpecialistFooterProps> =
  {
    label: "Footer",
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
          styles: {
            label: "Section Styles",
            type: "styledPageSection",
          },
        },
      },
      logoImage: {
        label: "Logo Image",
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
      linkStyles: {
        label: "Link Styles",
        type: "styledLink",
      },
      linkColor: {
        label: "Link Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      brandText: {
        label: "Brand Text Styles",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Brand Name",
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
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
        },
      },
      footerLinks: {
        label: "Footer Links",
        type: "array",
        arrayFields: {
          label: {
            label: "Label",
            type: "text",
          },
          link: {
            label: "Link",
            type: "text",
          },
          openInNewTab: {
            label: "Open in New Tab",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
        defaultItemProps: {
          label: "Footer Link",
          link: "#",
          openInNewTab: false,
        },
        getItemSummary: (item: FooterLink, index?: number) =>
          getFooterLinkSummary(item, index),
      },
      contactAddress: {
        label: "Contact Address",
        type: "object",
        objectFields: {
          address: {
            type: "entityField",
            label: "Address",
            filter: {
              types: ["type.address"],
            },
          },
          showRegion: {
            label: "Show Region",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showCountry: {
            label: "Show Country",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      contactAddressStyles: {
        label: "Contact Address Styles",
        type: "styledText",
      },
      contactAddressColor: {
        label: "Contact Address Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      contactPhone: {
        label: "Contact Phone",
        type: "object",
        objectFields: {
          items: {
            label: "Items",
            type: "array",
            arrayFields: {
              number: {
                type: "entityField",
                label: "Number",
                filter: {
                  types: ["type.phone"],
                },
              },
              label: {
                label: "Label",
                type: "text",
              },
            },
            defaultItemProps: {
              number: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              } as YextEntityField<string>,
              label: "",
            },
          },
          phoneFormat: {
            label: "Phone Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      contactPhoneStyles: {
        label: "Contact Phone Styles",
        type: "styledText",
      },
      contactPhoneColor: {
        label: "Contact Phone Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      contactWebsite: {
        label: "Contact Website",
        type: "comprehensiveCTA",
      },
    },
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        visibleOnLivePage: true,
        styles: {
          contentWidth: "1280px",
          verticalPadding: "40px",
        },
      },
      logoImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/OLT2KExDEKhKlCmIobyRRHN6MFUS77fVs5gIt_FTnBI/450x450.jpg",
            width: 450,
            height: 450,
            alternateText: "Logo",
          },
          constantValueEnabled: true,
        },
        aspectRatio: 0,
        imageConstrain: "fixed",
        styles: {
          borderRadius: "default",
        },
      },
      linkStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "16px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
        letterSpacing: "-0.02em",
        includeCaret: "none",
      },
      linkColor: undefined,
      brandText: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: false,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "'Krub', 'Krub Fallback', sans-serif",
          fontSize: "16px",
          fontWeight: "500",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      footerLinks: [
        {
          label: "Specialties",
          link: "#",
          openInNewTab: false,
        },
        {
          label: "Providers",
          link: "#",
          openInNewTab: false,
        },
        {
          label: "Insurance",
          link: "#",
          openInNewTab: false,
        },
        {
          label: "Patient Resources",
          link: "#",
          openInNewTab: false,
        },
        {
          label: "Contact",
          link: "#",
          openInNewTab: false,
        },
      ],
      contactAddress: {
        address: {
          field: "address",
          constantValue: {
            line1: "",
            city: "",
            postalCode: "",
            countryCode: "",
            region: "",
          },
          constantValueEnabled: false,
        },
        showRegion: true,
        showCountry: false,
      },
      contactAddressStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "16px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
      },
      contactAddressColor: undefined,
      contactPhone: {
        items: [
          {
            number: {
              field: "mainPhone",
              constantValue: "+1 (303) 555-0142",
              constantValueEnabled: false,
            },
            label: "",
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      contactPhoneStyles: {
        fontFamily: "'Krub', 'Krub Fallback', sans-serif",
        fontSize: "16px",
        fontWeight: "500",
        fontStyle: "default",
        textTransform: "default",
      },
      contactPhoneColor: undefined,
      contactWebsite: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "https://www.example.com",
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
      },
    },
    render: (props) => <MedicalSpecialistFooterComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
