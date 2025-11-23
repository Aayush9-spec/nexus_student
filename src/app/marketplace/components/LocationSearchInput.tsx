
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import type { LocationDetails, AddressComponent } from '@/lib/types';
import { useDebounce } from 'use-debounce';

interface LocationSearchInputProps {
    onLocationSelect: (location: LocationDetails | null) => void;
    initialValue?: string;
}

export function LocationSearchInput({ onLocationSelect, initialValue = '' }: LocationSearchInputProps) {
    const [inputValue, setInputValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
        autocomplete.setFields(['address_components', 'formatted_address', 'geometry']);
        autocomplete.setComponentRestrictions({ country: 'in' });
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            setIsLoading(true);
            const place = autocompleteRef.current.getPlace();
            
            if (place.geometry && place.formatted_address) {
                const location: LocationDetails = {
                    formatted_address: place.formatted_address,
                    address_components: place.address_components as AddressComponent[],
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setInputValue(place.formatted_address);
                onLocationSelect(location);
            } else {
                 onLocationSelect(null);
            }
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!inputValue) {
            onLocationSelect(null);
        }
    }, [inputValue, onLocationSelect]);
    
    if (!isLoaded) {
        return (
             <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Loading map..." className="pl-8" disabled />
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative">
             <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
            <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
            >
                <Input
                    placeholder="Search by city, college, etc..."
                    className="pl-8"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </Autocomplete>
            {isLoading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    );
}
