import React from 'react';

const SynergyGauge = ({ score = 0 }) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    const angle = (clampedScore / 100) * 180; // 0 to 180 degrees for semicircle
    
    const getScoreColor = (s) => {
        if (s < 35) return '#ef4444'; // red
        if (s < 70) return '#f59e0b'; // amber
        return '#22c55e'; // green
    };

    const getScoreLabel = (s) => {
        if (s < 35) return 'Needs Guidance';
        if (s < 70) return 'Making Progress';
        return 'High Synergy';
    };

    const color = getScoreColor(clampedScore);
    const label = getScoreLabel(clampedScore);

    // Convert degrees to radians and calculate path
    const radius = 35;
    const centerX = 50;
    const centerY = 45;
    
    const startAngle = Math.PI; // 180 degrees (left side)
    const endAngle = startAngle + (angle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > 90 ? 1 : 0;
    
    const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    const backgroundPath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;
    
    // Needle position
    const needleAngle = startAngle + (angle * Math.PI) / 180;
    const needleX = centerX + (radius - 5) * Math.cos(needleAngle);
    const needleY = centerY + (radius - 5) * Math.sin(needleAngle);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
            <div className="relative w-full max-w-[200px] aspect-[2/1]">
                <svg 
                    viewBox="0 0 100 50" 
                    className="w-full h-full overflow-visible"
                    style={{ maxHeight: '100px' }}
                >
                    {/* Background Arc */}
                    <path 
                        d={backgroundPath}
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                    />
                    
                    {/* Score Arc */}
                    {angle > 0 && (
                        <path 
                            d={arcPath}
                            fill="none" 
                            stroke={color} 
                            strokeWidth="6" 
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    )}
                    
                    {/* Needle */}
                    <g>
                        <line 
                            x1={centerX} 
                            y1={centerY} 
                            x2={needleX} 
                            y2={needleY}
                            stroke="#374151" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                        />
                        <circle 
                            cx={centerX} 
                            cy={centerY} 
                            r="3" 
                            fill="#374151"
                        />
                    </g>
                    
                    {/* Scale markers */}
                    {[0, 25, 50, 75, 100].map((value) => {
                        const markerAngle = Math.PI + (value / 100) * Math.PI;
                        const innerRadius = radius - 8;
                        const outerRadius = radius - 3;
                        const x1 = centerX + innerRadius * Math.cos(markerAngle);
                        const y1 = centerY + innerRadius * Math.sin(markerAngle);
                        const x2 = centerX + outerRadius * Math.cos(markerAngle);
                        const y2 = centerY + outerRadius * Math.sin(markerAngle);
                        
                        return (
                            <line 
                                key={value}
                                x1={x1} 
                                y1={y1} 
                                x2={x2} 
                                y2={y2}
                                stroke="#9ca3af" 
                                strokeWidth="1"
                            />
                        );
                    })}
                </svg>
                
                {/* Score Display */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color }}>
                        {Math.round(clampedScore)}
                    </div>
                    <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                    </div>
                </div>
            </div>
            
            {/* Score breakdown for context */}
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>0-34</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>35-69</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>70-100</span>
                </div>
            </div>
        </div>
    );
};

export default SynergyGauge;