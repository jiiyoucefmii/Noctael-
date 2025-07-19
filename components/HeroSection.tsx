'use client';

import React from "react";
import Link from "next/link";
import { Component as ShadowOverlay } from "./ui/Shadow";
import Newsletter from "./newsletter";

// Demo component with the specified configuration
const DemoOne = () => { 
  return ( 
    <div className="flex w-full h-screen justify-center items-center"> 
      <ShadowOverlay 
        color="rgba(128, 128, 128, 1)" 
        animation={{ scale: 100, speed: 90 }} 
        noise={{ opacity: 1, scale: 1.2 }} 
        sizing="fill" 
      /> 
    </div> 
  ); 
};

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Shadow effect as background texture */}
      <div className="absolute inset-0 z-0">
        <ShadowOverlay 
          color="rgba(128, 128, 128, 1)" 
          animation={{ scale: 100, speed: 90 }} 
          noise={{ opacity: 1, scale: 1.2 }} 
          sizing="fill"
        />
      </div>
      
      {/* Original hero background with reduced opacity - now on top of shadows */}
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-15 z-10" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />
      
      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center z-30">
        <div className="max-w-4xl mx-auto mb-2"> {/* Reduced mb-4 to mb-2 */}
          {/* Static heading replacing the animated text */}
          <div className="mb-0 mt-12"> {/* Reduced mb-2 to mb-0 */}
            <h1 className="h-24 sm:h-32 md:h-36 text-white font-bold tracking-tight text-6xl sm:text-7xl md:text-8xl"> {/* Reduced height */}
              NOCTAEL
            </h1>
          </div>
          <p className="mb-4 max-w-md mx-auto text-sm sm:text-base md:text-lg text-gray-200"> {/* Reduced mb-6 to mb-4 */}
            Embrace the darkness with our premium clothing collection designed for the night dwellers.
          </p>
        </div>
        <div className="max-w-md w-full">
          <Newsletter />
        </div>
      </div>
    </section>
  );
}