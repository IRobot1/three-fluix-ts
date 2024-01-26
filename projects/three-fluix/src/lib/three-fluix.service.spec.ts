import { TestBed } from '@angular/core/testing';

import { ThreeFluixService } from './three-fluix.service';

describe('ThreeFluixService', () => {
  let service: ThreeFluixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreeFluixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
