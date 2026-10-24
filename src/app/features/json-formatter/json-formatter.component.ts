
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { JsonFormatterService } from '../../core/services/json-formatter.service';

type JsonMode = 'format' | 'explore' | 'compare' | 'convert';
type DiffType = 'same' | 'removed' | 'added' | 'empty';

interface DiffLine {
  text: string;
  type: DiffType;
}

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './json-formatter.component.html',
  styleUrl: './json-formatter.component.css',
})
export class JsonFormatterComponent {
  private readonly formatter = inject(JsonFormatterService);

  input = '';
  output = '';
  error = '';
  status = '';

  indent = 2;
  mode: JsonMode = 'format';

  sortKeys = false;
  searchTerm = '';
  compareInput = '';
  csvDelimiter = ',';

  comparisonReady = false;

  compareLeftLines: DiffLine[] = [];
  compareRightLines: DiffLine[] = [];

  readonly sample = JSON.stringify(
    {
      name: 'CodexaKit',
      version: 1,
      active: true,
      features: ['format', 'minify', 'validate', 'compare'],
      settings: {
        theme: 'light',
        indent: 2,
      },
      author: {
        name: 'Developer',
        role: 'Admin',
      },
    },
    null,
    2,
  );

  get statistics() {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      return null;
    }

    let keys = 0;
    let objects = 0;
    let arrays = 0;
    let maxDepth = 0;

    const visit = (node: unknown, depth: number): void => {
      maxDepth = Math.max(maxDepth, depth);

      if (Array.isArray(node)) {
        arrays++;
        node.forEach((item) => visit(item, depth + 1));
      } else if (node !== null && typeof node === 'object') {
        objects++;

        for (const child of Object.values(
          node as Record<string, unknown>,
        )) {
          keys++;
          visit(child, depth + 1);
        }
      }
    };

    visit(result.parsed, 0);

