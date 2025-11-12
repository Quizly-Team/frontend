import { Icon } from '@/components';

type DateCardProps = {
  date: string;
  onClick?: () => void;
};

const DateCard = ({ date, onClick }: DateCardProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-300 hover:border-primary px-l py-10 rounded-[12px] w-full transition-colors"
    >
      <div className="flex flex-col gap-3 items-center">
        <div className="flex gap-1 items-center">
          <Icon name="calendar" size={28} className="text-error" />
          <span className="text-body1-medium text-gray-900">{date}</span>
        </div>
      </div>
    </button>
  );
};

DateCard.displayName = 'DateCard';

export default DateCard;
