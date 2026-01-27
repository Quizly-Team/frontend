import { useState, useEffect } from 'react';

type ProgressBarProps = {
  current: number;
  total: number;
  className?: string;
  isCompleted?: boolean;
};

const ProgressBar = ({ current, total, className = '', isCompleted = false }: ProgressBarProps) => {
  const percentage = isCompleted ? 100 : Math.round((current / total) * 100);
  const progressWidth = `${percentage}%`;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Background */}
      <div className="w-full h-4 bg-gray-200 rounded-[16px]" />

      {/* Progress */}
      <div
        className="absolute top-0 left-0 h-4 bg-primary rounded-[16px] transition-all duration-300"
        style={{ width: progressWidth }}
      />

      {/* Character Icon */}
      <div
        className={`absolute top-1.5 -translate-y-1/2 transition-all duration-300 ${
          percentage === 100 ? '' : percentage === 0 ? '' : '-translate-x-1/2'
        }`}
        style={percentage === 100 ? { right: '0px' } : { left: progressWidth }}
      >
        <img
          src="/characters/character2.png"
          alt="진행 캐릭터"
          className="w-[26px] h-[24px]"
        />
      </div>

      {/* Percentage Text */}
      <div
        className={`absolute top-[24px] text-primary whitespace-nowrap transition-all duration-300 ${
          percentage === 100 ? '' : percentage === 0 ? '' : '-translate-x-1/2'
        }`}
        style={{
          ...(percentage === 100 ? { right: '0px' } : { left: progressWidth }),
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {percentage}%
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
