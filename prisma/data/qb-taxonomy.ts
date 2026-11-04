export interface QbChapter { name: string; topics: string[] }
export interface QbSubject { name: string; chapters: QbChapter[] }

export const QB_SUBJECTS: QbSubject[] = [
  { name: 'Quantitative Aptitude', chapters: [
    { name: 'Number System', topics: ['Types of numbers', 'Divisibility rules', 'HCF and LCM', 'Remainders', 'Unit digit', 'Factors and multiples', 'Surds and indices'] },
    { name: 'Simplification and Approximation', topics: ['BODMAS', 'Fractions and decimals', 'Approximation', 'Square and cube roots'] },
    { name: 'Percentage', topics: ['Basic percentage', 'Population and depreciation', 'Successive change', 'Election and result problems'] },
    { name: 'Ratio and Proportion', topics: ['Ratio', 'Proportion', 'Partnership', 'Mixtures and alligation'] },
    { name: 'Average', topics: ['Simple average', 'Weighted average', 'Average of ages', 'Change in average'] },
    { name: 'Profit and Loss', topics: ['Profit and loss percent', 'Discount and marked price', 'Dishonest dealing', 'Successive discounts'] },
    { name: 'Simple and Compound Interest', topics: ['Simple interest', 'Compound interest', 'Difference between SI and CI', 'Instalments'] },
    { name: 'Time and Work', topics: ['Work and efficiency', 'Pipes and cisterns', 'Work and wages', 'Alternate days'] },
    { name: 'Time, Speed and Distance', topics: ['Basic speed', 'Relative speed', 'Trains', 'Boats and streams', 'Races', 'Average speed'] },
    { name: 'Mensuration', topics: ['Triangle', 'Quadrilaterals', 'Circle', 'Cuboid and cube', 'Cylinder, cone and sphere'] },
    { name: 'Algebra', topics: ['Linear equations', 'Quadratic equations', 'Identities', 'Inequalities'] },
    { name: 'Geometry', topics: ['Lines and angles', 'Triangles', 'Circles', 'Polygons'] },
    { name: 'Trigonometry', topics: ['Ratios and identities', 'Heights and distances'] },
    { name: 'Data Interpretation', topics: ['Tables', 'Bar graphs', 'Line graphs', 'Pie charts', 'Caselets'] },
    { name: 'Number Series', topics: ['Missing number', 'Wrong number', 'Pattern series'] },
    { name: 'Ages', topics: ['Present age', 'Past and future age'] },
    { name: 'Permutation, Combination and Probability', topics: ['Counting', 'Permutation', 'Combination', 'Probability'] },
    { name: 'Statistics', topics: ['Mean, median and mode', 'Range and deviation'] },
  ] },
  { name: 'Reasoning', chapters: [
    { name: 'Verbal Reasoning', topics: ['Analogy', 'Classification', 'Alphabet series', 'Coding-decoding', 'Letter and number arrangement'] },
    { name: 'Relations and Direction', topics: ['Blood relations', 'Direction sense', 'Ranking and order'] },
    { name: 'Arrangements and Puzzles', topics: ['Linear seating', 'Circular seating', 'Floor and box puzzles', 'Scheduling'] },
    { name: 'Logical Reasoning', topics: ['Syllogism', 'Statement and conclusion', 'Statement and assumption', 'Cause and effect', 'Venn diagrams'] },
    { name: 'Mathematical Reasoning', topics: ['Mathematical operations', 'Inequalities', 'Number series', 'Input and output', 'Data sufficiency'] },
    { name: 'Calendar and Clock', topics: ['Calendar', 'Clock'] },
    { name: 'Non-verbal Reasoning', topics: ['Mirror and water images', 'Paper folding and cutting', 'Embedded figures', 'Figure series', 'Counting figures'] },
  ] },
  { name: 'English Language', chapters: [
    { name: 'Grammar', topics: ['Error spotting', 'Sentence improvement', 'Fill in the blanks', 'Tenses', 'Subject-verb agreement', 'Articles and prepositions'] },
    { name: 'Vocabulary', topics: ['Synonyms', 'Antonyms', 'Idioms and phrases', 'One-word substitution', 'Spelling', 'Homonyms'] },
    { name: 'Sentence Structure', topics: ['Active and passive voice', 'Direct and indirect speech', 'Sentence rearrangement', 'Para jumbles'] },
    { name: 'Comprehension', topics: ['Reading comprehension', 'Cloze test'] },
  ] },
  { name: 'General Awareness', chapters: [
    { name: 'History', topics: ['Ancient India', 'Medieval India', 'Modern India', 'Freedom struggle'] },
    { name: 'Geography', topics: ['India', 'World', 'Physical geography', 'Climate and soil'] },
    { name: 'Polity', topics: ['Constitution', 'Parliament', 'Fundamental rights and duties', 'Judiciary'] },
    { name: 'Economy', topics: ['Basic concepts', 'Budget and taxation', 'Banking', 'Planning and schemes'] },
    { name: 'General Science', topics: ['Physics', 'Chemistry', 'Biology', 'Everyday science'] },
    { name: 'Static GK', topics: ['Books and authors', 'Awards', 'Important days', 'Sports', 'Capitals and currencies'] },
    { name: 'Current Affairs', topics: ['National', 'International', 'Science and technology', 'Appointments', 'Schemes'] },
  ] },
  { name: 'Computer Knowledge', chapters: [
    { name: 'Fundamentals', topics: ['Hardware', 'Software', 'Number systems', 'Memory and storage'] },
    { name: 'Office Tools', topics: ['MS Word', 'MS Excel', 'MS PowerPoint', 'Keyboard shortcuts'] },
    { name: 'Internet and Security', topics: ['Networking', 'Email', 'Cyber security', 'Operating systems'] },
  ] },
];
