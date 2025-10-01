
/**
 * Dictionary API Response Type Definitions
 */

interface License {
  name: string;
  url: string;
}

interface Phonetic {
  text: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
}

type DictionaryResponse = DictionaryEntry[];

export type {
  License,
  Phonetic,
  Definition,
  Meaning,
  DictionaryEntry,
  DictionaryResponse
};