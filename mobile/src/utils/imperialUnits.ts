/** 1 kg → lb */
export function kgToLb(kg: number): number {
  return kg * 2.2046226218;
}

/** 1 lb → kg */
export function lbToKg(lb: number): number {
  return lb / 2.2046226218;
}

/** Total inches from feet + inches parts. */
export function feetInchesToTotalInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

/** Convert cm to feet and whole inches (rounded). */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalIn = cm / 2.54;
  const feet = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - feet * 12);
  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }
  return { feet, inches };
}

/** Total inches → cm */
export function totalInchesToCm(totalInches: number): number {
  return (totalInches * 2.54);
}

// Imperial units FTW