// Issue bergulir: satu issue terbuka per label yang diperbarui tiap pemeriksaan
// dan ditutup begitu semuanya beres.

export type IssueAction =
  | { kind: 'create' }
  | { kind: 'edit'; number: number }
  | { kind: 'close'; number: number }
  | { kind: 'none' };

/** Menentukan langkah dari issue terbuka (bila ada) dan ada tidaknya temuan. */
export function planIssueAction(open: { number: number } | undefined, findings: boolean): IssueAction {
  if (findings) return open === undefined ? { kind: 'create' } : { kind: 'edit', number: open.number };
  return open === undefined ? { kind: 'none' } : { kind: 'close', number: open.number };
}
