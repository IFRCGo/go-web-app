import {
  isValidEmail,
  isInteger,
  isValidUrl as isValidRemoteUrl,
  typeOf,
} from '@togglecorp/fujs';

import {
  LeafError,
  ArrayError,
  getErrorObject,
  getErrorString,
} from '@togglecorp/toggle-form';

const localhostRegex = /(?<=\/\/)localhost(?=[:/]|$)/;

export const isFloat = (value: unknown) => (typeOf(value) === 'number');

export function isLocalUrl(url: string) {
  return localhostRegex.test(url);
}

export function isValidUrl(url: string | undefined): url is string {
  if (!url) {
    return false;
  }
  const sanitizedUrl = url.replace(localhostRegex, 'localhost.com');
  return isValidRemoteUrl(sanitizedUrl);
}

type Maybe<T> = T | undefined | null;

function isDefined<T>(value: Maybe<T>): value is T {
  return value !== undefined && value !== null;
}

function isDefinedString(value: Maybe<string>): value is string {
  return isDefined(value) && value.trim() !== '';
}

export function requiredCondition(value: unknown) {
  return !isDefined(value)
    ? 'The field is required'
    : undefined;
}

export function requiredListCondition<T>(value: Maybe<T[]>) {
  return !isDefined(value) || value.length === 0
    ? 'The field is required'
    : undefined;
}

export function requiredStringCondition(value: Maybe<string>) {
  return !isDefinedString(value)
    ? 'The field is required'
    : undefined;
}

export function blacklistCondition<T>(x: T[]) {
  return (value: Maybe<T>) => (
    isDefined(value) && x.includes(value)
      ? `The field cannot be ${value}`
      : undefined
  );
}

export function whitelistCondition<T>(x: T[]) {
  return (value: Maybe<T>) => (
    isDefined(value) && !x.includes(value)
      ? `The field cannot be ${value}`
      : undefined
  );
}

export function lengthGreaterThanCondition(x: number) {
  return (value: Maybe<string | unknown[]>) => (
    isDefined(value) && value.length <= x
      ? `Length must be greater than ${x}`
      : undefined
  );
}
export function lengthSmallerThanCondition(x: number) {
  // NOTE: isDefinedString is not really required here
  return (value: Maybe<string | unknown[]>) => (
    isDefined(value) && value.length >= x
      ? `Length must be smaller than ${x}`
      : undefined
  );
}

export function greaterThanCondition(x: number) {
  return (value: Maybe<number>) => (
    isDefined(value) && value <= x
      ? `Field must be greater than ${x}`
      : undefined
  );
}
export function smallerThanCondition(x: number) {
  return (value: Maybe<number>) => (
    isDefined(value) && value >= x
      ? `The field must be smaller than ${x}`
      : undefined
  );
}

export function greaterThanOrEqualToCondition(x: number) {
  return (value: Maybe<number>) => (
    isDefined(value) && value < x
      ? `The field must be greater than or equal to ${x}`
      : undefined
  );
}

export function lessThanOrEqualToCondition(x: number) {
  return (value: Maybe<number>) => (
    isDefined(value) && value > x
      ? `The field must be smaller than or equal to ${x}`
      : undefined
  );
}

export function integerCondition(value: Maybe<number>) {
  return isDefined(value) && !isInteger(value)
    ? 'The field must be a number without decimal'
    : undefined;
}

export function positiveNumberCondition(value: Maybe<number>) {
  return isDefined(value) && (!isFloat(value) || value < 0)
    ? 'The field must be a positive number'
    : undefined;
}

export function positiveIntegerCondition(value: Maybe<number>) {
  return isDefined(value) && (!isInteger(value) || value < 0)
    ? 'The field must be a positive number without decimal'
    : undefined;
}

export function emailCondition(value: Maybe<string>) {
  return isDefinedString(value) && !isValidEmail(value)
    ? 'The field must be a valid email'
    : undefined;
}

export function urlCondition(value: Maybe<string>) {
  return isDefinedString(value) && !isValidUrl(value)
    ? 'The field must be a valid url'
    : undefined;
}

export function listErrorToString<T>(error: LeafError | ArrayError<T>) {
  let errorString = getErrorString(error);
  const errorObject = getErrorObject(error);

  if (errorObject) {
    const keys = Object.keys(errorObject);
    errorString = keys.map((k) => `${k} - ${errorObject[k]}`).join(', ');
  }

  return errorString;
}
