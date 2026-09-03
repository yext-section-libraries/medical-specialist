import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getThemeColorCssValue,
  resolveBreadcrumbs,
  resolveComponentData,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
  type StyledPageSectionValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "@yext/visual-editor";

type StyledText = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type MedicalSpecialistBreadcrumbsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  rootLabel: StyledText;
  includeCurrentLocation: boolean;
};

const MedicalSpecialistBreadcrumbsComponent = (
  props: MedicalSpecialistBreadcrumbsProps & {
    id: string;
    puck: { isEditing: boolean };
  },
): React.JSX.Element => {
  const streamDocument = useDocument();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const breadcrumbs = resolveBreadcrumbs(streamDocument);
  const locale = streamDocument.locale ?? "en";
  const rootLabel = resolveComponentData(
    props.rootLabel.text,
    locale,
    streamDocument,
  );
  const sectionWidth =
    props.section.styles.contentWidth === "default"
      ? "var(--maxWidth-pageSection-contentWidth)"
      : props.section.styles.contentWidth;
  const verticalPadding =
    props.section.styles.verticalPadding === "default"
      ? "var(--padding-pageSection-verticalPadding)"
      : props.section.styles.verticalPadding;

  if (!breadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistBreadcrumbs${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <section
          style={{
            backgroundColor: getThemeColorCssValue(
              props.section.backgroundColor.selectedColor,
            ),
            padding: `${verticalPadding} 40px`,
          }}
        >
          <nav
            aria-label="Breadcrumb"
            className="mx-auto"
            style={{ maxWidth: sectionWidth }}
          >
            <ol className="m-0 flex list-none flex-wrap items-center gap-y-1 p-0">
              {breadcrumbs.map(({ name, slug }, index) => {
                const isRoot = index === 0;
                const isCurrentLocation = index === breadcrumbs.length - 1;

                if (
                  isCurrentLocation &&
                  !isRoot &&
                  !props.includeCurrentLocation
                ) {
                  return null;
                }

                const label = isRoot
                  ? rootLabel || name
                  : isCurrentLocation
                    ? streamDocument.name || name
                    : name;
                const linkStyles: React.CSSProperties = {
                  color: getThemeColorCssValue(
                    props.rootLabel.fontColor?.selectedColor ??
                      props.section.backgroundColor.contrastingColor,
                  ),
                  fontFamily:
                    props.rootLabel.styles.fontFamily === "default"
                      ? "var(--fontFamily-link-fontFamily)"
                      : props.rootLabel.styles.fontFamily,
                  fontSize:
                    props.rootLabel.styles.fontSize === "default"
                      ? "var(--fontSize-link-fontSize)"
                      : props.rootLabel.styles.fontSize,
                  fontWeight:
                    props.rootLabel.styles.fontWeight === "default"
                      ? "var(--fontWeight-link-fontWeight)"
                      : props.rootLabel.styles.fontWeight,
                  fontStyle:
                    props.rootLabel.styles.fontStyle === "default"
                      ? undefined
                      : props.rootLabel.styles.fontStyle,
                  textTransform:
                    props.rootLabel.styles.textTransform === "default"
                      ? "var(--textTransform-link-textTransform)"
                      : props.rootLabel.styles.textTransform,
                  letterSpacing: "var(--letterSpacing-link-letterSpacing)",
                  lineHeight: 1.5,
                };

                return (
                  <React.Fragment key={`${slug}-${index}`}>
                    {index > 0 ? (
                      <li
                        aria-hidden
                        className="mx-2 flex items-center"
                        style={linkStyles}
                      >
                        /
                      </li>
                    ) : null}
                    <li className="flex items-center">
                      {isCurrentLocation ? (
                        <span className="flex items-center" style={linkStyles}>
                          {label}
                        </span>
                      ) : isRoot ? (
                        <EntityField
                          displayName="Root Label"
                          fieldId={props.rootLabel.text.field}
                          constantValueEnabled={
                            props.rootLabel.text.constantValueEnabled
                          }
                        >
                          <Link
                            className="flex items-center"
                            eventName={`breadcrumbLink${index}`}
                            href={
                              relativePrefixToRoot
                                ? relativePrefixToRoot + slug
                                : slug
                            }
                            style={linkStyles}
                          >
                            {label}
                          </Link>
                        </EntityField>
                      ) : (
                        <Link
                          className="flex items-center"
                          eventName={`breadcrumbLink${index}`}
                          href={
                            relativePrefixToRoot
                              ? relativePrefixToRoot + slug
                              : slug
                          }
                          style={linkStyles}
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  </React.Fragment>
                );
              })}
            </ol>
          </nav>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistBreadcrumbs: YextComponentConfig<MedicalSpecialistBreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    fields: {
      section: {
        label: "Section",
        type: "object",
        objectFields: {
          backgroundColor: {
            label: "Background Color",
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
      rootLabel: {
        label: "Root Label",
        type: "object",
        objectFields: {
          text: {
            label: "Text",
            type: "entityField",
            filter: { types: ["type.string"], includeListsOnly: false },
          },
          styles: { label: "Text Styles", type: "styledText" },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      includeCurrentLocation: {
        label: "Include Current Location",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
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
      rootLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Locations",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      includeCurrentLocation: true,
    },
    render: (props) => <MedicalSpecialistBreadcrumbsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
