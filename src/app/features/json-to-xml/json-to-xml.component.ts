import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-to-xml',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-to-xml.component.html',
  styleUrl: './json-to-xml.component.css',
})
export class JsonToXmlComponent {
  jsonInput = '';
  xmlOutput = '';
  errorMessage = '';
  successMessage = '';

  readonly sampleJson = `{
  "name": "CodexaKit",
  "type": "Developer Tools",
  "features": ["JSON Formatter", "CSV Converter"],
  "owner": {
    "name": "Developer",
    "active": true
  }
}`;

  loadSample(): void {
    this.jsonInput = this.sampleJson;
    this.xmlOutput = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearAll(): void {
    this.jsonInput = '';
    this.xmlOutput = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.errorMessage = 'Please select a valid JSON file.';
      this.successMessage = '';
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.jsonInput = String(reader.result ?? '');
      this.xmlOutput = '';
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

  convertToXml(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.xmlOutput = '';

    if (!this.jsonInput.trim()) {
      this.errorMessage = 'Please enter or upload JSON data.';
      return;
    }

    try {
      const data: unknown = JSON.parse(this.jsonInput);

      if (
        data === null ||
        typeof data !== 'object' ||
        Array.isArray(data)
      ) {
        throw new Error('The JSON root must be an object.');
      }

      this.xmlOutput =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        this.convertValue(data, 'root', 0);

      this.successMessage = 'JSON converted to XML successfully.';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to convert JSON to XML.';
    }
  }

  async copyXml(): Promise<void> {
    if (!this.xmlOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.xmlOutput);
      this.successMessage = 'XML copied to clipboard.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'Unable to copy. Please copy the output manually.';
      this.successMessage = '';
    }
  }

  downloadXml(): void {
    if (!this.xmlOutput) {
      return;
    }

    const blob = new Blob([this.xmlOutput], {
      type: 'application/xml;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'converted.xml';
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private convertValue(
    value: unknown,
    tagName: string,
    depth: number
  ): string {
    const indent = '  '.repeat(depth);
    const safeTag = this.sanitizeTagName(tagName);

    if (value === null) {
      return `${indent}<${safeTag}/>`;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${indent}<${safeTag}/>`;
      }

      const children = value
        .map((item) => this.convertValue(item, 'item', depth + 1))
        .join('\n');

      return `${indent}<${safeTag}>\n${children}\n${indent}</${safeTag}>`;
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);

      if (entries.length === 0) {
        return `${indent}<${safeTag}/>`;
      }

      const children = entries
        .map(([key, item]) => this.convertValue(item, key, depth + 1))
        .join('\n');

      return `${indent}<${safeTag}>\n${children}\n${indent}</${safeTag}>`;
    }

    return `${indent}<${safeTag}>${this.escapeXml(String(value))}</${safeTag}>`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private sanitizeTagName(value: string): string {
    let tag = value
      .trim()
      .replace(/[^a-zA-Z0-9_.-]/g, '_');

    if (!tag || !/^[a-zA-Z_]/.test(tag)) {
      tag = `field_${tag}`;
    }

    return tag;
  }
}