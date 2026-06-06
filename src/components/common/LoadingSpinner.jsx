const LoadingSpinner = ({ fullScreen = false, size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-gray-200 border-t-brand-azure animate-spin`}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-brand-pearl flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-brand-azure animate-spin" />
          <p className="text-gray-500 font-medium">Loading Med Academy...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
