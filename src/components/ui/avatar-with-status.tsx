import { cn } from "@/lib/utils";

interface AvatarWithStatusProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AvatarWithStatus = ({ 
  name, 
  avatar, 
  isOnline = false, 
  size = "md",
  className 
}: AvatarWithStatusProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg"
  };

  const statusSizeClasses = {
    sm: "w-2 h-2 bottom-0 right-0",
    md: "w-3 h-3 bottom-0 right-0",
    lg: "w-4 h-4 bottom-1 right-1"
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div 
        className={cn(
          "rounded-full bg-gradient-warm flex items-center justify-center font-semibold text-white shadow-soft",
          sizeClasses[size]
        )}
      >
        {avatar ? (
          <img 
            src={avatar} 
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      
      {isOnline && (
        <div 
          className={cn(
            "absolute bg-success border-2 border-background rounded-full",
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
};

export default AvatarWithStatus;