'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Search } from 'lucide-react';
import type { LocationDetails, AddressComponent } from '@/lib/types';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';

interface LocationSearchInputProps {
    onLocationSelect: (location: LocationDetails | null) => void;
    initialValue?: string;
}

interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    address?: any;
}

export function LocationSearchInput({ onLocationSelect, initialValue = '' }: LocationSearchInputProps) {
    const [inputValue, setInputValue] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [debouncedValue] = useDebounce(inputValue, 500);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedValue || debouncedValue.length < 3) {
                setSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                // Using OpenStreetMap Nominatim API
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedValue)}&addressdetails=1&limit=5&countrycodes=in`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching location suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Only fetch if the input value has changed and it's not the initial value or a selected value
        // We can check if the current input matches the selected location to avoid re-fetching
        fetchSuggestions();
    }, [debouncedValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (result: NominatimResult) => {
        setInputValue(result.display_name);
        setShowSuggestions(false);

        // Map Nominatim result to our LocationDetails type
        const location: LocationDetails = {
            formatted_address: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address_components: [] // Nominatim doesn't provide this exact format, but we can adapt if needed
        };

        onLocationSelect(location);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value === '') {
            onLocationSelect(null);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
            <Input
                placeholder="Search city or college (OSM)..."
                className="pl-8"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                }}
            />
            {isSearching && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                    {suggestions.map((result) => (
                        <Button
                            key={result.place_id}
                            variant="ghost"
                            className="w-full justify-start text-left h-auto py-2 px-3 font-normal"
                            onClick={() => handleSelect(result)}
                        >
                            <div className="flex flex-col">
                                <span className="truncate font-medium">{result.display_name.split(',')[0]}</span>
                                <span className="truncate text-xs text-muted-foreground">{result.display_name}</span>
                            </div>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
