"use client";

interface SpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = "default", 
  color = "primary",
  className = ""
}) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    default: "w-8 h-8 border-4", 
    lg: "w-16 h-16 border-4"
  };
  
  const colors = {
    primary: "border-gray-200 border-t-[#3E8E7E]",
    white: "border-white/20 border-t-white"
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`.trim()}>
      <div 
        className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;