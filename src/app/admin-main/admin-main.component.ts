import { Component } from '@angular/core';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [AdminSidebarComponent,RouterOutlet],
  templateUrl: './admin-main.component.html',
  styleUrl: './admin-main.component.scss'
})
export class AdminMainComponent {

}
