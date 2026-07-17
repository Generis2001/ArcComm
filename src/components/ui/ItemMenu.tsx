'use client';

import { useState, useRef } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ItemMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

/**
 * Vertical 3-dot menu (⋮) that reveals Edit / Delete on hover or click.
 * Delete requires a second click to confirm before firing.
 */
export function ItemMenu({ onEdit, onDelete, className }: ItemMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    leaveTimer.current = setTimeout(() => {
      setOpen(false);
      setConfirmDelete(false);
    }, 200);
  };

  const handleTriggerClick = () => setOpen((o) => !o);

  const handleEdit = () => {
    setOpen(false);
    setConfirmDelete(false);
    onEdit();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      setOpen(false);
      setConfirmDelete(false);
      onDelete();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      {/* ⋮ trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-label="Item options"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-md text-white/[0.28] transition-colors hover:bg-white/[0.06] hover:text-white/[0.70]"
      >
        <MoreVertical className="h-[15px] w-[15px]" />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          'absolute right-0 top-8 z-50 min-w-[136px] origin-top-right rounded-xl border border-white/[0.09] bg-zinc-950/[0.96] py-1 shadow-2xl backdrop-blur-xl',
          'transition-all duration-150',
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        <button
          type="button"
          onClick={handleEdit}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-white/[0.65] transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5 shrink-0" />
          Edit
        </button>

        <div className="mx-2 my-1 h-px bg-white/[0.06]" />

        <button
          type="button"
          onClick={handleDelete}
          className={cn(
            'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
            confirmDelete
              ? 'text-destructive hover:bg-destructive/[0.10]'
              : 'text-white/[0.65] hover:bg-white/[0.05] hover:text-destructive',
          )}
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" />
          {confirmDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
