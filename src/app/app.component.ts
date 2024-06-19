import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BroadcastComponent} from "./broadcast/broadcast.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BroadcastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cumera';
}
