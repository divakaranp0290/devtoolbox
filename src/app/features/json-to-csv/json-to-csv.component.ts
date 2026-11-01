import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-json-to-csv',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './json-to-csv.component.html',
    styleUrl: './json-to-csv.component.css',
})
export class JsonToCsvComponent {
    jsonInput = '';

    csvOutput = '';
    errorMessage = '';
    copied = false;

    convertToCsv(): void {
        this.errorMessage = '';
        this.csvOutput = '';
        this.copied = false;

        try {
            const parsed: unknown = JSON.parse(this.jsonInput);

            if (!Array.isArray(parsed) || parsed.length === 0) {
                this.errorMessage = 'Please enter a non-empty JSON array of objects.';
                return;
            }

            if (
                !parsed.every(
                    (item) =>
                        item !== null &&
                        typeof item === 'object' &&
                        !Array.isArray(item)
                )
            ) {
                this.errorMessage = 'Every item in the JSON array must be an object.';
                return;
            }

            const rows = parsed as Record<string, unknown>[];
            const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];

            if (headers.length === 0) {
                this.errorMessage = 'No fields found in the JSON objects.';
                return;
            }

            const csvRows = [
                headers.map((header) => this.escapeCsvValue(header)).join(','),
                ...rows.map((row) =>
                    headers
                        .map((header) => this.escapeCsvValue(row[header]))
                        .join(',')
                ),
            ];

            this.csvOutput = csvRows.join('\n');
        } catch {
            this.errorMessage = 'Invalid JSON. Please check your input.';
        }
    }

    private escapeCsvValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        let text: string;

        if (typeof value === 'object') {
            text = JSON.stringify(value);
        } else {
            text = String(value);
        }

        if (/[",\r\n]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    }

    loadSample(): void {
        this.jsonInput = `[
  {
    "name": "John",
    "age": 30,
    "city": "New York"
  },
  {
    "name": "Jane",
    "age": 25,
    "city": "London"
  },
  {
    "name": "Alex",
    "age": 28,
    "city": "Paris"
  }
]`;

        this.convertToCsv();
    }

    clearAll(): void {
        this.jsonInput = '';
        this.csvOutput = '';
        this.errorMessage = '';
        this.copied = false;
    }

    async copyCsv(): Promise<void> {
        if (!this.csvOutput) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.csvOutput);
            this.copied = true;
            setTimeout(() => (this.copied = false), 2000);
        } catch {
            this.errorMessage = 'Unable to copy. Please copy the CSV manually.';
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith('.json')) {
            this.errorMessage = 'Please select a valid JSON file.';
            input.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            this.jsonInput = String(reader.result ?? '');
            this.errorMessage = '';
            this.csvOutput = '';
        };

        reader.onerror = () => {
            this.errorMessage = 'Unable to read the selected file.';
        };

        reader.readAsText(file);
        input.value = '';
    }

    downloadCsv(): void {
        if (!this.csvOutput) {
            return;
        }

        const blob = new Blob([this.csvOutput], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'converted-data.csv';
        link.click();
        URL.revokeObjectURL(url);
    }
}