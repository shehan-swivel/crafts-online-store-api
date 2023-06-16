export const subtractDays = (date: Date, numOfDays: number): Date => {
  return new Date(date.getTime() - numOfDays * 24 * 60 * 60 * 1000);
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
