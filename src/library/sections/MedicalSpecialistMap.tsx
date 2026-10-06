import "../shared/typography.css";

import type { SectionConfig } from "@yext/visual-editor";
import { pxOrUndefined } from "../shared/sectionHelpers";

import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  msg,
  Background,
  EntityField,
  MapboxStaticMapComponent,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  mapboxStaticMapStyleOptions,
  useDocument,
  type StyledPageSectionValue,
  type ThemeColor,
  type YextComponentConfig,
} from "@yext/visual-editor";

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
  background: var(--colors-palette-secondary);
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
  const streamDocument = useDocument();
  const verticalPadding =
    pxOrUndefined(props.section.styles.verticalPadding) ?? "var(--padding-pageSection-verticalPadding)";

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
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="medical-specialist-map"
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
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
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const MedicalSpecialistMap: YextComponentConfig<MedicalSpecialistMapProps> =
  {
    label: msg("components.map", "Map"),
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
      map: {
        label: msg("fields.map", "Map"),
        type: "object",
        objectFields: {
          coordinate: {
            type: "entityField",
            label: msg("fields.coordinates", "Coordinates"),
            filter: { types: ["type.coordinate"] },
          },
          mapStyle: {
            label: msg("fields.mapboxMapStyle", "Mapbox Map Style"),
            type: "select",
            options: mapboxStaticMapStyleOptions,
          },
          zoom: {
            label: msg("fields.zoom", "Zoom"),
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
