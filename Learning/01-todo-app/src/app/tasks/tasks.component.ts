import { Component, Input } from '@angular/core';
import { TaskComponent } from "./task/task.component";
import { NewtaskComponent } from "./new-task/new-task.component";
import { type NewTask } from './task/task.model';

import { TasksService } from './tasks.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [TaskComponent, NewtaskComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  @Input({required: true}) userid!: string;
  @Input({required: true}) name!: string

  isAddingTask = false;

  constructor(private tasksServices: TasksService) {}

  get selectedUserTasks() {
    return this.tasksServices.getUserTasks(this.userid)
  }

  onAddTask() {
    this.isAddingTask = true;
  }

  onCloseAdd() {
    this.isAddingTask = false;
  }
}
