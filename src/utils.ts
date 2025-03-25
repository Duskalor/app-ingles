import type { Phrases } from './types';

const getNumber = (cuantity: number) => Math.floor(Math.random() * cuantity);

export const wait = (time: number) =>
  new Promise((res) => setTimeout(res, time));

export const getPhrase = (arr: any[]): Phrases => {
  const cuantity = arr.length;
  const randomNumber1 = getNumber(cuantity);
  const allPhrases = arr[randomNumber1];
  const qtyPhrases = arr[randomNumber1].length;
  const randomNumber2 = getNumber(qtyPhrases);
  return allPhrases[randomNumber2];
};
