export function generateNumber(length: number): number {
  let num = Math.floor(Math.random() * Math.pow(10, length));
  return String(num).length >= length
    ? Number(String(num).slice(0, length))
    : Number(String(num) + "0");
}
