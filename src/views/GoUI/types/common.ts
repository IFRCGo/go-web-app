export interface LabelValue {
  value: number;
  label: string;
}

export interface NumericKeyValuePair {
  key: number;
  value: string;
}

export interface StringKeyValuePair {
  key: string;
  value: string;
}

export interface NumericValueOption {
  value: number;
  label: string;
  description?: string;
}

export interface BooleanValueOption {
  value: boolean;
  label: string;
  description?: string;
}

export interface StringValueOption {
  value: string;
  label: string;
  description?: string;
}

export type SetValueArg<T> = T | ((value: T) => T);
