import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHijri(input : string) {
  const dateParts = input.split('-');	
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  const hijriMonths :  { [key: number]: string }= {
    1 : "Muharram",
    2 : "Safar",
    3 : "Rabiul Awwal",
    4 : "Rabiul Akhir",
    5 : "Jamadil Awwal",
    6 : "Jamadil Akhir",
    7 : "Rejab",
    8 : "Syaaban",
    9 : "Ramadhan",
    10 : "Syawwal",
    11 : "Zulkaedah",
    12 : "Zulhijjah"
  }
  const output = day + " " + hijriMonths[month] + " " + year + "H"
  return output;
}

export function cap1st(str: string) {
  if (!str) return "";
  
  // First convert to lowercase
  let result = str.toLowerCase();
  
  // Use a regular expression to match the first letter of each word
  // This will match:
  // 1. The very first character of the string
  // 2. Any character that follows a space
  // 3. Any character that follows a comma and a space
  result = result.replace(
    /(^|\s|,\s*)([a-z])/g, 
    (match, p1, p2) => p1 + p2.toUpperCase()
  );
  
  return result;
}