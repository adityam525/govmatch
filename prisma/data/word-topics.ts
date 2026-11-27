// Where each word-problem family is filed. These are my best guesses: run prisma/list-topics.ts to see
// the real names, and change them here if the importer says "No topic ... in chapter ...".
export const WORD_TOPICS: Record<string, [string, string]> = {
  boat: ['Time, Speed and Distance', 'Boats and streams'],
  trains: ['Time, Speed and Distance', 'Trains'],
  work: ['Time and Work', 'Work and wages'],
  profit: ['Profit and Loss', 'Discount'],
  ages: ['Ages', 'Past and future age'],
  mixture: ['Ratio and Proportion', 'Mixtures and alligation'],
  sici: ['Simple and Compound Interest', 'Compound interest'],
  partner: ['Ratio and Proportion', 'Partnership'],
};
