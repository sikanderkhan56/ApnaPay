/** Integer paisa arithmetic so wallet math never drifts on floats. */
export function toPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaisa(paisa: number): number {
  return paisa / 100;
}

export function addMoney(a: number, b: number): number {
  return fromPaisa(toPaisa(a) + toPaisa(b));
}

export function subtractMoney(a: number, b: number): number {
  return fromPaisa(toPaisa(a) - toPaisa(b));
}

export function compareMoney(a: number, b: number): number {
  return toPaisa(a) - toPaisa(b);
}
