/**
 * Escaped einen einzelnen CSV-Zellenwert gemaess RFC 4180: Anführungszeichen
 * werden verdoppelt und der Wert in Anführungszeichen gesetzt.
 *
 * Zusaetzlich wird CSV-/Formula-Injection neutralisiert: Beginnt der Wert mit
 * einem Formel-Trigger (=, +, -, @, Tabulator oder Wagenrücklauf), wird ein
 * einfaches Hochkomma vorangestellt. Dadurch fuehrt z. B. Excel/LibreOffice den
 * Inhalt beim Oeffnen nicht als Formel aus (OWASP CSV Injection).
 */
export function escapeCsvCell(value: string): string {
  const neutralized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${neutralized.replace(/"/g, '""')}"`;
}
