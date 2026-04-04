import { useCallback, useState } from "react";
import {
  getLockState,
  getStringState,
  setLockState,
  setStringState,
} from "../utils/lockState";

export function useLockState(
  key: string,
  defaultValue: boolean,
): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState<boolean>(() =>
    getLockState(key, defaultValue),
  );

  const set = useCallback(
    (v: boolean) => {
      setLockState(key, v);
      setValue(v);
    },
    [key],
  );

  return [value, set];
}

export function useStringLockState(
  key: string,
  defaultValue: string,
): [string, (v: string) => void] {
  const [value, setValue] = useState<string>(() =>
    getStringState(key, defaultValue),
  );

  const set = useCallback(
    (v: string) => {
      setStringState(key, v);
      setValue(v);
    },
    [key],
  );

  return [value, set];
}
