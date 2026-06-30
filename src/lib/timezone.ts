/**
 * Service de gestion des fuseaux horaires
 */

/**
 * Convertir une date d'un fuseau horaire à un autre
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  const dateStr = date.toLocaleString('en-US', { timeZone: fromTimezone })
  const convertedDate = new Date(dateStr)
  const result = new Date(convertedDate.toLocaleString('en-US', { timeZone: toTimezone }))
  return result
}

/**
 * Formater une date selon le fuseau horaire local
 */
export function formatDateInTimezone(date: Date, timezone: string, locale: string = 'fr-FR'): string {
  return date.toLocaleDateString(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formater une date et heure selon le fuseau horaire local
 */
export function formatDateTimeInTimezone(date: Date, timezone: string, locale: string = 'fr-FR'): string {
  return date.toLocaleString(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Obtenir le fuseau horaire actuel de l'utilisateur
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Obtenir la liste des fuseaux horaires courants
 */
export function getCommonTimezones(): string[] {
  return [
    'Europe/Paris',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
  ]
}
