'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React from 'react';

import BasemapsControl from '../node_modules/maplibre-gl-basemaps/lib/index';
import 'maplibre-gl-basemaps/lib/basemaps.css';


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
                    'std': {
                        type: 'raster',
                        tiles: [
                            'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
                        ],
                        tileSize: 256,
                        attribution:
                            '国土地理院 <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル一覧ページ</a>',
                    },
                    'pale': {
                        type: 'raster',
                        tiles: [
                            'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
                        ],
                        tileSize: 256,
                        attribution:
                            '国土地理院 <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル一覧ページ</a>',
                    },
                    'seamlessphoto': {
                        type: 'raster',
                        tiles: [
                            'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
                        ],
                        tileSize: 256,
                        attribution:
                            '国土地理院 <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル一覧ページ</a>',
                    },
                },
                layers: [
                    {
                        id: 'std',
                        type: 'raster',
                        source: 'std',
                        minzoom: 0,
                        maxzoom: 18,
                    },
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

        map.current.addControl(
            new BasemapsControl(
                {
                    basemaps: [
                        {
                            id: "ortoEsri",
                            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
                            sourceExtraParams: {
                                tileSize: 256,
                                attribution: "ESRI &copy; <a href='http://www.esri.com'>ESRI</a>",
                                minzoom: 0,
                                maxzoom: 22
                            }
                        },
                        {
                            id: "OpenStreetMap",
                            tiles: [
                                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                            ],
                            sourceExtraParams: {
                                tileSize: 256,
                                attribution: "&copy; OpenStreetMap Contributors",
                                minzoom: 0,
                                maxzoom: 20
                            }
                        }
                    ],
                    initialBasemap: "OpenStreetMap",
                    expandDirection: "top"
                }),
            "bottom-left"
        );

        map.current.on('load', () => {
            if (!map.current) return;

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

