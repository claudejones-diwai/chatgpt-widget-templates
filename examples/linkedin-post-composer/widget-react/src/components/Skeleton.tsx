export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | false;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'wave',
  className = ''
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationClass = animation === 'wave'
    ? 'animate-skeleton-wave'
    : animation === 'pulse'
    ? 'animate-skeleton-pulse'
    : '';

  const defaultHeight = variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '100%';
  const defaultWidth = variant === 'circular' ? '40px' : '100%';

  const style = {
    width: width ?? defaultWidth,
    height: height ?? defaultHeight
  };

  return (
    <div
      className={`bg-surface-tertiary ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
    />
  );
}
