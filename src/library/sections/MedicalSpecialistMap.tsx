import type { SectionConfig } from "@yext/visual-editor";

import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  MapboxStaticMapComponent,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  mapboxStaticMapStyleOptions,
  type StyledPageSectionValue,
  type ThemeColor,
  type YextComponentConfig,
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

const pxOrUndefined = (value?: string) =>
  !value || value === "default" ? undefined : value;

type MedicalSpecialistMapProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
    styles: StyledPageSectionValue;
  };
  map: {
    coordinate: {
      field: string;
      constantValue: {
        latitude: number;
        longitude: number;
      };
      constantValueEnabled?: boolean;
    };
    mapStyle: string;
    zoom: number;
  };
};

const mapStyles = `
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

.medical-specialist-map {
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow-x: clip;
}

.medical-specialist-map__frame {
  width: 100%;
  min-height: 420px;
  background: #16211c;
  overflow: hidden;
}

.medical-specialist-map__frame .mapbox-static-map-shell,
.medical-specialist-map__frame .mapbox-static-map-picture,
.medical-specialist-map__frame .mapbox-static-map-image {
  width: 100%;
  height: 100%;
}

.medical-specialist-map__frame .mapbox-static-map-image {
  object-fit: cover;
  object-position: center;
}

@media (max-width: 1199px) {
  .medical-specialist-map__frame {
    min-height: 360px;
  }
}

@media (max-width: 809px) {
  .medical-specialist-map__frame {
    min-height: 280px;
  }
}
`;

const MedicalSpecialistMapComponent = (
  props: MedicalSpecialistMapProps & { id: string; puck: any },
) => {
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "0px";

  const mapStyle =
    props.map.mapStyle?.replace(/^(mapbox\/|mapbox-)/, "") || "dark-v11";

  return (
    <AnalyticsScopeProvider
      name={`MedicalSpecialistMap${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{mapStyles}</style>
        <section
          className="medical-specialist-map"
          style={{
            backgroundColor: toThemeCss(
              props.section.backgroundColor?.selectedColor,
              "#fdf7f4",
            ),
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
          }}
        >
          <div className="medical-specialist-map__frame">
            <EntityField
              displayName="Map Coordinates"
              fieldId={props.map.coordinate.field}
              constantValueEnabled={props.map.coordinate.constantValueEnabled}
              fullHeight
            >
              <MapboxStaticMapComponent
                coordinate={props.map.coordinate}
                height="100%"
                mapStyle={mapStyle}
                zoom={props.map.zoom}
                puck={props.puck}
                id={props.id}
              />
            </EntityField>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistMap: YextComponentConfig<MedicalSpecialistMapProps> =
  {
    label: "Map",
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
      map: {
        label: "Map",
        type: "object",
        objectFields: {
          coordinate: {
            type: "entityField",
            label: "Coordinates",
            filter: { types: ["type.coordinate"] },
          },
          mapStyle: {
            label: "Mapbox Map Style",
            type: "select",
            options: mapboxStaticMapStyleOptions,
          },
          zoom: {
            label: "Zoom",
            type: "number",
            min: 0,
            max: 22,
          },
        },
      },
    },
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        visibleOnLivePage: true,
        styles: {
          contentWidth: "default",
          verticalPadding: "0px",
        },
      },
      map: {
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        },
        mapStyle: "dark-v11",
        zoom: 15,
      },
    },
    render: (props) => <MedicalSpecialistMapComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "MedicalSpecialistMap",
  displayName: "Map",
  description: "Map",
  pageSetTypes: ["ENTITY"],
};
