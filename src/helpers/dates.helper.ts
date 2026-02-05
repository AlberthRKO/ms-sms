import { DateTime } from 'luxon';

/**
 * function for reset hour, min, second to 00;00.00 of date
 * @param date string date from javascript
 * @returns
 */
export const resetDate = (inputDate: string, utcZone = 'America/La_Paz'): string => {
  const outputDate = DateTime.fromISO(inputDate, { zone: 'utc' })
    .setZone(utcZone) // establecer la zona horaria deseada
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) // establecer la hora cero
    .toISO(); // formatear la fecha y hora en formato ISO
  // Output: 2023-02-16T00:00:00.000Z
  return outputDate;
};

// format from dd/MM/yyyy/ to YYY-MM-dd
export const formattedDate = (inputDate: string) => {
  const outputDate = DateTime.fromFormat(inputDate, 'dd/MM/yyyy').setZone('America/La_Paz').toISO();
  return outputDate;
};

/**
 * helper for format data str to format 01/01/1997
 * @param dateStr type year-month-day, example 2021-05-01
 * @returns `${day}/${month}/${year}`, example 01/05/2021
 */
export const formatOnlyDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = DateTime.fromISO(dateStr);
  const humanReadable = date.setLocale('es-Bo').toLocaleString(DateTime.DATE_SHORT);
  return humanReadable;
};

export const formatOnlyTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = DateTime.fromISO(dateStr);
  const humanReadable = date.setLocale('es-Bo').toLocaleString(DateTime.TIME_24_WITH_SECONDS);
  return humanReadable;
};
