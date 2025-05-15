import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./componentes_global/footer/footer.component";
import { Footer2Component } from "./componentes_global/footer2/footer2.component";

import { HeaderComponent } from "./componentes_global/header/header.component";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,FooterComponent,Footer2Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-proyecto';
}
