import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarMisIngresosComponent } from './modificar-mis-ingresos.component';

describe('ModificarMisIngresosComponent', () => {
  let component: ModificarMisIngresosComponent;
  let fixture: ComponentFixture<ModificarMisIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarMisIngresosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarMisIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
