import { MockTest } from '../types/mock-test';

interface Filters {
  search?: string;
  category?: string;
  difficulty?: string;
  free?: boolean;
}

export function filterMockTests(
  tests: MockTest[],
  filters: Filters,
) {
  return tests.filter((test) => {

    if (
      filters.search &&
      !test.title
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.category &&
      test.category !== filters.category
    ) {
      return false;
    }

    if (
      filters.difficulty &&
      test.difficulty !== filters.difficulty
    ) {
      return false;
    }

    if (
      filters.free !== undefined &&
      test.free !== filters.free
    ) {
      return false;
    }

    return true;
  });
}
