type ProgressBarProps = {
  current: number;
  total: number;
  className?: string;
};

const ProgressBar = ({ current, total, className = '' }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);
  const progressWidth = `${percentage}%`;

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
        className="absolute top-1.5 -translate-y-1/2 transition-all duration-300"
        style={{ left: progressWidth }}
      >
        <img
          src="/characters/character2.png"
          alt="진행 캐릭터"
          className="w-10 h-9 -translate-x-1/2"
        />
      </div>

      {/* Percentage Text */}
      <div
        className="absolute top-[24px] -translate-x-1/2 text-body2-medium text-primary whitespace-nowrap"
        style={{ left: progressWidth }}
      >
        {percentage}%
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
