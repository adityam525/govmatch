import { mockTests } from '../data/mock-tests';

export async function getMockTest(
  slug: string,
) {
  return Promise.resolve(
    mockTests.find(
      (item) => item.slug === slug,
    ),
  );
}
