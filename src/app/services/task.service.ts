import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task';
import { StorageService } from './storage.service';

const KEY = 'tasks.v1';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private subject = new BehaviorSubject<Task[]>([]);

  constructor(private storage: StorageService) {
    this.subject.next(this.storage.get<Task[]>(KEY, []));
  }

  tasks$(): Observable<Task[]> {
    return this.subject.asObservable();
  }

  getTasks(): Task[] {
    return this.subject.value;
  }

  addTask(title: string, categoryId?: string | null): void {
    const t: Task = {
      id: this.uid(),
      title: title.trim(),
      done: false,
      categoryId: categoryId ?? null,
      createdAt: Date.now()
    };
    if (!t.title) return;
    this.save([t, ...this.subject.value]);
  }

  toggleTask(id: string): void {
    this.save(this.subject.value.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  deleteTask(id: string): void {
    this.save(this.subject.value.filter(t => t.id !== id));
  }

  setCategory(id: string, categoryId: string | null): void {
    this.save(this.subject.value.map(t => t.id === id ? { ...t, categoryId } : t));
  }

  clearCategoryRef(categoryId: string): void {
    this.save(this.subject.value.map(t => t.categoryId === categoryId ? { ...t, categoryId: null } : t));
  }

  seed(count: number): void {
    const base: Task[] = [];
    for (let i = 0; i < count; i++) {
      base.push({
        id: this.uid(),
        title: 'Tarea ' + (i + 1),
        done: i % 3 === 0,
        categoryId: null,
        createdAt: Date.now() - i * 1000
      });
    }
    this.save(base);
  }

  private save(list: Task[]): void {
    this.subject.next(list);
    this.storage.set(KEY, list);
  }

  private uid(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
