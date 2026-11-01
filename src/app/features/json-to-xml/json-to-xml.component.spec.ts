import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonToXmlComponent } from './json-to-xml.component';

describe('JsonToXmlComponent', () => {
  let component: JsonToXmlComponent;
  let fixture: ComponentFixture<JsonToXmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonToXmlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonToXmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have blank input initially', () => {
    expect(component.jsonInput).toBe('');
    expect(component.xmlOutput).toBe('');
  });

  it('should load sample JSON when requested', () => {
    component.loadSample();

    expect(component.jsonInput).toContain('CodexaKit');
  });

  it('should convert an object to XML', () => {
    component.jsonInput = '{"name":"CodexaKit","active":true}';

    component.convertToXml();

    expect(component.xmlOutput).toContain('<root>');
    expect(component.xmlOutput).toContain('<name>CodexaKit</name>');
    expect(component.xmlOutput).toContain('<active>true</active>');
    expect(component.errorMessage).toBe('');
  });

  it('should convert arrays to item elements', () => {
    component.jsonInput = '{"tools":["Formatter","Converter"]}';

    component.convertToXml();

    expect(component.xmlOutput).toContain('<tools>');
    expect(component.xmlOutput).toContain('<item>Formatter</item>');
    expect(component.xmlOutput).toContain('<item>Converter</item>');
  });

  it('should escape XML special characters', () => {
    component.jsonInput = '{"value":"A & B < C"}';

    component.convertToXml();

    expect(component.xmlOutput).toContain('A &amp; B &lt; C');
  });

  it('should show an error for invalid JSON', () => {
    component.jsonInput = '{"name":';

    component.convertToXml();

    expect(component.errorMessage).toBeTruthy();
    expect(component.xmlOutput).toBe('');
  });

  it('should reject an array as the root JSON value', () => {
    component.jsonInput = '[1,2,3]';

    component.convertToXml();

    expect(component.errorMessage).toBe('The JSON root must be an object.');
  });

  it('should clear input, output, and messages', () => {
    component.jsonInput = '{"name":"test"}';
    component.xmlOutput = '<root></root>';
    component.errorMessage = 'Example error';
    component.successMessage = 'Example success';

    component.clearAll();

    expect(component.jsonInput).toBe('');
    expect(component.xmlOutput).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });
});