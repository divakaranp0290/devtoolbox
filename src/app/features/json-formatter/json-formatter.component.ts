
import { Component, inject } from '@angular/core';
import { JsonFormatterService } from '../../core/services/json-formatter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [FormsModule],
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

  readonly sample = JSON.stringify({
    name: 'DevToolBox',
    version: 1,
    features: ['format', 'minify', 'validate'],
    settings: { theme: 'light', indent: 2 },
  }, null, 2);

  format(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(result.error);
      return;
    }

    try {
      this.output = this.formatter.format(this.input, this.indent);
      this.setSuccess('JSON formatted successfully.');
    } catch {
      this.setError('Unable to format this JSON.');
    }
  }

  minify(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(result.error);
      return;
    }

    this.output = this.formatter.minify(this.input);
    this.setSuccess('JSON minified successfully.');
  }

  validate(): void {
    const result = this.formatter.validate(this.input);

    if (!result.valid) {
      this.setError(result.error);
      return;
    }

    this.output = '';
    this.error = '';
    this.status = 'Valid JSON — no syntax errors found.';
  }


  loadSample(): void {
    this.input = this.sample;
    this.output = '';
    this.error = '';
    this.status = 'Sample JSON loaded. Click Format JSON to format it.';
  }


  async uploadJson(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      const content = await file.text();
      const result = this.formatter.validate(content);

      if (!result.valid) {
        this.setError(`Invalid JSON file: ${result.error}`);
        return;
      }

      this.input = content;
      this.output = '';
      this.error = '';
      this.status = `Loaded ${file.name} successfully.`;
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
  }

  async copyOutput(): Promise<void> {
    if (!this.output) return;

    try {
      await navigator.clipboard.writeText(this.output);
      this.status = 'Copied to clipboard.';
    } catch {
      this.setError('Clipboard access failed. Select and copy the output manually.');
    }
  }

  downloadOutput(): void {
    if (!this.output) return;

    const blob = new Blob([this.output], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'formatted.json';
    anchor.click();

    URL.revokeObjectURL(url);
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
