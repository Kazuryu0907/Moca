export class ErrorClass {
  error_message: any;
  constructor(error_message: any) {
    this.error_message = error_message;
  }
}

export type ErrorHandleType<T> = [T, undefined] | [undefined, ErrorClass];

export function return_error(err_message: string): [undefined, ErrorClass] {
  const err = new ErrorClass(err_message);
  return [undefined, err];
}
export async function handle_error_async<T>(func: Promise<T>): Promise<ErrorClass | T> {
  try {
    const res = await func;
    return res;
  } catch (e) {
    const error: ErrorClass = { error_message: e };
    return error;
  }
}

export function handle_error<T>(func: () => T): ErrorClass | T {
  try {
    const res = func();
    return res;
  } catch (e) {
    const error: ErrorClass = { error_message: e };
    return error;
  }
}

export async function handle_error_async2<T>(func: Promise<T>): Promise<ErrorHandleType<T>> {
  try {
    const res = await func;
    return [res, undefined];
  } catch (e) {
    const error: ErrorClass = { error_message: e };
    return [undefined, error];
  }
}
export function handle_error2<T>(func: () => T): ErrorHandleType<T> {
  try {
    const res = func();
    return [res, undefined];
  } catch (e) {
    const error: ErrorClass = { error_message: e };
    return [undefined, error];
  }
}
