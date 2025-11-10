import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RichTextEditor } from './RichTextEditor';

export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';

interface ContentEditDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: { content?: string; textSize?: TextSize }) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function ContentEditDialog({
  open,
  node,
  onClose,
  onUpdateNode,
  onDeleteNode,
}: ContentEditDialogProps) {
  const [content, setContent] = useState('');
  const [textSize, setTextSize] = useState<TextSize>('medium');

  // Update form data when node changes
  useEffect(() => {
    if (node && open) {
      setContent(node.data?.content || '');
      setTextSize(node.data?.textSize || 'medium');
    }
  }, [node, open]);

  const handleSave = () => {
    if (node) {
      onUpdateNode(node.id, { content, textSize });
    }
    onClose();
  };

  const handleDelete = () => {
    if (node) {
      onDeleteNode(node.id);
    }
    onClose();
  };

  const handleClear = () => {
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="textSize">Text Size</Label>
            <Select
              value={textSize}
              onValueChange={(value) => setTextSize(value as TextSize)}
            >
              <SelectTrigger id="textSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Content
              <span className="text-muted-foreground text-sm ml-2">
                (displayed in the node)
              </span>
            </Label>
            <div className="text-xs text-muted-foreground mb-2">
              Tip: Edit node appearance (colors, borders, etc.) by clicking the edit button on the node type in the left sidebar.
            </div>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Enter content to display in the node..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Node
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={handleClear} disabled={!content}>
            Clear Content
          </Button>
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
