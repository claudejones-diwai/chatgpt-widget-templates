import { Tooltip as ReactTooltip } from 'react-tooltip';

export interface TooltipProps {
  id: string;
  place?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  closeOnClick?: boolean;
}

export function Tooltip({ id, place = 'top', offset = 8, closeOnClick = false }: TooltipProps) {
  return (
    <ReactTooltip
      id={id}
      place={place}
      offset={offset}
      closeEvents={closeOnClick ? { click: true } : undefined}
      className="!bg-gray-900 dark:!bg-gray-700 !text-white dark:!text-gray-100 !text-xs !px-3 !py-2 !rounded-lg !shadow-lg !z-50 !opacity-100 !font-medium"
      classNameArrow="!border-gray-900 dark:!border-gray-700"
      style={{
        backgroundColor: 'rgb(17, 24, 39)',
        color: 'white',
        fontSize: '0.75rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        zIndex: 50,
        opacity: 1,
        fontWeight: 500,
      }}
    />
  );
}
