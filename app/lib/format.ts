const ones = [
  "zero",
  "jeden",
  "dwa",
  "trzy",
  "cztery",
  "pięć",
  "sześć",
  "siedem",
  "osiem",
  "dziewięć",
  "dziesięć",
  "jedenaście",
  "dwanaście",
  "trzynaście",
  "czternaście",
  "piętnaście",
  "szesnaście",
  "siedemnaście",
  "osiemnaście",
  "dziewiętnaście",
];

const tens = ["", "dziesięć", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];

const hundreds = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];

const groups: [string, string, string][] = [
  ["", "", ""],
  ["tysiąc", "tysiące", "tysięcy"],
  ["milion", "miliony", "milionów"],
  ["miliard", "miliardy", "miliardów"],
];

function groupName(value: number, forms: [string, string, string]) {
  const rest = value % 100;
  if (value === 1) return forms[0];
  if (rest >= 2 && rest <= 4) return forms[1];
  return forms[2];
}

function threeDigitsToWords(value: number): [string, number] {
  const words: string[] = [];
  let number = value;

  const h = Math.floor(number / 100);
  if (h > 0) {
    words.push(hundreds[h]);
    number %= 100;
  }

  if (number < 20) {
    if (number > 0 || value === 0) words.push(ones[number]);
  } else {
    const t = Math.floor(number / 10);
    const o = number % 10;
    words.push(tens[t]);
    if (o > 0) words.push(ones[o]);
  }

  return [words.join(" "), value];
}

export function amountToWords(amount: number): string {
  const total = Math.floor(amount);
  const grosze = Math.round((amount - total) * 100);

  if (total === 0) {
    return `zero złotych ${String(grosze).padStart(2, "0")} gr`;
  }

  let value = total;
  const words: string[] = [];
  let groupIndex = 0;

  while (value > 0 && groupIndex < groups.length) {
    const chunk = value % 1000;
    if (chunk > 0) {
      const [chunkWords] = threeDigitsToWords(chunk);
      const name = groupName(chunk, groups[groupIndex]);
      words.unshift([chunkWords, name].filter(Boolean).join(" "));
    }
    value = Math.floor(value / 1000);
    groupIndex += 1;
  }

  const złotyRest = total % 100;
  let złotyForm = "złotych";
  if (total === 1) złotyForm = "złoty";
  else if (złotyRest >= 2 && złotyRest <= 4) złotyForm = "złote";

  return `${words.join(" ")} ${złotyForm} ${String(grosze).padStart(2, "0")} gr`;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "0,00 zł";
  return amount
    .toLocaleString("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    })
    .replace("PLN", "zł");
}

const monthNames = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDate(date: Date) {
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function monthRangeLabel(monthValue: string): { label: string; range: string } {
  if (!monthValue) return { label: "", range: "" };
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return { label: "", range: "" };

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  return {
    label: `${monthNames[monthIndex]} ${year}`,
    range: `${formatDate(firstDay)} - ${formatDate(lastDay)}`,
  };
}

export function customRangeLabel(from?: string, to?: string): string {
  if (from && to) {
    const start = formatDate(new Date(from));
    const end = formatDate(new Date(to));
    return `${start} - ${end}`;
  }
  return "";
}

export function formatDateTime(date: Date) {
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
