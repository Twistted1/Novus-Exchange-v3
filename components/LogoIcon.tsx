import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LogoIcon: React.FC<LogoIconProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-1',
    md: 'w-6 h-1.5',
    lg: 'w-8 h-2'
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  return (
    <div className={`flex flex-col ${gapClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} bg-red-600 rounded-sm`} />
      <div className={`${sizeClasses[size]} bg-white rounded-sm`} />
      <div className={`${sizeClasses[size]} bg-gray-500 rounded-sm`} />
    </div>
  );
};

export default LogoIcon;
