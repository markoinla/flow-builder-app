import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface NodeEditDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: { label: string }) => void;
}

export function NodeEditDialog({
  open,
  node,
  onClose,
  onUpdateNode,
}: NodeEditDialogProps) {
  const [label, setLabel] = useState('');

  // Update form data when node changes
  useEffect(() => {
    if (node && open) {
      setLabel(node.data?.label || '');
    }
  }, [node, open]);

  const handleSave = () => {
    if (node) {
      onUpdateNode(node.id, { label });
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Node Properties</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter node label"
              autoFocus
            />
          </div>
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
