import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGrupoFamiliarComponent } from './crear-grupo-familiar.component';

describe('CrearGrupoFamiliarComponent', () => {
  let component: CrearGrupoFamiliarComponent;
  let fixture: ComponentFixture<CrearGrupoFamiliarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGrupoFamiliarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearGrupoFamiliarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
