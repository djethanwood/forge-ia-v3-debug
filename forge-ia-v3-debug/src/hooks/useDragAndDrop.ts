import { useState, useCallback } from 'react';

export interface DragItem {
  id: string;
  name: string;
  type: string;
  data: any;
}

export interface DropZone {
  id: string;
  accepts: string[];
  onDrop: (item: DragItem) => void;
}

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropZones, setDropZones] = useState<Map<string, DropZone>>(new Map());

  const registerDropZone = useCallback((dropZone: DropZone) => {
    setDropZones(prev => new Map(prev).set(dropZone.id, dropZone));
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    setDropZones(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const startDrag = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const endDrag = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDrop = useCallback((dropZoneId: string) => {
    if (!draggedItem) return false;

    const dropZone = dropZones.get(dropZoneId);
    if (!dropZone) return false;

    if (dropZone.accepts.includes(draggedItem.type)) {
      dropZone.onDrop(draggedItem);
      setDraggedItem(null);
      return true;
    }

    return false;
  }, [draggedItem, dropZones]);

  const canDrop = useCallback((dropZoneId: string): boolean => {
    if (!draggedItem) return false;
    
    const dropZone = dropZones.get(dropZoneId);
    if (!dropZone) return false;

    return dropZone.accepts.includes(draggedItem.type);
  }, [draggedItem, dropZones]);

  return {
    draggedItem,
    registerDropZone,
    unregisterDropZone,
    startDrag,
    endDrag,
    handleDrop,
    canDrop
  };
}