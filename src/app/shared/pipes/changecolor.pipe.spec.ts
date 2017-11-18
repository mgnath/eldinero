import { ChangecolorPipe } from './changecolor.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('ChangecolorPipe', () => {
  it('create an instance', () => {
    var sanitizer: DomSanitizer;
    const pipe = new ChangecolorPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
