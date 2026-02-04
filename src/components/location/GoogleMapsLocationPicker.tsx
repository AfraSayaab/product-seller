//@ts-nocheck
// ===============================
// components/location/GoogleMapsLocationPicker.tsx
// Google Maps location picker component
// ===============================
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, X } from "lucide-react";
import { toast } from "sonner";

type LocationData = {
    country: string;
    state?: string | null;
    city: string;
    area?: string | null;
    lat?: number | null;
    lng?: number | null;
    formattedAddress?: string;
};

type GoogleMapsLocationPickerProps = {
    value?: LocationData | null;
    onChange?: (location: LocationData | null) => void;
    label?: string;
    helperText?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
};

export default function GoogleMapsLocationPicker({
    value,
    onChange,
    label = "Location",
    helperText,
    className,
    disabled = false,
    required = false,
}: GoogleMapsLocationPickerProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isSearching, setIsSearching] = React.useState(false);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [map, setMap] = React.useState<google.maps.Map | null>(null);
    const [marker, setMarker] = React.useState<google.maps.Marker | null>(null);
    const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);
    const [geocoder, setGeocoder] = React.useState<google.maps.Geocoder | null>(null);

    const mapRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Load Google Maps script
    React.useEffect(() => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            setMapLoaded(true);
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDijK09y0RP-uPi2zbhgMy8mI3xM_cD9n4";
        if (!apiKey) {
            console.warn("Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file");
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setMapLoaded(true);
        };
        script.onerror = () => {
            console.error("Failed to load Google Maps script");
            toast.error("Failed to load map. Please check your Google Maps API key.");
        };
        document.head.appendChild(script);

        return () => {
            // Don't remove script on unmount as it might be used by other components
        };
    }, []);

    // Initialize map and autocomplete
    React.useEffect(() => {
        if (!mapLoaded || !mapRef.current || !searchInputRef.current) return;
        if (!window.google || !window.google.maps) return;

        let mapInstance: google.maps.Map | null = null;
        let autocompleteInstance: google.maps.places.Autocomplete | null = null;
        let geocoderInstance: google.maps.Geocoder | null = null;
        let currentMarker: google.maps.Marker | null = null;

        try {
            // Initialize map
            const initialCenter = value?.lat && value?.lng
                ? { lat: value.lat, lng: value.lng }
                : { lat: 31.5204, lng: 74.3587 }; // Default to Lahore, Pakistan

            mapInstance = new google.maps.Map(mapRef.current, {
                center: initialCenter,
                zoom: value?.lat && value?.lng ? 15 : 10,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
            });

            setMap(mapInstance);

            // Initialize geocoder
            geocoderInstance = new google.maps.Geocoder();
            setGeocoder(geocoderInstance);

            // Initialize autocomplete
            autocompleteInstance = new google.maps.places.Autocomplete(
                searchInputRef.current,
                {
                    types: ["geocode", "establishment"],
                    fields: ["address_components", "geometry", "formatted_address"],
                }
            );

            autocompleteInstance.bindTo("bounds", mapInstance);
            setAutocomplete(autocompleteInstance);

            // Handle place selection
            const placeChangedListener = autocompleteInstance.addListener("place_changed", () => {
                const place = autocompleteInstance!.getPlace();
                if (!place.geometry || !mapInstance) {
                    toast.error("No details available for this location");
                    return;
                }

                const locationData = extractLocationData(place);
                if (onChange) {
                    onChange(locationData);
                }

                // Update map
                mapInstance.setCenter(place.geometry.location!);
                mapInstance.setZoom(15);

                // Update marker
                if (currentMarker) {
                    currentMarker.setPosition(place.geometry.location!);
                } else {
                    currentMarker = new google.maps.Marker({
                        position: place.geometry.location!,
                        map: mapInstance,
                        draggable: true,
                    });
                    setMarker(currentMarker);

                    // Handle marker drag
                    currentMarker.addListener("dragend", () => {
                        const position = currentMarker!.getPosition();
                        if (position && geocoderInstance) {
                            geocoderInstance.geocode({ location: position }, (results, status) => {
                                if (status === "OK" && results && results[0]) {
                                    const locationData = extractLocationDataFromGeocode(results[0], position);
                                    if (onChange) {
                                        onChange(locationData);
                                    }
                                }
                            });
                        }
                    });
                }
            });

            // Handle map click
            const mapClickListener = mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
                if (!e.latLng || !mapInstance || !geocoderInstance) return;

                if (currentMarker) {
                    currentMarker.setPosition(e.latLng);
                } else {
                    currentMarker = new google.maps.Marker({
                        position: e.latLng,
                        map: mapInstance,
                        draggable: true,
                    });
                    setMarker(currentMarker);

                    currentMarker.addListener("dragend", () => {
                        const position = currentMarker!.getPosition();
                        if (position && geocoderInstance) {
                            geocoderInstance.geocode({ location: position }, (results, status) => {
                                if (status === "OK" && results && results[0]) {
                                    const locationData = extractLocationDataFromGeocode(results[0], position);
                                    if (onChange) {
                                        onChange(locationData);
                                    }
                                }
                            });
                        }
                    });
                }

                // Reverse geocode
                geocoderInstance.geocode({ location: e.latLng }, (results, status) => {
                    if (status === "OK" && results && results[0]) {
                        const locationData = extractLocationDataFromGeocode(results[0], e.latLng!);
                        if (onChange) {
                            onChange(locationData);
                        }
                    }
                });
            });

            // Set initial marker if value exists
            if (value?.lat && value?.lng && mapInstance) {
                currentMarker = new google.maps.Marker({
                    position: { lat: value.lat, lng: value.lng },
                    map: mapInstance,
                    draggable: true,
                });
                setMarker(currentMarker);

                currentMarker.addListener("dragend", () => {
                    const position = currentMarker!.getPosition();
                    if (position && geocoderInstance) {
                        geocoderInstance.geocode({ location: position }, (results, status) => {
                            if (status === "OK" && results && results[0]) {
                                const locationData = extractLocationDataFromGeocode(results[0], position);
                                if (onChange) {
                                    onChange(locationData);
                                }
                            }
                        });
                    }
                });
            }

            // Cleanup
            return () => {
                if (placeChangedListener) {
                    google.maps.event.removeListener(placeChangedListener);
                }
                if (mapClickListener) {
                    google.maps.event.removeListener(mapClickListener);
                }
                if (currentMarker) {
                    currentMarker.setMap(null);
                }
            };
        } catch (error) {
            console.error("Error initializing Google Maps:", error);
            toast.error("Failed to load map");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapLoaded]); // Only depend on mapLoaded, handle value changes separately

    // Update marker position when value changes
    React.useEffect(() => {
        if (!map || !marker || !value?.lat || !value?.lng) return;
        
        const lat = value.lat;
        const lng = value.lng;
        
        // Only update if position actually changed
        const currentPos = marker.getPosition();
        if (currentPos && currentPos.lat() === lat && currentPos.lng() === lng) {
            return;
        }
        
        marker.setPosition({ lat, lng });
        map.setCenter({ lat, lng });
        map.setZoom(15);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.lat, value?.lng]); // Remove map and marker from dependencies

    const extractLocationData = (place: google.maps.places.PlaceResult): LocationData => {
        const location: LocationData = {
            country: "",
            city: "",
            state: null,
            area: null,
            lat: place.geometry?.location?.lat() || null,
            lng: place.geometry?.location?.lng() || null,
            formattedAddress: place.formatted_address || undefined,
        };

        if (place.address_components) {
            place.address_components.forEach((component) => {
                const types = component.types;
                if (types.includes("country")) {
                    location.country = component.short_name || component.long_name || "";
                }
                if (types.includes("administrative_area_level_1")) {
                    location.state = component.long_name || null;
                }
                if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                    location.city = component.long_name || "";
                }
                if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                    location.area = component.long_name || null;
                }
            });
        }

        return location;
    };

    const extractLocationDataFromGeocode = (
        result: google.maps.GeocoderResult,
        position: google.maps.LatLng
    ): LocationData => {
        const location: LocationData = {
            country: "",
            city: "",
            state: null,
            area: null,
            lat: position.lat(),
            lng: position.lng(),
            formattedAddress: result.formatted_address || undefined,
        };

        if (result.address_components) {
            result.address_components.forEach((component) => {
                const types = component.types;
                if (types.includes("country")) {
                    location.country = component.short_name || component.long_name || "";
                }
                if (types.includes("administrative_area_level_1")) {
                    location.state = component.long_name || null;
                }
                if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                    location.city = component.long_name || "";
                }
                if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                    location.area = component.long_name || null;
                }
            });
        }

        return location;
    };

    const handleClear = () => {
        setSearchQuery("");
        if (marker) {
            marker.setMap(null);
            setMarker(null);
        }
        if (onChange) {
            onChange(null);
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

            <Card className={cn(disabled && "opacity-60 pointer-events-none")}>
                <CardContent className="p-4 space-y-4">
                    {/* Search input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search for a location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9"
                            disabled={disabled || !mapLoaded}
                        />
                        {searchQuery && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={handleClear}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Map container */}
                    <div className="relative">
                        {!mapLoaded && (
                            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center space-y-2">
                                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Loading map...</p>
                                </div>
                            </div>
                        )}
                        <div
                            ref={mapRef}
                            className={cn(
                                "h-64 w-full rounded-lg border",
                                !mapLoaded && "hidden"
                            )}
                        />
                    </div>

                    {/* Selected location info */}
                    {value && (
                        <div className="p-3 bg-muted rounded-lg space-y-1">
                            {value.formattedAddress && (
                                <p className="text-sm font-medium">{value.formattedAddress}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {value.city && <span>{value.city}</span>}
                                {value.state && <span>• {value.state}</span>}
                                {value.country && <span>• {value.country}</span>}
                            </div>
                            {value.lat && value.lng && (
                                <p className="text-xs text-muted-foreground">
                                    Coordinates: {Number(value.lat).toFixed(6)}, {Number(value.lng).toFixed(6)}
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

