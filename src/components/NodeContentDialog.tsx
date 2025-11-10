import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RichTextEditor } from './RichTextEditor';

interface NodeContentDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: { content?: string }) => void;
}

export function NodeContentDialog({
  open,
  node,
  onClose,
  onUpdateNode,
}: NodeContentDialogProps) {
  const [content, setContent] = useState('');

  // Update form data when node changes
  useEffect(() => {
    if (node && open) {
      setContent(node.data?.content || '');
    }
  }, [node, open]);

  const handleSave = () => {
    if (node) {
      onUpdateNode(node.id, { content });
    }
    onClose();
  };

  const handleClear = () => {
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Node Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Content
              <span className="text-muted-foreground text-sm ml-2">
                (appears when hovering over the node)
              </span>
            </Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Enter content to display on hover..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear} disabled={!content}>
            Clear
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
