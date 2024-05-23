import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid'

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export async function wait(time){
  return new Promise (resolve => setTimeout (resolve, time));

}