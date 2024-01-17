import { CommonModule } from '@angular/common';
import { Component, inject, Injector, computed, effect, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task } from '../../models/task.model'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  tasks = signal<Task[]>([]);
  filter = signal<'all' | 'pending' | 'completed'>('all')
  tasksByFilter = computed(() => {
    const filter = this.filter()
    const tasks = this.tasks()
    if (filter === 'pending') {
      return tasks.filter(task => !task.completed)
    }
    if (filter === 'completed') {
      return tasks.filter(task => task.completed)
    }
    return tasks
  })

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
    ]
  })

  injector = inject(Injector);

  ngOnInit() {
    const storage = localStorage.getItem('tasks')
    if (storage) {
      const tasks = JSON.parse(storage)
      this.tasks.set(tasks)
    }
    this.trackTasks()
  }

  trackTasks() {
    effect(() => {
      const tasks = this.tasks()
      console.log(tasks);
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }, { injector: this.injector })
  }

  // changeHandler(event: Event) {
  //   const input = event.target as HTMLInputElement
  //   const newTask = input.value
  //   this.addTask(newTask)
  //   input.value = '';
  // }

  changeHandler() {
    const value = this.newTaskCtrl.value.trim()
    if (this.newTaskCtrl.valid && value) {
        this.addTask(value)
    }
    this.newTaskCtrl.setValue('')
  }

  addTask(title: string) {
    const newTask = {
      id: Date.now(),
      title,
      completed: false
    }
    this.tasks.update((tasks) => [...tasks, newTask])
  }

  deleteTask(index: number) {
    this.tasks.update((tasks) => tasks.filter((task, i) => i !== index))
  }

  completeTask(index: number) {
    // this.tasks.update(tasks => {
    //   tasks[index] && (
    //     tasks[index].completed = !tasks[index].completed
    //   )
    //   return tasks
    // })

    this.tasks.update(tasks =>
      tasks.map((task, i) => {
        if (i === index) {
          task.completed = !task.completed
        }
        return task
      })
    )
  }

  // updateTask(index: number) {
  //   this.tasks.update((tasks) => {
  //     return tasks.map((task, i) => {
  //       if (i === index) {
  //         return {
  //           ...task,
  //           completed: !task.completed
  //         }
  //       }
  //      return task
  //     })
  //   })
  // }

  editTask(index: number) {
   if(this.tasks()[index].completed) return;

   this.tasks.update((tasks) => {
      return tasks.map((task, i) => {
        if (i === index) {
          return {
            ...task,
            editing: true
          }
        }
       return {
        ...task,
        editing: false
       }
      })
    })
  }

  updateTaskText(index: number, event: Event) {
    const input = event.target as HTMLInputElement
    this.tasks.update((tasks) => {
       return tasks.map((task, i) => {
         if (i === index) {
           return {
             ...task,
             title: input.value,
             editing: false
           }
         }
         return task
       })
     })
   }

   escapeTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, i) => {
        if (i === index) {
          return {
            ...task,
            editing: false
          }
        }
        return task
      })
    })
   }

   changeFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter.set(filter)
   }

}
