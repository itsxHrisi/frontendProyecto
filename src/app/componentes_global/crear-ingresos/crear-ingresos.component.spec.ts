import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearIngresosComponent } from './crear-ingresos.component';

describe('CrearIngresosComponent', () => {
  let component: CrearIngresosComponent;
  let fixture: ComponentFixture<CrearIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearIngresosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
