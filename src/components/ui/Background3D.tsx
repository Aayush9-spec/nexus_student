"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function Background3D() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
            {/* Gradient Overlay for better blending */}
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />

            {/* Shape 1 - Top Right */}
            <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] opacity-60 animate-float-slow mix-blend-screen dark:mix-blend-screen">
                <Image
                    src="/images/3d/shape-1.png"
                    alt="Abstract 3D Shape"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Shape 2 - Bottom Left */}
            <div className="absolute -bottom-[10%] -left-[10%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] opacity-40 animate-float-slower mix-blend-screen dark:mix-blend-screen">
                <Image
                    src="/images/3d/shape-2.png"
                    alt="Abstract 3D Shape"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Additional ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-50" />
        </div>
    );
}
