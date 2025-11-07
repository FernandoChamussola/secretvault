export const Input = ({
  label,
  type = 'text',
  error,
  icon,
  rightElement,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`
            block w-full rounded-lg border shadow-sm
            ${icon ? 'pl-10' : 'pl-3'}
            ${rightElement ? 'pr-10' : 'pr-3'}
            py-2
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${error
              ? 'border-red-300 text-red-900 placeholder-red-300'
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
            }
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
