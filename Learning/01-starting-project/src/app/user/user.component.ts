import { Component } from '@angular/core';

import { DUMMY_USERS } from './dummy-users';

const rndIndex = Math.floor(Math.random() * DUMMY_USERS.length)

@Component({
  selector: 'app-user',
  standalone: true,
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  public selected =  DUMMY_USERS[rndIndex]
}
