//@ts-nocheck
// ===============================
// components/location/GoogleMapsLocationPicker.tsx
// Google Maps location picker component (NO MAP, custom suggestions)
// ===============================
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, X, Loader2 } from "lucide-react";
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

  // Optional: restrict suggestions to a country (e.g. "us", "pk")
  countryCode?: string;
};

type Prediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function GoogleMapsLocationPicker({
  value,
  onChange,
  label = "Location",
  helperText,
  className,
  disabled = false,
  required = false,
  countryCode,
}: GoogleMapsLocationPickerProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [mapLoaded, setMapLoaded] = React.useState(false);

  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [predictions, setPredictions] = React.useState<Prediction[]>([]);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [openList, setOpenList] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const autocompleteServiceRef = React.useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = React.useRef<google.maps.places.PlacesService | null>(null);

  const debouncedInput = useDebouncedValue(inputValue, 250);

  // Load Google Maps script (Places library)
  React.useEffect(() => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      setMapLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyC6ZHas_-tmkFhXSdnH3jAoyQa9MMVqkAU";
    if (!apiKey) {
      console.warn("Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      toast.error("Failed to load Google Places. Check your API key / enabled APIs.");
    };
    document.head.appendChild(script);
  }, []);

  // Init services (no map needed)
  React.useEffect(() => {
    if (!mapLoaded) return;
    if (!window.google?.maps?.places) return;

    try {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      }
      if (!placesServiceRef.current) {
        // PlacesService can be created with a dummy div (no map required)
        const dummy = document.createElement("div");
        placesServiceRef.current = new google.maps.places.PlacesService(dummy);
      }
    } catch (e) {
      console.error("Error initializing Places services:", e);
      toast.error("Failed to initialize Places services");
    }
  }, [mapLoaded]);

  // Fetch predictions as user types
  React.useEffect(() => {
    const svc = autocompleteServiceRef.current;
    if (!svc) return;

    const q = (debouncedInput || "").trim();
    if (!q) {
      setPredictions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    const request: google.maps.places.AutocompletionRequest = {
      input: q,
      types: ["geocode", "establishment"],
    };

    if (countryCode) {
      request.componentRestrictions = { country: countryCode };
    }

    svc.getPlacePredictions(request, (res, status) => {
      setIsLoadingSuggestions(false);

      if (status !== google.maps.places.PlacesServiceStatus.OK || !res) {
        setPredictions([]);
        return;
      }

      setPredictions(
        res.map((p) => ({
          description: p.description,
          place_id: p.place_id,
          structured_formatting: p.structured_formatting,
        }))
      );
    });
  }, [debouncedInput, countryCode]);

  // Close suggestions on outside click
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpenList(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const extractLocationData = (place: google.maps.places.PlaceResult): LocationData => {
    const location: LocationData = {
      country: "",
      city: "",
      state: null,
      area: null,
      lat: place.geometry?.location?.lat?.() ?? null,
      lng: place.geometry?.location?.lng?.() ?? null,
      formattedAddress: place.formatted_address || undefined,
    };

    if (place.address_components) {
      place.address_components.forEach((component) => {
        const types = component.types || [];
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

  const handleSelectPrediction = (p: Prediction) => {
    const placesSvc = placesServiceRef.current;
    if (!placesSvc) return;

    setIsSelecting(true);

    placesSvc.getDetails(
      {
        placeId: p.place_id,
        fields: ["address_components", "geometry", "formatted_address"],
      },
      (place, status) => {
        setIsSelecting(false);

        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          toast.error("Could not fetch details for this address");
          return;
        }

        const locationData = extractLocationData(place);

        // Update input UI
        const text = place.formatted_address || p.description;
        setInputValue(text);
        setPredictions([]);
        setOpenList(false);

        onChange?.(locationData);
      }
    );
  };

  const handleClear = () => {
    setInputValue("");
    setPredictions([]);
    setOpenList(false);
    onChange?.(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={cn("space-y-3", className)}>
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
              ref={inputRef}
              type="text"
              placeholder="Search for a location..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setOpenList(true);
              }}
              onFocus={() => setOpenList(true)}
              className="pl-9 pr-20"
              disabled={disabled || !mapLoaded}
              autoComplete="off"
            />

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {(isLoadingSuggestions || isSelecting) && (
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" tabIndex={-1}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              )}
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {openList && !disabled && mapLoaded && inputValue.trim() && predictions.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-lg border bg-background shadow-sm overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  {predictions.map((p) => {
                    const main = p.structured_formatting?.main_text || p.description;
                    const secondary = p.structured_formatting?.secondary_text;

                    return (
                      <button
                        key={p.place_id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted transition flex gap-2"
                        onClick={() => handleSelectPrediction(p)}
                      >
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{main}</div>
                          {secondary ? (
                            <div className="text-xs text-muted-foreground truncate">{secondary}</div>
                          ) : (
                            <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {openList && !disabled && mapLoaded && inputValue.trim() && !isLoadingSuggestions && predictions.length === 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-lg border bg-background shadow-sm px-3 py-2 text-sm text-muted-foreground">
                No results. Try a more specific query.
              </div>
            )}
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
