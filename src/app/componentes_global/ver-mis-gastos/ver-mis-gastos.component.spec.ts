import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMisGastosComponent } from './ver-mis-gastos.component';

describe('VerMisGastosComponent', () => {
  let component: VerMisGastosComponent;
  let fixture: ComponentFixture<VerMisGastosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMisGastosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMisGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
