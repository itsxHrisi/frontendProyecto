import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearInvitacionesComponent } from './crear-invitaciones.component';

describe('CrearInvitacionesComponent', () => {
  let component: CrearInvitacionesComponent;
  let fixture: ComponentFixture<CrearInvitacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearInvitacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearInvitacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
