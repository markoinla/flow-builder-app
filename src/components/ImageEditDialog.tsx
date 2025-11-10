import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { FileUpload } from './ui/file-upload';

interface ImageEditDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: {
    imageUrl?: string;
    imageSize?: number;
    opacity?: number;
  }) => void;
}

export function ImageEditDialog({
  open,
  node,
  onClose,
  onUpdateNode,
}: ImageEditDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState(100);
  const [opacity, setOpacity] = useState(100);

  // Update form data when node changes
  useEffect(() => {
    if (node && open) {
      setImageUrl(node.data?.imageUrl || '');
      setImageSize(node.data?.imageSize || 100);
      setOpacity(node.data?.opacity || 100);
    }
  }, [node, open]);

  const handleSave = () => {
    if (node) {
      onUpdateNode(node.id, {
        imageUrl,
        imageSize,
        opacity,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <FileUpload
              onUpload={(url) => setImageUrl(url)}
              accept="image/*"
              maxSize={10}
            />
          </div>

          {/* Image Size */}
          <div className="space-y-2">
            <Label htmlFor="imageSize">
              Image Size: {imageSize}%
            </Label>
            <Slider
              id="imageSize"
              min={10}
              max={100}
              step={5}
              value={[imageSize]}
              onValueChange={(value) => setImageSize(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Size of the image relative to the node container
            </p>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <Label htmlFor="opacity">
              Opacity: {opacity}%
            </Label>
            <Slider
              id="opacity"
              min={0}
              max={100}
              step={5}
              value={[opacity]}
              onValueChange={(value) => setOpacity(value[0])}
            />
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <Label className="mb-2 block">Preview</Label>
              <div className="flex items-center justify-center h-48 bg-background rounded">
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    maxWidth: `${imageSize}%`,
                    maxHeight: '100%',
                    opacity: opacity / 100,
                  }}
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
