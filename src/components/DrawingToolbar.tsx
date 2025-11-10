import { Button } from './ui/button';
import { MousePointer2, Square } from 'lucide-react';

interface DrawingToolbarProps {
  isRectangleActive: boolean;
  onToggle: (active: boolean) => void;
}

export function DrawingToolbar({ isRectangleActive, onToggle }: DrawingToolbarProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={!isRectangleActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle(false)}
      >
        <MousePointer2 className="h-4 w-4 mr-2" />
        Selection Mode
      </Button>
      <Button
        variant={isRectangleActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle(true)}
      >
        <Square className="h-4 w-4 mr-2" />
        Rectangle Mode
      </Button>
    </div>
  );
}
