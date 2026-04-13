import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesPage implements OnInit {
  name = '';
  editingId: string | null = null;
  editingName = '';

  categories$!: Observable<Category[]>;

  constructor(private categories: CategoryService, private tasks: TaskService) {}

  ngOnInit(): void {
    this.categories$ = this.categories.categories$();
  }

  addCategory(): void {
    if (!this.name.trim()) return;
    this.categories.addCategory(this.name);
    this.name = '';
  }

  startEdit(c: Category): void {
    this.editingId = c.id;
    this.editingName = c.name;
  }

  saveEdit(): void {
    if (!this.editingId || !this.editingName.trim()) return;
    this.categories.updateCategory(this.editingId, { name: this.editingName });
    this.editingId = null;
    this.editingName = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingName = '';
  }

  remove(id: string): void {
    this.tasks.clearCategoryRef(id);
    this.categories.deleteCategory(id);
  }

  trackById(_: number, c: Category): string {
    return c.id;
  }
}
