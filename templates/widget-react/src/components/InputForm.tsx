// Input Form Component
// Example form for collecting user input

import { useState, FormEvent } from "react";
import { validateToolInput } from "../utils/validation";
import { HelloWorldToolInput } from "../../../shared-types";

interface InputFormProps {
  onSubmit: (data: HelloWorldToolInput) => void;
  isLoading?: boolean;
}

export function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [name, setName] = useState("");
  const [formal, setFormal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const data = { name, formal };
    const validation = validateToolInput(data);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
          placeholder="Enter your name"
          aria-label="Name"
          autoComplete="name"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="formal"
          checked={formal}
          onChange={(e) => setFormal(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Use formal greeting"
        />
        <label
          htmlFor="formal"
          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Use formal greeting
        </label>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full min-h-[44px] px-6 py-3 bg-blue-600 hover:bg-blue-700
                 dark:bg-blue-500 dark:hover:bg-blue-600
                 text-white font-medium rounded-lg
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isLoading ? "Processing..." : "Submit"}
      </button>
    </form>
  );
}
