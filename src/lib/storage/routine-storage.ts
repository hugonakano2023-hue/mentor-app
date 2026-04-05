/**
 * Routine Blocks Storage
 */
import {
  type StoredEntity,
  getCollection,
  create,
  update,
  remove,
  STORAGE_KEYS,
} from './index';

export type StoredRoutineBlock = StoredEntity & {
  userId: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  daysOfWeek: number[]; // 0-6
  color: string;
  icon: string;
  subItems: { id: string; label: string; checked: boolean }[];
};

const KEY = STORAGE_KEYS.ROUTINE_BLOCKS;

export function getRoutineBlocks(): StoredRoutineBlock[] {
  return getCollection<StoredRoutineBlock>(KEY);
}

export function getBlocksForDay(dayOfWeek: number): StoredRoutineBlock[] {
  return getRoutineBlocks().filter((b) => b.daysOfWeek.includes(dayOfWeek));
}

export function createBlock(
  data: Omit<StoredRoutineBlock, 'id' | 'createdAt'>
): StoredRoutineBlock {
  return create<StoredRoutineBlock>(KEY, data);
}

export function updateBlock(
  id: string,
  data: Partial<StoredRoutineBlock>
): StoredRoutineBlock | null {
  return update<StoredRoutineBlock>(KEY, id, data);
}

export function deleteBlock(id: string): boolean {
  return remove<StoredRoutineBlock>(KEY, id);
}

export function updateSubItemCheck(
  blockId: string,
  subItemId: string,
  checked: boolean
): StoredRoutineBlock | null {
  const block = getRoutineBlocks().find((b) => b.id === blockId);
  if (!block) return null;

  const updatedSubItems = block.subItems.map((item) =>
    item.id === subItemId ? { ...item, checked } : item
  );

  return updateBlock(blockId, { subItems: updatedSubItems });
}
