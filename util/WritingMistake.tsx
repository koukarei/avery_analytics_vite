export interface GrammarMistake {
  extracted_text: string;
  explanation: string;
  correction: string;
}

function parseGrammarMistakes(input: string): GrammarMistake[] {
  // Remove the outer brackets if present
  let cleaned = input.trim();
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    cleaned = cleaned.slice(1, -1);
  }

  const mistakes: GrammarMistake[] = [];
  
  // Match all GrammarMistake(...) patterns
  const regex = /GrammarMistake\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    const content = match[1];
    const mistake = parseGrammarMistakeContent(content);
    if (mistake) {
      mistakes.push(mistake);
    }
  }

  return mistakes;
}

function parseGrammarMistakeContent(content: string): GrammarMistake | null {
  const result: Partial<GrammarMistake> = {};
  
  // Match key=value pairs, handling both single and double quotes
  const keyValueRegex = /(\w+)=(['""])((?:(?!\2).|\\.)*)\2/g;
  let match;

  while ((match = keyValueRegex.exec(content)) !== null) {
    const key = match[1];
    let value = match[3];
    
    // Unescape any escaped quotes
    value = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
    
    if (key === 'extracted_text' || key === 'explanation' || key === 'correction') {
      result[key] = value;
    }
  }

  // Check if all required fields are present
  if (result.extracted_text && result.explanation && result.correction) {
    return result as GrammarMistake;
  }

  return null;
}

export interface SpellingMistake {
    word: string;
    correction: string;
}

function parseSpellingMistakes(input: string): SpellingMistake[] {
  // Remove the outer brackets if present
  let cleaned = input.trim();
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    cleaned = cleaned.slice(1, -1);
  }

  const mistakes: SpellingMistake[] = [];

  // Match all SpellingMistake(...) patterns
  const regex = /SpellingMistake\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    const content = match[1];
    const mistake = parseSpellingMistakeContent(content);
    if (mistake) {
      mistakes.push(mistake);
    }
  }

  return mistakes;
}

function parseSpellingMistakeContent(content: string): SpellingMistake | null {
  const result: Partial<SpellingMistake> = {};

  // Match key=value pairs, handling both single and double quotes
  const keyValueRegex = /(\w+)=(['""])((?:(?!\2).|\\.)*)\2/g;
  let match;

  while ((match = keyValueRegex.exec(content)) !== null) {
    const key = match[1];
    let value = match[3];
    
    // Unescape any escaped quotes
    value = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
    
    if (key === 'word' || key === 'correction') {
      result[key] = value;
    }
  }

  // Check if all required fields are present
  if (result.word && result.correction) {
    return result as SpellingMistake;
  }

  return null;
}

export {
    parseGrammarMistakes,
    parseSpellingMistakes,
}