    return {
      bytes: new Blob([this.input]).size,
      keys,
      objects,
      arrays,
      maxDepth,
      characters: this.input.length,
    };
  }

  get treeJson(): string {
    const result = this.formatter.validate(this.input);

    return result.valid
      ? JSON.stringify(result.parsed, null, this.indent)
      : '';
  }

  get treeLines(): string[] {
    if (!this.treeJson) {
      return [];
    }

    const lines = this.treeJson.split('\n');

    if (!this.searchTerm.trim()) {
      return lines;
    }

    const term = this.searchTerm.toLowerCase();

    return lines.filter((line) =>
      line.toLowerCase().includes(term),
    );
  }

  selectMode(mode: JsonMode): void {
    this.mode = mode;
    this.error = '';
    this.status = '';

    if (mode === 'compare') {
      this.comparisonReady = false;
      this.compareLeftLines = [];
      this.compareRightLines = [];
    }
  }

  onJsonChanged(): void {
  this.error = '';
  this.status = '';

  if (this.mode === 'compare') {
    this.comparisonReady = false;
    this.compareLeftLines = [];
    this.compareRightLines = [];
  }
}

  format(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(this.describeError(result.error, this.input));
      return;
    }

    try {
      const value = this.sortKeys
        ? this.sortObjectKeys(result.parsed)
        : result.parsed;

      this.output = JSON.stringify(value, null, this.indent);
      this.setSuccess('JSON formatted successfully.');
    } catch {
      this.setError('Unable to format this JSON.');
    }
  }

  minify(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(this.describeError(result.error, this.input));
      return;
    }

    const value = this.sortKeys
      ? this.sortObjectKeys(result.parsed)
      : result.parsed;

    this.output = JSON.stringify(value);
    this.setSuccess('JSON minified successfully.');
  }

  validate(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(this.describeError(result.error, this.input));
      return;
    }

    this.output = '';
    this.error = '';
    this.status = 'Valid JSON — no syntax errors found.';
  }

  sortJsonKeys(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(this.describeError(result.error, this.input));
      return;
    }

    this.output = JSON.stringify(
      this.sortObjectKeys(result.parsed),
      null,
      this.indent,
    );

    this.setSuccess('JSON keys sorted alphabetically.');
  }

  flattenJson(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(this.describeError(result.error, this.input));
      return;
    }

    const flattened: Record<string, unknown> = {};

    const visit = (value: unknown, path: string): void => {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        const entries = Object.entries(
          value as Record<string, unknown>,
        );

        if (entries.length === 0 && path) {
          flattened[path] = {};
        }

        for (const [key, child] of entries) {
          visit(child, path ? `${path}.${key}` : key);
        }
      } else {
        flattened[path] = value;
      }
    };

    visit(result.parsed, '');

    this.output = JSON.stringify(flattened, null, this.indent);
    this.setSuccess('JSON flattened successfully.');
  }

  convertToCsv(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(this.describeError(result.error, this.input));
      return;
    }

    if (
      !Array.isArray(result.parsed) ||
      !result.parsed.every(
        (item) =>
          item !== null &&
          typeof item === 'object' &&
          !Array.isArray(item),
      )
    ) {
      this.setError(
        'CSV conversion requires a JSON array containing objects.',
      );
      return;
    }

    const rows = result.parsed as Record<string, unknown>[];

    if (!rows.length) {
      this.setError('The JSON array is empty.');
      return;
    }

    const headers = [
      ...new Set(rows.flatMap((row) => Object.keys(row))),
    ];

    const escapeCell = (value: unknown): string => {
      const text =
        value !== null && typeof value === 'object'
          ? JSON.stringify(value)
          : String(value ?? '');

      if (
        text.includes('"') ||
        text.includes('\n') ||
        text.includes('\r') ||
        text.includes(this.csvDelimiter)
      ) {
        return `"${text.replace(/"/g, '""')}"`;
      }

      return text;
    };

    this.output = [
      headers.map(escapeCell).join(this.csvDelimiter),
      ...rows.map((row) =>
        headers
          .map((header) => escapeCell(row[header]))
          .join(this.csvDelimiter),
      ),
    ].join('\r\n');

    this.setSuccess('CSV created successfully.');
  }

  compareJson(): void {
    const left = this.formatter.validate(this.input);
    const right = this.formatter.validate(this.compareInput);

    this.comparisonReady = false;
    this.compareLeftLines = [];
    this.compareRightLines = [];

    if (!left.valid) {
      this.setError(
        `Original JSON: ${this.describeError(left.error, this.input)}`,
      );
      return;
    }

    if (!right.valid) {
      this.setError(
        `Compared JSON: ${this.describeError(
          right.error,
          this.compareInput,
        )}`,
      );
      return;
    }

    const leftText = JSON.stringify(left.parsed, null, this.indent);
    const rightText = JSON.stringify(right.parsed, null, this.indent);

    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');

    // Avoid an excessively large LCS matrix for large documents.
    const maxCells = 300_000;
    const cells = (leftLines.length + 1) * (rightLines.length + 1);

    if (cells > maxCells) {
      this.compareByLinePosition(leftLines, rightLines);
    } else {
      this.compareUsingLcs(leftLines, rightLines);
    }

    this.comparisonReady = true;
    this.error = '';

    const differences =
      this.compareLeftLines.filter((line) => line.type === 'removed')
        .length +
      this.compareRightLines.filter((line) => line.type === 'added')
        .length;

    this.status =
      differences === 0
        ? 'Both JSON documents are identical.'
        : `Comparison complete. ${differences} changed line entries found.`;
  }

  private compareByLinePosition(
    leftLines: string[],
    rightLines: string[],
  ): void {
    const maxLength = Math.max(leftLines.length, rightLines.length);

    for (let index = 0; index < maxLength; index++) {
      const left = leftLines[index];
      const right = rightLines[index];

      if (left === right) {
        this.compareLeftLines.push({
          text: left ?? '',
          type: 'same',
        });

        this.compareRightLines.push({
          text: right ?? '',
          type: 'same',
        });
      } else {
        this.compareLeftLines.push({
          text: left ?? '',
          type: left === undefined ? 'empty' : 'removed',
        });

        this.compareRightLines.push({
          text: right ?? '',
          type: right === undefined ? 'empty' : 'added',
        });
      }
    }
  }

  private compareUsingLcs(
    leftLines: string[],
    rightLines: string[],
  ): void {
    const rows = leftLines.length + 1;
    const cols = rightLines.length + 1;

    const dp = Array.from(
      { length: rows },
      () => new Uint32Array(cols),
    );

    for (let i = leftLines.length - 1; i >= 0; i--) {
      for (let j = rightLines.length - 1; j >= 0; j--) {
        dp[i][j] =
          leftLines[i] === rightLines[j]
            ? dp[i + 1][j + 1] + 1
            : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    let i = 0;
    let j = 0;

    while (i < leftLines.length || j < rightLines.length) {
      if (
        i < leftLines.length &&
        j < rightLines.length &&
        leftLines[i] === rightLines[j]
      ) {
        this.compareLeftLines.push({
          text: leftLines[i],
          type: 'same',
        });

        this.compareRightLines.push({
          text: rightLines[j],
          type: 'same',
        });

        i++;
        j++;
      } else if (
        i < leftLines.length &&
        (j >= rightLines.length ||
          dp[i + 1][j] >= dp[i][j + 1])
      ) {
        this.compareLeftLines.push({
          text: leftLines[i],
          type: 'removed',
        });

        this.compareRightLines.push({
          text: '',
          type: 'empty',
        });

        i++;
      } else {
        this.compareLeftLines.push({
          text: '',
          type: 'empty',
        });

        this.compareRightLines.push({
          text: rightLines[j],
          type: 'added',
        });

        j++;
      }
    }
  }

 editComparison(): void {
  this.comparisonReady = false;
  this.compareLeftLines = [];
  this.compareRightLines = [];
  this.error = '';
  this.status = '';
}

  swapInputOutput(): void {
  if (this.mode === 'compare') {
    if (!this.compareInput.trim() || !this.input.trim()) {
      this.setError('Both JSON documents are required to swap.');
      return;
    }

    const previousInput = this.input;

    this.input = this.compareInput;
    this.compareInput = previousInput;

    this.error = '';
    this.status = '';

    this.compareJson();
    return;
  }

  if (!this.output) {
    this.setError('There is no output to swap.');
    return;
  }

  const previousInput = this.input;
  this.input = this.output;
  this.output = previousInput;

  this.error = '';
  this.status = 'Input and output swapped successfully.';
}

  loadSample(): void {
    this.input = this.sample;
    this.output = '';
    this.error = '';
    this.status = 'Sample JSON loaded.';
    this.comparisonReady = false;
    this.compareLeftLines = [];
    this.compareRightLines = [];
  }

  async uploadJson(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const result = this.formatter.validate(content);

      if (!result.valid) {
        this.setError(
          `Invalid JSON file: ${this.describeError(result.error, content)}`,
        );
        return;
      }

      this.input = content;
      this.output = '';
      this.error = '';
      this.status = `Loaded ${file.name} successfully.`;
      this.comparisonReady = false;
      this.compareLeftLines = [];
      this.compareRightLines = [];
    } catch {
      this.setError('Unable to read the selected file.');
    } finally {
      target.value = '';
    }
  }

  clear(): void {
    this.input = '';
    this.output = '';
    this.error = '';
    this.status = '';
    this.searchTerm = '';
    this.compareInput = '';
    this.comparisonReady = false;
    this.compareLeftLines = [];
    this.compareRightLines = [];
  }

  async copyOutput(): Promise<void> {
    if (!this.output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.output);
      this.error = '';
      this.status = 'Copied to clipboard.';
    } catch {
      this.setError(
        'Clipboard access failed. Select and copy the output manually.',
      );
    }
  }

  downloadOutput(): void {
    if (!this.output) {
      return;
    }

    if (this.mode === 'convert') {
      this.downloadBlob(
        new Blob([this.output], {
          type: 'text/csv;charset=utf-8',
        }),
        'converted.csv',
      );
      return;
    }

    this.downloadBlob(
      new Blob([this.output], {
        type: 'application/json;charset=utf-8',
      }),
      'formatted.json',
    );
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private sortObjectKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortObjectKeys(item));
    }

    if (value !== null && typeof value === 'object') {
      const sorted: Record<string, unknown> = {};

      for (const key of Object.keys(
        value as Record<string, unknown>,
      ).sort((a, b) => a.localeCompare(b))) {
        sorted[key] = this.sortObjectKeys(
          (value as Record<string, unknown>)[key],
        );
      }

      return sorted;
    }

    return value;
  }

  private describeError(
    message: string,
    source: string = this.input,
  ): string {
    const match = message.match(/position\s+(\d+)/i);

    if (!match) {
      return message;
    }

    const position = Number(match[1]);
    const beforeError = source.slice(0, position);
    const line = beforeError.split('\n').length;
    const lastNewline = beforeError.lastIndexOf('\n');
    const column = position - lastNewline;

    return `${message} (line ${line}, column ${column})`;
  }

  private setError(message: string): void {
    this.error = message;
    this.status = '';
    this.output = '';
  }

  private setSuccess(message: string): void {
    this.error = '';
    this.status = message;
  }
}
