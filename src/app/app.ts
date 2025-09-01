import { Component, signal, OnInit } from '@angular/core';
import { Header } from './components/header/header';

import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [
    Header,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Mulot Pay');
}
