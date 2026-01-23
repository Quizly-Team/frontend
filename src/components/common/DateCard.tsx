import { Icon } from '@/components';

type DateCardProps = {
  date: string;
  onClick?: () => void;
};

const DateCard = ({ date, onClick }: DateCardProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#ededed] hover:border-primary px-[26px] py-10 rounded-[12px] w-full transition-colors shadow-[4px_4px_12px_0px_rgba(0,0,0,0.04)] max-md:px-4 max-md:py-8"
    >
      <div className="flex gap-1 items-center justify-center">
        <Icon name="calendar" size={28} className="text-error max-md:!w-6 max-md:!h-6" />
        <span className="text-body1-medium text-gray-900 max-md:!text-[16px] max-md:!font-medium max-md:!leading-[1.4]">{date}</span>
      </div>
    </button>
  );
};

DateCard.displayName = 'DateCard';

export default DateCard;
