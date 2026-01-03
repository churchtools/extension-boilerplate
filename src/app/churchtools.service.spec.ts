import { TestBed } from '@angular/core/testing';

import { ChurchtoolsService } from './churchtools.service';

describe('Churchtools', () => {
  let service: ChurchtoolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChurchtoolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
