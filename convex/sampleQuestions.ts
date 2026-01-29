// Sample trivia questions for Survyay!
// Each game randomly selects 10 from this pool

export interface SampleQuestion {
  text: string;
  options: { text: string }[];
  correctOptionIndex: number;
  timeLimit: number;
}

export const QUESTION_BANK: SampleQuestion[] = [
  // === POP CULTURE / ENTERTAINMENT ===
  {
    text: "Which director won an Oscar for 'Oppenheimer'?",
    options: [
      { text: "Steven Spielberg" },
      { text: "Christopher Nolan" },
      { text: "Denis Villeneuve" },
      { text: "Martin Scorsese" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "What is the highest-grossing film of all time (not adjusted for inflation)?",
    options: [
      { text: "Avengers: Endgame" },
      { text: "Avatar" },
      { text: "Titanic" },
      { text: "Star Wars: The Force Awakens" },
    ],
    correctOptionIndex: 1,
    timeLimit: 18,
  },
  {
    text: "Which band released the album 'Abbey Road'?",
    options: [
      { text: "The Rolling Stones" },
      { text: "Led Zeppelin" },
      { text: "The Beatles" },
      { text: "Pink Floyd" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "What TV show features a chemistry teacher turned drug kingpin?",
    options: [
      { text: "The Wire" },
      { text: "Breaking Bad" },
      { text: "Ozark" },
      { text: "Narcos" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "Which actress has won the most Academy Awards?",
    options: [
      { text: "Meryl Streep" },
      { text: "Katharine Hepburn" },
      { text: "Cate Blanchett" },
      { text: "Frances McDormand" },
    ],
    correctOptionIndex: 1,
    timeLimit: 18,
  },
  {
    text: "In what year was the first iPhone released?",
    options: [
      { text: "2005" },
      { text: "2007" },
      { text: "2009" },
      { text: "2011" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "What is the name of the coffee shop in 'Friends'?",
    options: [
      { text: "The Coffee Bean" },
      { text: "Central Perk" },
      { text: "Mocha Joe's" },
      { text: "The Brew House" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "Which artist painted the ceiling of the Sistine Chapel?",
    options: [
      { text: "Leonardo da Vinci" },
      { text: "Raphael" },
      { text: "Michelangelo" },
      { text: "Donatello" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },

  // === SCIENCE / NATURE ===
  {
    text: "What should you do if you encounter a bear in the wild?",
    options: [
      { text: "Run away as fast as possible" },
      { text: "Make yourself look big and back away slowly" },
      { text: "Play dead immediately" },
      { text: "Try to climb the nearest tree" },
    ],
    correctOptionIndex: 1,
    timeLimit: 20,
  },
  {
    text: "What do you call a group of flamingos?",
    options: [
      { text: "A flock" },
      { text: "A colony" },
      { text: "A flamboyance" },
      { text: "A squadron" },
    ],
    correctOptionIndex: 2,
    timeLimit: 18,
  },
  {
    text: "What is the only mammal capable of true flight?",
    options: [
      { text: "Flying squirrel" },
      { text: "Bat" },
      { text: "Flying fish" },
      { text: "Sugar glider" },
    ],
    correctOptionIndex: 1,
    timeLimit: 16,
  },
  {
    text: "Which famous scientist won the Nobel Prize twice?",
    options: [
      { text: "Albert Einstein" },
      { text: "Marie Curie" },
      { text: "Isaac Newton" },
      { text: "Nikola Tesla" },
    ],
    correctOptionIndex: 1,
    timeLimit: 18,
  },
  {
    text: "Which element has the chemical symbol 'Au'?",
    options: [
      { text: "Silver" },
      { text: "Aluminum" },
      { text: "Gold" },
      { text: "Argon" },
    ],
    correctOptionIndex: 2,
    timeLimit: 17,
  },
  {
    text: "What is the largest organ in the human body?",
    options: [
      { text: "Liver" },
      { text: "Brain" },
      { text: "Skin" },
      { text: "Lungs" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },
  {
    text: "How many bones does an adult human have?",
    options: [
      { text: "186" },
      { text: "206" },
      { text: "226" },
      { text: "256" },
    ],
    correctOptionIndex: 1,
    timeLimit: 17,
  },
  {
    text: "What planet is known as the 'Red Planet'?",
    options: [
      { text: "Venus" },
      { text: "Mars" },
      { text: "Jupiter" },
      { text: "Saturn" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "What is the hardest natural substance on Earth?",
    options: [
      { text: "Titanium" },
      { text: "Quartz" },
      { text: "Diamond" },
      { text: "Obsidian" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },
  {
    text: "Which animal has the longest lifespan?",
    options: [
      { text: "Elephant" },
      { text: "Galapagos tortoise" },
      { text: "Greenland shark" },
      { text: "Blue whale" },
    ],
    correctOptionIndex: 2,
    timeLimit: 18,
  },

  // === GEOGRAPHY / WORLD ===
  {
    text: "What is the smallest country in the world by area?",
    options: [
      { text: "Monaco" },
      { text: "Liechtenstein" },
      { text: "Vatican City" },
      { text: "San Marino" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },
  {
    text: "What is the capital of Australia?",
    options: [
      { text: "Sydney" },
      { text: "Melbourne" },
      { text: "Canberra" },
      { text: "Brisbane" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "Which country has the most natural lakes?",
    options: [
      { text: "United States" },
      { text: "Russia" },
      { text: "Canada" },
      { text: "Finland" },
    ],
    correctOptionIndex: 2,
    timeLimit: 18,
  },
  {
    text: "What is the longest river in the world?",
    options: [
      { text: "Amazon" },
      { text: "Nile" },
      { text: "Yangtze" },
      { text: "Mississippi" },
    ],
    correctOptionIndex: 1,
    timeLimit: 16,
  },
  {
    text: "In which country would you find Machu Picchu?",
    options: [
      { text: "Chile" },
      { text: "Bolivia" },
      { text: "Peru" },
      { text: "Ecuador" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "What is the largest desert in the world?",
    options: [
      { text: "Sahara" },
      { text: "Arabian" },
      { text: "Gobi" },
      { text: "Antarctic" },
    ],
    correctOptionIndex: 3,
    timeLimit: 18,
  },
  {
    text: "Which European city is divided by the Bosphorus strait?",
    options: [
      { text: "Athens" },
      { text: "Istanbul" },
      { text: "Venice" },
      { text: "Budapest" },
    ],
    correctOptionIndex: 1,
    timeLimit: 17,
  },

  // === FOOD / COOKING ===
  {
    text: "Which country has the most Michelin-starred restaurants?",
    options: [
      { text: "France" },
      { text: "Italy" },
      { text: "Japan" },
      { text: "Germany" },
    ],
    correctOptionIndex: 0,
    timeLimit: 17,
  },
  {
    text: "What is the main ingredient in traditional hummus?",
    options: [
      { text: "Lentils" },
      { text: "Black beans" },
      { text: "Chickpeas" },
      { text: "White beans" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "Which fruit is known as the 'king of fruits' in Southeast Asia?",
    options: [
      { text: "Mango" },
      { text: "Durian" },
      { text: "Jackfruit" },
      { text: "Papaya" },
    ],
    correctOptionIndex: 1,
    timeLimit: 17,
  },
  {
    text: "What type of pasta is shaped like little ears?",
    options: [
      { text: "Farfalle" },
      { text: "Orecchiette" },
      { text: "Conchiglie" },
      { text: "Rotini" },
    ],
    correctOptionIndex: 1,
    timeLimit: 18,
  },
  {
    text: "Which spice is the most expensive by weight?",
    options: [
      { text: "Vanilla" },
      { text: "Cardamom" },
      { text: "Saffron" },
      { text: "Cinnamon" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },

  // === SPORTS ===
  {
    text: "How many players are on a standard soccer team on the field?",
    options: [
      { text: "9" },
      { text: "10" },
      { text: "11" },
      { text: "12" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "Which country has won the most FIFA World Cup titles?",
    options: [
      { text: "Germany" },
      { text: "Argentina" },
      { text: "Brazil" },
      { text: "Italy" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },
  {
    text: "What is the only sport to have been played on the moon?",
    options: [
      { text: "Frisbee" },
      { text: "Golf" },
      { text: "Baseball" },
      { text: "Tennis" },
    ],
    correctOptionIndex: 1,
    timeLimit: 18,
  },
  {
    text: "In which year were the first modern Olympic Games held?",
    options: [
      { text: "1876" },
      { text: "1896" },
      { text: "1900" },
      { text: "1912" },
    ],
    correctOptionIndex: 1,
    timeLimit: 17,
  },
  {
    text: "How long is an Olympic swimming pool?",
    options: [
      { text: "25 meters" },
      { text: "50 meters" },
      { text: "75 meters" },
      { text: "100 meters" },
    ],
    correctOptionIndex: 1,
    timeLimit: 16,
  },

  // === HISTORY ===
  {
    text: "In what year did World War II end?",
    options: [
      { text: "1943" },
      { text: "1944" },
      { text: "1945" },
      { text: "1946" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "Who was the first person to walk on the moon?",
    options: [
      { text: "Buzz Aldrin" },
      { text: "Neil Armstrong" },
      { text: "John Glenn" },
      { text: "Yuri Gagarin" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "What ancient wonder was located in Alexandria, Egypt?",
    options: [
      { text: "Colossus of Rhodes" },
      { text: "Hanging Gardens" },
      { text: "Lighthouse of Alexandria" },
      { text: "Temple of Artemis" },
    ],
    correctOptionIndex: 2,
    timeLimit: 18,
  },
  {
    text: "Who painted the Mona Lisa?",
    options: [
      { text: "Michelangelo" },
      { text: "Leonardo da Vinci" },
      { text: "Raphael" },
      { text: "Botticelli" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "Which empire was ruled by Genghis Khan?",
    options: [
      { text: "Ottoman Empire" },
      { text: "Roman Empire" },
      { text: "Mongol Empire" },
      { text: "Persian Empire" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },

  // === RANDOM FUN FACTS ===
  {
    text: "What is the fear of long words called?",
    options: [
      { text: "Logophobia" },
      { text: "Hippopotomonstrosesquippedaliophobia" },
      { text: "Sesquipedalophobia" },
      { text: "Verbophobia" },
    ],
    correctOptionIndex: 1,
    timeLimit: 20,
  },
  {
    text: "How many colors are in a rainbow?",
    options: [
      { text: "5" },
      { text: "6" },
      { text: "7" },
      { text: "8" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },
  {
    text: "What is the only letter that doesn't appear in any U.S. state name?",
    options: [
      { text: "Q" },
      { text: "X" },
      { text: "Z" },
      { text: "J" },
    ],
    correctOptionIndex: 0,
    timeLimit: 18,
  },
  {
    text: "What is the dot over the letters 'i' and 'j' called?",
    options: [
      { text: "Diacritic" },
      { text: "Tittle" },
      { text: "Serif" },
      { text: "Apex" },
    ],
    correctOptionIndex: 1,
    timeLimit: 18,
  },
  {
    text: "Which company makes the PlayStation?",
    options: [
      { text: "Microsoft" },
      { text: "Nintendo" },
      { text: "Sony" },
      { text: "Sega" },
    ],
    correctOptionIndex: 2,
    timeLimit: 15,
  },

  // === WOULD YOU RATHER / OPINION ===
  {
    text: "According to surveys, what do most people prefer: cats or dogs?",
    options: [
      { text: "Cats" },
      { text: "Dogs" },
      { text: "Equal preference" },
      { text: "Neither" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "What is the most common favorite color worldwide?",
    options: [
      { text: "Red" },
      { text: "Green" },
      { text: "Blue" },
      { text: "Purple" },
    ],
    correctOptionIndex: 2,
    timeLimit: 16,
  },
  {
    text: "Which day of the week do most people consider their favorite?",
    options: [
      { text: "Friday" },
      { text: "Saturday" },
      { text: "Sunday" },
      { text: "Monday" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
  {
    text: "What is the most popular pizza topping in the United States?",
    options: [
      { text: "Mushrooms" },
      { text: "Pepperoni" },
      { text: "Sausage" },
      { text: "Extra cheese" },
    ],
    correctOptionIndex: 1,
    timeLimit: 15,
  },
];

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Get a random selection of questions from the bank
 * @param count Number of questions to select (default 10)
 */
export function getRandomQuestions(count: number = 10): SampleQuestion[] {
  const shuffled = shuffleArray(QUESTION_BANK);
  return shuffled.slice(0, Math.min(count, QUESTION_BANK.length));
}
