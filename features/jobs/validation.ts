export function validateNotificationDates(form: {
  notificationDate?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
}): string | null {
  const today = new Date().toISOString().slice(0, 10);

  if (form.notificationDate && form.notificationDate > today) {
    return 'Notification date cannot be in the future.';
  }

  if (
    form.applicationStartDate &&
    form.applicationEndDate &&
    form.applicationStartDate > form.applicationEndDate
  ) {
    return 'Application start date must be before the application end date.';
  }

  return null;
}

export function validatePostAgeRange(minAge?: string | number, maxAge?: string | number): string | null {
  const min = minAge !== undefined && minAge !== '' ? Number(minAge) : null;
  const max = maxAge !== undefined && maxAge !== '' ? Number(maxAge) : null;

  if (min !== null && max !== null && min > max) {
    return 'Minimum age cannot be greater than maximum age.';
  }

  return null;
}
