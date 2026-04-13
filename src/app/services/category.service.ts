import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category';
import { StorageService } from './storage.service';

const KEY = 'categories.v1';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private subject = new BehaviorSubject<Category[]>([]);

  constructor(private storage: StorageService) {
    this.subject.next(this.storage.get<Category[]>(KEY, []));
  }

  categories$(): Observable<Category[]> {
    return this.subject.asObservable();
  }

  getCategories(): Category[] {
    return this.subject.value;
  }

  addCategory(name: string, color?: string): void {
    const c: Category = { id: this.uid(), name: name.trim(), color };
    if (!c.name) return;
    this.save([...this.subject.value, c]);
  }

  updateCategory(id: string, patch: Partial<Category>): void {
    this.save(this.subject.value.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  deleteCategory(id: string): void {
    this.save(this.subject.value.filter(c => c.id !== id));
  }

  private save(list: Category[]): void {
    this.subject.next(list);
    this.storage.set(KEY, list);
  }

  private uid(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
