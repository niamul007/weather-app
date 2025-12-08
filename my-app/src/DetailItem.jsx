import React from 'react';

/**
 * Reusable component for displaying a single weather detail metric.
 * It uses the 'iconColor' prop to apply a unique color to the icon and the hover accent border.
 * * @param {string} label - The descriptive text (e.g., "Humidity").
 * @param {string} value - The actual measurement (e.g., "75%").
 * @param {ReactNode} icon - The Lucide icon component.
 * @param {string} iconColor - Tailwind class for the icon color (e.g., "text-blue-400").
 */
const DetailItem = ({ label, value, icon, iconColor }) => (
    // Outer container: Vertical layout inside the grid cell.
    // Dynamic styling is applied via the className template literal.
    <div className={`
        flex flex-col p-3 bg-white/10 rounded-xl shadow-md transition duration-200 min-h-[50px]
        
        /* Glassmorphism Hover Background */
        hover:bg-white/15 
        
        /* Base Border: Invisible 4px left border */
        border-l-4 border-transparent 
        
        /* Dynamic Hover Border Accent */
        ${iconColor ? `hover:border-opacity-100 ${iconColor.replace('text-', 'border-')}` : ''}
    `}>
        
        {/* Top Row: Icon and Label */}
        <div className="flex items-center mb-1">
            {/* 🛑 ICON COLOR APPLIED HERE DYNAMICALLY 🛑 
               The icon component passed from the parent should NOT have a color class applied. */}
            <span className={`mr-2 ${iconColor}`}>
                {icon}
            </span>
            
            {/* Label */}
            <span className="font-medium text-sm text-gray-200 uppercase tracking-wider">
                {label}
            </span>
        </div>
        
        {/* Bottom Row: Value */}
        <span className="font-bold text-xl text-white ml-2">
            {value}
        </span>
        
    </div>
);

export default DetailItem;