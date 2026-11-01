import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-csv-to-json',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './csv-to-json.component.html',
  styleUrl: './csv-to-json.component.css',
})
export class CsvToJsonComponent {
  csvInput = '';
  jsonOutput = '';
  errorMessage = '';
  successMessage = '';

  readonly sampleCsv = `name,age,city
John,28,New York
Sarah,32,London
Michael,25,Chennai`;

  loadSample(): void {
    this.csvInput = this.sampleCsv;
    this.jsonOutput = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearAll(): void {
    this.csvInput = '';
    this.jsonOutput = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const isCsvFile =
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/csv';

    if (!isCsvFile) {
      this.errorMessage = 'Please select a valid CSV file.';
      this.successMessage = '';
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.csvInput = String(reader.result ?? '');
      this.jsonOutput = '';
      this.errorMessage = '';
      this.successMessage = '';
    };

    reader.onerror = () => {
      this.errorMessage = 'Unable to read the selected file.';
      this.successMessage = '';
    };

    reader.readAsText(file);
    input.value = '';
  }

  convertToJson(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.jsonOutput = '';

    if (!this.csvInput.trim()) {
      this.errorMessage = 'Please enter or upload CSV data.';
      return;
    }

    try {
      const rows = this.parseCsv(this.csvInput);

      if (rows.length < 2) {
        throw new Error(
          'CSV must contain a header row and at least one data row.'
        );
      }

      const headers = rows[0].map((header) => header.trim());

      if (headers.some((header) => !header)) {
        throw new Error('CSV headers cannot be empty.');
      }

      if (new Set(headers).size !== headers.length) {
        throw new Error('CSV contains duplicate column headers.');
      }

      const dataRows = rows.slice(1);

      const jsonData = dataRows.map((row, rowIndex) => {
        if (row.length !== headers.length) {
          throw new Error(
            `Row ${rowIndex + 2} has ${row.length} columns; expected ${headers.length}.`
          );
        }

        const record: Record<string, string> = {};

        headers.forEach((header, index) => {
          record[header] = row[index];
        });

        return record;
      });

      this.jsonOutput = JSON.stringify(jsonData, null, 2);
      this.successMessage = 'CSV converted to JSON successfully.';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to convert CSV to JSON.';
    }
  }

  async copyJson(): Promise<void> {
    if (!this.jsonOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.jsonOutput);
      this.successMessage = 'JSON copied to clipboard.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'Unable to copy. Please copy the output manually.';
      this.successMessage = '';
    }
  }

  downloadJson(): void {
    if (!this.jsonOutput) {
      return;
    }

    const blob = new Blob([this.jsonOutput], {
      type: 'application/json;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'converted.json';
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private parseCsv(csv: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let insideQuotes = false;

    const input = csv.replace(/^\uFEFF/, '');

    for (let i = 0; i < input.length; i++) {
      const character = input[i];
      const nextCharacter = input[i + 1];

      if (character === '"') {
        if (insideQuotes && nextCharacter === '"') {
          field += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (character === ',' && !insideQuotes) {
        row.push(field);
        field = '';
      } else if (
        (character === '\n' || character === '\r') &&
        !insideQuotes
      ) {
        if (character === '\r' && nextCharacter === '\n') {
          i++;
        }

        row.push(field);
        rows.push(row);

        row = [];
        field = '';
      } else {
        field += character;
      }
    }

    if (insideQuotes) {
      throw new Error('CSV contains an unclosed quoted field.');
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    // Ignore trailing blank rows.
    while (
      rows.length > 0 &&
      rows[rows.length - 1].every((value) => value.trim() === '')
    ) {
      rows.pop();
    }

    return rows;
  }
}