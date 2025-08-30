// src/app/features/home/home.component.ts
import { Component } from '@angular/core';
import { AppService } from '../../../../services';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {


  constructor(public appService: AppService) {
    
  }
}