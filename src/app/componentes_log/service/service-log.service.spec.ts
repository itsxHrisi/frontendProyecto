import { TestBed } from '@angular/core/testing';

import { ServiceLogService } from './service-log.service';

describe('ServiceLogService', () => {
  let service: ServiceLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
