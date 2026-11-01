import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonToCsvComponent } from './json-to-csv.component';

describe('JsonToCsvComponent', () => {
  let component: JsonToCsvComponent;
  let fixture: ComponentFixture<JsonToCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonToCsvComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonToCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert a JSON array into CSV', () => {
    component.jsonInput = JSON.stringify([
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]);

    component.convertToCsv();

    expect(component.csvOutput).toBe(
      'name,age\nJohn,30\nJane,25'
    );
    expect(component.errorMessage).toBe('');
  });

  it('should include headers from all objects', () => {
    component.jsonInput = JSON.stringify([
      { name: 'John' },
      { name: 'Jane', city: 'London' },
    ]);

    component.convertToCsv();

    expect(component.csvOutput).toBe(
      'name,city\nJohn,\nJane,London'
    );
  });

  it('should escape commas, quotes, and newlines in CSV values', () => {
    component.jsonInput = JSON.stringify([
      {
        name: 'John, Smith',
        note: 'Said "hello"',
        address: 'First line\nSecond line',
      },
    ]);

    component.convertToCsv();

    expect(component.csvOutput).toBe(
      'name,note,address\n' +
        '"John, Smith","Said ""hello""","First line\nSecond line"'
    );
  });

  it('should serialize nested objects as JSON text', () => {
    component.jsonInput = JSON.stringify([
      { name: 'John', details: { active: true } },
    ]);

    component.convertToCsv();

    expect(component.csvOutput).toBe(
      'name,details\nJohn,"{""active"":true}"'
    );
  });

  it('should show an error for invalid JSON', () => {
    component.jsonInput = '{ invalid json';

    component.convertToCsv();

    expect(component.csvOutput).toBe('');
    expect(component.errorMessage).toBe(
      'Invalid JSON. Please check your input.'
    );
  });

  it('should reject a JSON value that is not an array', () => {
    component.jsonInput = JSON.stringify({ name: 'John' });

    component.convertToCsv();

    expect(component.errorMessage).toBe(
      'Please enter a non-empty JSON array of objects.'
    );
  });

  it('should reject arrays containing non-object values', () => {
    component.jsonInput = JSON.stringify([
      { name: 'John' },
      'not an object',
    ]);

    component.convertToCsv();

    expect(component.errorMessage).toBe(
      'Every item in the JSON array must be an object.'
    );
  });

  it('should load sample data and convert it', () => {
    component.loadSample();

    expect(component.jsonInput).toContain('"name": "John"');
    expect(component.csvOutput).toContain('name,age,city');
    expect(component.errorMessage).toBe('');
  });

  it('should clear input, output, and errors', () => {
    component.jsonInput = 'invalid';
    component.csvOutput = 'existing output';
    component.errorMessage = 'existing error';

    component.clearAll();

    expect(component.jsonInput).toBe('');
    expect(component.csvOutput).toBe('');
    expect(component.errorMessage).toBe('');
  });
});