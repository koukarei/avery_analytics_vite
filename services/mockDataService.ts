import type { StudentWork, WritingMistake } from '../types/studentWork';
import { MOCK_API_DELAY, MISTAKE_CATEGORY_KEYS, PLACEHOLDER_IMAGE_DIMENSIONS } from '../constants';

const students = [
  { id: 's1', name: 'Alice Wonderland', avatarUrl: `https://picsum.photos/seed/alice/100/100` },
  { id: 's2', name: 'Bob The Builder', avatarUrl: `https://picsum.photos/seed/bob/100/100` },
  { id: 's3', name: 'Charlie Brown', avatarUrl: `https://picsum.photos/seed/charlie/100/100` },
];

const loremShort = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const loremMedium = "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const loremLong = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const studentWorksData: StudentWork[] = students.map((student, index) => ({
  student,
  writings: [
    {
      id: `w${index + 1}-1`,
      title: `My Summer Vacation`,
      content: `This summer, I went to the beach. ${loremMedium} The weather was sunny and I built a sandcastle. It was a lot of fun. ${loremShort}`,
      date: '2024-07-15',
      imageUrl: `https://picsum.photos/seed/${student.id}writing1/${PLACEHOLDER_IMAGE_DIMENSIONS.medium}`,
    },
    {
      id: `w${index + 1}-2`,
      title: `A Story About A Dragon`,
      content: `Once upon a time, in a land far away, there lived a friendly dragon named Sparky. ${loremLong} Sparky loved to fly over the mountains and play with the clouds.`,
      date: '2024-07-22',
      imageUrl: `https://picsum.photos/seed/${student.id}writing2/${PLACEHOLDER_IMAGE_DIMENSIONS.medium}`,
    },
  ],
  chatRecords: [
    {
      id: `c${index + 1}-1`,
      topic: 'Learning about Planets',
      messages: [
        {id: 'cm1', sender: 'student', text: 'Tell me about Mars.', timestamp: '2024-07-10 10:00'},
        {id: 'cm2', sender: 'chatbot', text: 'Mars is the fourth planet from the Sun and is known as the Red Planet.', timestamp: '2024-07-10 10:01'},
        {id: 'cm3', sender: 'student', text: 'Is there life on Mars?', timestamp: '2024-07-10 10:02'},
        {id: 'cm4', sender: 'chatbot', text: 'Currently, there is no confirmed evidence of life on Mars, but scientists are actively searching!', timestamp: '2024-07-10 10:03'},
      ],
      relatedImageUrl: `https://picsum.photos/seed/${student.id}chat1/${PLACEHOLDER_IMAGE_DIMENSIONS.small}`,
    },
    {
      id: `c${index + 1}-2`,
      topic: 'History of Ancient Egypt',
      messages: [
        {id: 'cm5', sender: 'student', text: 'What are pyramids?', timestamp: '2024-07-18 14:30'},
        {id: 'cm6', sender: 'chatbot', text: 'Pyramids are monumental structures with a square or triangular base and sloping sides that meet at a point at the top, especially one built of stone as a royal tomb in ancient Egypt.', timestamp: '2024-07-18 14:31'},
      ],
      relatedImageUrl: `https://picsum.photos/seed/${student.id}chat2/${PLACEHOLDER_IMAGE_DIMENSIONS.small}`,
    },
  ],
}));

// Mistake and description text are not translated in mock data.
const commonWritingMistakes: WritingMistake[] = [
  { id: 'm1', mistake: 'Subject-Verb Agreement Errors', description: 'The verb does not agree in number with its subject.', frequency: 25, categoryKey: MISTAKE_CATEGORY_KEYS.GRAMMAR },
  { id: 'm2', mistake: 'Incorrect Comma Usage', description: 'Missing commas, comma splices, or unnecessary commas.', frequency: 22, categoryKey: MISTAKE_CATEGORY_KEYS.PUNCTUATION },
  { id: 'm3', mistake: 'Spelling Errors', description: 'Commonly misspelled words or typos.', frequency: 20, categoryKey: MISTAKE_CATEGORY_KEYS.SPELLING },
  { id: 'm4', mistake: 'Run-on Sentences', description: 'Two or more independent clauses joined without proper punctuation or conjunction.', frequency: 18, categoryKey: MISTAKE_CATEGORY_KEYS.STYLE },
  { id: 'm5', mistake: 'Pronoun Agreement Errors', description: 'Pronoun does not agree in number or gender with its antecedent.', frequency: 15, categoryKey: MISTAKE_CATEGORY_KEYS.GRAMMAR },
  { id: 'm6', mistake: 'Apostrophe Errors', description: 'Incorrect use of apostrophes for possession or contractions.', frequency: 12, categoryKey: MISTAKE_CATEGORY_KEYS.PUNCTUATION },
  { id: 'm7', mistake: 'Vague Pronoun Reference', description: 'It is unclear which noun a pronoun refers to.', frequency: 10, categoryKey: MISTAKE_CATEGORY_KEYS.STYLE },
  { id: 'm8', mistake: 'Sentence Fragments', description: 'Incomplete sentences treated as complete ones.', frequency: 9, categoryKey: MISTAKE_CATEGORY_KEYS.GRAMMAR },
  { id: 'm9', mistake: 'Misplaced Modifiers', description: 'A descriptive word or phrase is placed incorrectly, modifying the wrong word.', frequency: 7, categoryKey: MISTAKE_CATEGORY_KEYS.STYLE },
  { id: 'm10', mistake: 'Incorrect Word Choice', description: 'Using a word that does not fit the context or has an unintended meaning.', frequency: 5, categoryKey: MISTAKE_CATEGORY_KEYS.VOCABULARY },
].sort((a, b) => b.frequency - a.frequency); // Ensure sorted by frequency

export const fetchStudentWorks = (): Promise<StudentWork[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(studentWorksData);
    }, MOCK_API_DELAY);
  });
};

export const fetchWritingMistakes = (): Promise<WritingMistake[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(commonWritingMistakes);
    }, MOCK_API_DELAY);
  });
};
