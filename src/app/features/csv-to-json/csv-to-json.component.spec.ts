import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsvToJsonComponent } from './csv-to-json.component';

describe('CsvToJsonComponent', () => {
  let component: CsvToJsonComponent;
  let fixture: ComponentFixture<CsvToJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvToJsonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CsvToJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have blank input initially', () => {
    expect(component.csvInput).toBe('');
    expect(component.jsonOutput).toBe('');
  });

  it('should load sample CSV when requested', () => {
    component.loadSample();

    expect(component.csvInput).toContain('name,age,city');
    expect(component.csvInput).toContain('John,28,New York');
  });

  it('should convert CSV rows to JSON', () => {
    component.csvInput = 'name,age\nJohn,28\nSarah,32';

    component.convertToJson();

    expect(JSON.parse(component.jsonOutput)).toEqual([
      { name: 'John', age: '28' },
      { name: 'Sarah', age: '32' },
    ]);
    expect(component.errorMessage).toBe('');
  });

  it('should support commas inside quoted CSV values', () => {
    component.csvInput = 'name,city\nJohn,"New York, NY"';

    component.convertToJson();

    expect(JSON.parse(component.jsonOutput)).toEqual([
      { name: 'John', city: 'New York, NY' },
    ]);
  });

  it('should support escaped quotes in CSV values', () => {
    component.csvInput = 'quote\n"He said ""Hello"""';

    component.convertToJson();

    expect(JSON.parse(component.jsonOutput)).toEqual([
      { quote: 'He said "Hello"' },
    ]);
  });

  it('should show an error when CSV input is empty', () => {
    component.csvInput = '';

    component.convertToJson();

    expect(component.errorMessage).toBe('Please enter or upload CSV data.');
    expect(component.jsonOutput).toBe('');
  });

  it('should show an error when a row has the wrong number of columns', () => {
    component.csvInput = 'name,age\nJohn,28,extra';

    component.convertToJson();

    expect(component.errorMessage).toContain('expected 2');
    expect(component.jsonOutput).toBe('');
  });

  it('should show an error for an unclosed quoted field', () => {
    component.csvInput = 'name,city\nJohn,"New York';

    component.convertToJson();

    expect(component.errorMessage).toContain('unclosed quoted field');
  });

  it('should clear the input and output', () => {
    component.csvInput = 'name,age\nJohn,28';
    component.jsonOutput = '[{"name":"John","age":"28"}]';
    component.errorMessage = 'Example error';
    component.successMessage = 'Example success';

    component.clearAll();

    expect(component.csvInput).toBe('');
    expect(component.jsonOutput).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });
});