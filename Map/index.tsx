'use client';
import { useEffect, useRef } from 'react';
import maplibregl, { LayerSpecification, RasterDEMTileSource, RasterLayerSpecification, RasterSourceSpecification, RasterTileSource, SourceSpecification, VectorSourceSpecification, VectorTileSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React from 'react';

import OpacityControl from '../node_modules/maplibre-gl-opacity/build/maplibre-gl-opacity';


interface Layers {
    [prop: string]: string
}

interface TILE_MAP {
    id: string,
    label: string,
    type: string,
    source: string,
    minzoom: number,
    maxzoom: number,
    tiles: string[],
    tileSize: number,
    attribution: string
};


const TILE_MAPS: TILE_MAP[] = [
    {
        id: 'osm',
        label: 'OSM',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19,
        tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution:
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    },
    {
        id: 'std',
        label: '標準地図',
        type: 'raster',
        source: 'std',
        minzoom: 0,
        maxzoom: 18,
        tiles: [
            'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution:
            '国土地理院 <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル一覧ページ</a>',
    },
    {
        id: 'pale',
        label: '淡色地図',
        type: 'raster',
        source: 'pale',
        minzoom: 0,
        maxzoom: 18,
        tiles: [
            'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution:
            '国土地理院 <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル一覧ページ</a>',
    },
    {
        id: 'seamlessphoto',
        label: '写真',
        type: 'raster',
        source: 'seamlessphoto',
        minzoom: 0,
        maxzoom: 18,
        tiles: [
            'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
        ],
        tileSize: 256,
        attribution:
            '国土地理院 <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル一覧ページ</a>',
    },
];


export default function Map() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    [TILE_MAPS[0].id]: {
                        type: TILE_MAPS[0].type,
                        tiles: TILE_MAPS[0].tiles,
                        tileSize: TILE_MAPS[0].tileSize,
                        attribution:
                            TILE_MAPS[0].attribution,
                    } as SourceSpecification
                },
                layers: [
                    {
                        id: TILE_MAPS[0].id,
                        type: TILE_MAPS[0].type,
                        source: TILE_MAPS[0].source,
                        minzoom: TILE_MAPS[0].minzoom,
                        maxzoom: TILE_MAPS[0].maxzoom,
                    } as LayerSpecification
                ],
            },
            center: [139.75688, 35.68345],
            zoom: 14,
            bearing: 0,
            pitch: 0,
        });

        map.current.addControl(new maplibregl.NavigationControl());

        map.current.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
            })
        );

        map.current.on('load', () => {
            if (!map.current) return;

            let mapBaseLayer: Layers = {};
            let mapOverLayer: Layers = {};

            mapBaseLayer[TILE_MAPS[0].id] = TILE_MAPS[0].label;
            // mapOverLayer[TILE_MAPS[0].id] = TILE_MAPS[0].label;

            TILE_MAPS.slice(1).forEach(tilemap => {
                if (!map.current) return;

                mapBaseLayer[tilemap.id] = tilemap.label;
                mapOverLayer[tilemap.id] = tilemap.label;

                map.current.addSource(
                    tilemap.id,
                    {
                        type: tilemap.type,
                        tiles: tilemap.tiles,
                        tileSize: tilemap.tileSize,
                    } as SourceSpecification
                );
                map.current.addLayer(
                    {
                        id: tilemap.id,
                        type: tilemap.type,
                        source: tilemap.source,
                        minzoom: tilemap.minzoom,
                        maxzoom: tilemap.maxzoom,
                    } as LayerSpecification
                );
            });

            map.current.addSource('places', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {
                                title: '皇居',
                                description: '東京都千代田区千代田1-1',
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    139.75688, 35.68345,
                                ],
                            },
                        },
                    ],
                },
            });

            map.current.addLayer({
                id: 'places',
                type: 'circle',
                source: 'places',
                paint: {
                    'circle-radius': 5,
                    'circle-color': 'transparent',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'red',
                },
            });


            map.current.addControl(new OpacityControl({
                baseLayers: mapBaseLayer,
                overLayers: mapOverLayer,
                opacityControl: true,
            }), 'bottom-right');
        });

        map.current.on('click', 'places', (e: maplibregl.MapMouseEvent) => {
            console.log(e);

            if (map.current === null) return;

            const coordinates = e.lngLat;
            const popup = new maplibregl.Popup();

            popup
                .setLngLat(coordinates)
                .setHTML(`<p style="color:aqua;">${coordinates}</p>`)
                .addTo(map.current);
        });

        if (!map.current) return;
    }, []);

    return (
        <div
            className="h-full"
            ref={mapContainer}
        ></div>
    );
}

