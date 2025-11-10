import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { type BackgroundVariant } from '@xyflow/react';

interface CanvasSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    showDots: boolean;
    backgroundColor: string;
    dotColor: string;
  };
  onUpdateSettings: (settings: {
    showDots: boolean;
    backgroundColor: string;
    dotColor: string;
  }) => void;
}

export function CanvasSettings({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
}: CanvasSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Canvas Settings</DialogTitle>
          <DialogDescription>
            Customize the appearance of your canvas background
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Show Dots Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="show-dots" className="flex flex-col gap-1">
              <span>Show Dots</span>
              <span className="text-xs text-muted-foreground font-normal">
                Display dot pattern on canvas
              </span>
            </Label>
            <Switch
              id="show-dots"
              checked={localSettings.showDots}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, showDots: checked })
              }
            />
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="bg-color"
                type="color"
                value={localSettings.backgroundColor}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    backgroundColor: e.target.value,
                  })
                }
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={localSettings.backgroundColor}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    backgroundColor: e.target.value,
                  })
                }
                className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Dot Color */}
          {localSettings.showDots && (
            <div className="space-y-2">
              <Label htmlFor="dot-color">Dot Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="dot-color"
                  type="color"
                  value={localSettings.dotColor}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      dotColor: e.target.value,
                    })
                  }
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={localSettings.dotColor}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      dotColor: e.target.value,
                    })
                  }
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                  placeholder="#cccccc"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
