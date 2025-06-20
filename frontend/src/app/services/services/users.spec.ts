import { TestBed } from '@angular/core/testing';

import { UsersServices } from './users';

describe('Users', () => {
  let service: UsersServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
