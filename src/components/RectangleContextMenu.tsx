import { useCallback, useEffect, useRef } from 'react';
import { Edit, Copy, Trash2 } from 'lucide-react';

interface RectangleContextMenuProps {
  id: string;
  top: number;
  left: number;
  onEdit?: (rectangleId: string) => void;
  onDuplicate?: (rectangleId: string) => void;
  onDelete?: (rectangleId: string) => void;
  onClose: () => void;
}

export function RectangleContextMenu({
  id,
  top,
  left,
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: RectangleContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleEdit = useCallback(() => {
    onEdit?.(id);
    onClose();
  }, [id, onEdit, onClose]);

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(id);
    onClose();
  }, [id, onDuplicate, onClose]);

  const handleDelete = useCallback(() => {
    onDelete?.(id);
    onClose();
  }, [id, onDelete, onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 1000,
      }}
      className="min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
    >
      {onEdit && (
        <button
          onClick={handleEdit}
          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Properties
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={handleDuplicate}
          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </button>
      )}
      {(onEdit || onDuplicate) && onDelete && (
        <div className="my-1 h-px bg-border" />
      )}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-accent hover:text-destructive focus:bg-accent focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </button>
      )}
    </div>
  );
}
