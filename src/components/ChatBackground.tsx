import { ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface ChatBackgroundProps {
  children: ReactNode;
  variant?: 'default' | 'pattern' | 'gradient';
}

export const ChatBackground: React.FC<ChatBackgroundProps> = ({ 
  children, 
  variant = 'pattern' 
}) => {
  const { theme } = useTheme();

  const getBackgroundClass = () => {
    switch (variant) {
      case 'pattern':
        return `chat-bg-pattern ${theme === 'dark' ? 'dark' : ''}`;
      case 'gradient':
        return 'bg-gradient-to-br from-background via-muted/20 to-accent/10';
      default:
        return 'bg-background';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      {children}
    </div>
  );
};