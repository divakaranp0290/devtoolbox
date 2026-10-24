
import { Injectable } from '@angular/core';

export type JsonValidationResult =
  | { valid: true; parsed: unknown }
  | { valid: false; error: string };

@Injectable({
  providedIn: 'root',
})
export class JsonFormatterService {
  format(input: string, indent = 2): string {
    return JSON.stringify(this.parse(input), null, indent);
  }

  minify(input: string): string {
    return JSON.stringify(this.parse(input));
  }

  validate(input: string): JsonValidationResult {
    try {
      return { valid: true, parsed: this.parse(input) };
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error
          ? error.message
          : 'Invalid JSON input.',
      };
    }
  }

  private parse(input: string): unknown {
    if (!input.trim()) {
      throw new Error('Enter JSON to continue.');
    }

    return JSON.parse(input);
  }
}
