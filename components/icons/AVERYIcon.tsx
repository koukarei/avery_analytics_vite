
import React from 'react';

interface IconProps {
  className?: string;
}

const IconComponent: React.FC<IconProps> = ({ className }) => (
    <div className={className || "w-6 h-6"}>
      <img src="avery_analytics/favicon.ico" alt="Avery Analytics Icon" className="w-16 h-16" />
    </div>
);

export default IconComponent;