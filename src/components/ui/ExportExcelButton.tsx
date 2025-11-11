interface ExportExcelButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ 
  onClick, 
  loading = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="cursor-pointer bg-black text-white px-6 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <div className="flex items-center space-x-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <span>{loading ? 'Exporting...' : 'Export Excel'}</span>
      </div>
    </button>
  );
};

export default ExportExcelButton;
