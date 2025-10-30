// Error State Component
interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
