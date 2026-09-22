/**
 * Character registry.
 *
 * The single place that knows which characters exist. Adding the second model
 * is a two-line change here plus its own config file - no engine code moves.
 */
import type { CharacterConfig } from './types';
import { evelynConfig } from './characters/evelyn';

export const CHARACTERS: Record<string, CharacterConfig> = {
  [evelynConfig.id]: evelynConfig,
};

export const DEFAULT_CHARACTER_ID = evelynConfig.id;

export function getCharacterConfig(id: string = DEFAULT_CHARACTER_ID): CharacterConfig {
  return CHARACTERS[id] ?? CHARACTERS[DEFAULT_CHARACTER_ID];
}

export function listCharacters(): Array<{ id: string; displayName: string }> {
  return Object.values(CHARACTERS).map((c) => ({ id: c.id, displayName: c.displayName }));
}
