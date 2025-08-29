import { Component, OnInit } from '@angular/core';
import { ExpirationPeriod, ExpirationType } from '../../../../models';
import { DbService } from '../../../../services';

@Component({
  selector: 'app-expiration-settings',
  templateUrl: './expiration-settings.component.html',
  styleUrls: ['./expiration-settings.component.scss']
})
export class ExpirationSettingsComponent implements OnInit {
  periods = Object.values(ExpirationPeriod);
  types = Object.values(ExpirationType);
  defaultPeriod = ExpirationPeriod.OneWeek;
  typeExpirations: { [key: string]: ExpirationPeriod } = {};

  constructor(private dbService: DbService) { }

  ngOnInit() {
    // Load from user settings in DB
  }

  save() {
    // Save to user settings in DB
    // Precedence: message > contact/group > type > default
  }
}