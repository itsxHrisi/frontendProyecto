import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMisIngresosComponent } from './ver-mis-ingresos.component';

describe('VerMisIngresosComponent', () => {
  let component: VerMisIngresosComponent;
  let fixture: ComponentFixture<VerMisIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMisIngresosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMisIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
