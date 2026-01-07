import type { PlayerRegistryEntryInput } from "./playerRegistryTypes";
import {
  buildEntryFromFileName,
  isPlayerRegistryEntry,
  isPlayerRegistryEntryArray,
  isVocabEntryArray,
} from "./playerRegistryHelpers";

interface ValidateImportedVocabInput {
  fileName: string;
  raw: string;
}

interface ValidateImportedVocabResult {
  entries: PlayerRegistryEntryInput[];
  error: string | null;
}

const INVALID_EXTENSION_ERROR = "you can only load JSON file.";
const INVALID_JSON_ERROR = "cannot load it as json file.";
const INVALID_FORMAT_ERROR =
  "Use an array of items with \"phrase\" and \"mean\", or a JSON with \"key\", \"label\", and \"vocab\".";

// インポートされたJSONが使える形かどうかを判定する
export const validateImportedVocab = ({
  fileName,
  raw,
}: ValidateImportedVocabInput): ValidateImportedVocabResult => {
  if (!fileName.toLowerCase().endsWith(".json")) {
    return { entries: [], error: INVALID_EXTENSION_ERROR };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { entries: [], error: INVALID_JSON_ERROR };
  }

  const entries: PlayerRegistryEntryInput[] = isPlayerRegistryEntry(parsed)
    ? [parsed]
    : isPlayerRegistryEntryArray(parsed)
      ? parsed
      : isVocabEntryArray(parsed)
        ? [buildEntryFromFileName(fileName, parsed)]
        : [];

  if (entries.length === 0) {
    return { entries, error: INVALID_FORMAT_ERROR };
  }

  return { entries, error: null };
};
