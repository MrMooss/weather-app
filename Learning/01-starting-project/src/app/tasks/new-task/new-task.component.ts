import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type NewTask } from '../task/task.model';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css'
})
export class NewtaskComponent {
  @Input({required: true}) userId!: string
  @Output() close = new EventEmitter<void>();

  enteredTitle = signal('');
  enteredSummary = '';
  enteredDate='';

  private tasksServices = inject(TasksService)

  onCancel() {
    this.close.emit()
  }

  onSubmit() {
    this.tasksServices.addTask({
      title: this.enteredTitle(),
      summary: this.enteredSummary,
      dueDate: this.enteredDate
    }, this.userId);

    this.close.emit()
  }
}
