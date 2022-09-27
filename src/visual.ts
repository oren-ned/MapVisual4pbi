/*
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import "./../node_modules/leaflet/dist/leaflet.css";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as L from "leaflet";

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private map: L.Map;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        this.updateCount = 0;
        // Fill the target element with the Leaflet map
        this.target.style.width = "100%";
        this.target.style.height = "100%";

        // Base maps
        var OnImage = L.tileLayer.wms("https://intra.ws.lioservices.lrc.gov.on.ca/arcgis1071a/services/LIO_Imagery/Ontario_Imagery_Web_Map_Service/MapServer/WMSServer", { layers: '0', attribution: '&copy; LIO', minZoom: 1, maxZoom: 20});
        //var OnTopo = L.tileLayer.wms("https://ws.lioservices.lrc.gov.on.ca/arcgis1061a/rest/services/LIO_Cartographic/LIO_Topographic/MapServer/WMTS", { layers: 'LIO_Cartographic_LIO_Topographic', attribution: 'LIO', minZoom: 1, maxZoom: 20});
        
        var SimpleMap = L.tileLayer.wms("https://intra.dev.regionalgis.mto.gov.on.ca/geoserver/wms", { layers: 'Simple_Background_Basemap', format: 'image/png', transparent: true, attribution: '&copy; MTO-NER', minZoom: 1, maxZoom: 20});
        var Esri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {attribution: 'ESRI', minZoom: 1, maxZoom: 20}); 
        var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; OSM', minZoom: 1, maxZoom: 20});
        var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenTopoMap', minZoom: 1, maxZoom: 20});
        var white = L.tileLayer("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEX///+nxBvIAAAAH0lEQVQYGe3BAQ0AAADCIPunfg43YAAAAAAAAAAA5wIhAAAB9aK9BAAAAABJRU5ErkJggg==");
        //var localm = L.tileLayer('./basemaps/Liddell_tiles/{z}/{x}/{y}.png', {tms: false, attribution: 'Local Map'});
        
 
        // Overlay layers
        var lyr = L.tileLayer('./basemaps/Liddell_tiles/{z}/{x}/{y}.png', {tms: true, opacity: 8.0, attribution: "Local Map Layer"});
        var rail_lyr = L.tileLayer('http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {tms: false, opacity: 0.8, attribution: "Railway"});
        var MTO_Township = L.tileLayer.wms("https://intra.dev.regionalgis.mto.gov.on.ca/geoserver/wms", { layers: 'SmartCL:mto_townships_v2', attribution: '&copy; MTO-NER', format: 'image/png', transparent: true, minZoom: 1, maxZoom: 20});
        var MTO_Highways = L.tileLayer.wms("https://intra.dev.regionalgis.mto.gov.on.ca/geoserver/wms", { layers: 'road_interest:mto_jurisdiction_provincial_integrated', format: 'image/png', transparent: true, opacity: 0.8, attribution: '&copy; MTO-NER', minZoom: 1, maxZoom: 20});
        //var SimpleMap = L.tileLayer.wms("https://intra.dev.regionalgis.mto.gov.on.ca/geoserver/wms", { layers: 'Simple_Background_Basemap', format: 'image/png', transparent: true, attribution: 'MTO-NER', minZoom: 1, maxZoom: 20});

        var basemaps = {"OpenStreetMap": osm, "Esri Map": Esri, "Ontario Image":  OnImage,  "OpenTopoMap":topo, "Without background": white}
        var overlaymaps = {"MTO SimpleMap": SimpleMap,"MTO_Highways": MTO_Highways , "Railway":rail_lyr}
        
        if (typeof document !== "undefined") {
            this.map = L.map(this.target, {
                center: [47.11, -81.01],
                crs:L.CRS.EPSG3857,
                zoom: 6,
                minZoom: 1,
                maxZoom: 20,
                layers: [SimpleMap, white]});
                
            L.control.layers(basemaps, overlaymaps, {collapsed: true}).addTo(this.map);
            L.control.scale().addTo(this.map);
            // Fit to overlay bounds (SW and NE points with (lat, lon))
            //this.map.fitBounds([[-32.4500134427752, 151.04997219524756], [-32.31, 150.84999999999997]]);        
        }


    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        if (this.textNode) {
            this.textNode.textContent = (this.updateCount++).toString();
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}