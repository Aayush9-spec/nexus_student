"use client";

import { LoadScript } from "@react-google-maps/api";
import React from "react";

const libraries: "places"[] = ["places"];

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
    // Prevent rendering LoadScript on the server
    if (typeof window === "undefined") {
        return <>{children}</>;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("Google Maps API key is missing. Maps will not load.");
        return <>{children}</>;
    }

    return (
        <LoadScript
            googleMapsApiKey={apiKey}
            libraries={libraries}
        >
            {children}
        </LoadScript>
    );
}