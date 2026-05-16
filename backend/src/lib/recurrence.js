function calculateNextDate(currentDate, type) {
  const next = new Date(currentDate);

  switch (type) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }

  return next;
}

function generateRecurrenceDates(startDate, type, endDate, maxOccurrences = 52) {
  const dates = [];
  let current = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  const maxDate = new Date(startDate);
  maxDate.setFullYear(maxDate.getFullYear() + 2);

  const effectiveEnd = end ? (end < maxDate ? end : maxDate) : maxDate;

  while (dates.length < maxOccurrences) {
    const nextDate = calculateNextDate(current, type);
    if (!nextDate || nextDate > effectiveEnd) break;

    dates.push(new Date(nextDate));
    current = nextDate;
  }

  return dates;
}

function generateOccurrences(eventData, recurrenceType, recurrenceEndDate) {
  const occurrences = [];
  const baseDate = new Date(eventData.date);

  const recurrenceDates = generateRecurrenceDates(
    baseDate,
    recurrenceType,
    recurrenceEndDate
  );

  recurrenceDates.forEach((date) => {
    occurrences.push({
      ...eventData,
      date: date.toISOString(),
      isRecurrence: true,
      parentEventId: eventData.id,
    });
  });

  return occurrences;
}

module.exports = {
  calculateNextDate,
  generateRecurrenceDates,
  generateOccurrences,
};