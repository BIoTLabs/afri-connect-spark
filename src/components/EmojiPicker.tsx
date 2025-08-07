import { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({
  onEmojiSelect,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-muted-foreground hover:text-foreground hover:bg-accent/20 ${className}`}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-warm" 
        side="top"
        align="end"
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width={300}
          height={400}
          previewConfig={{
            showPreview: false
          }}
          searchPlaceHolder="Search emojis..."
          lazyLoadEmojis={true}
        />
      </PopoverContent>
    </Popover>
  );
};