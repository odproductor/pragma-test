import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../models/task';
import { Category } from '../models/category';
import { TaskService } from '../services/task.service';
import { CategoryService } from '../services/category.service';
import { RemoteConfigService } from '../services/remote-config.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {
  title = '';
  newCategoryId: string | null = null;
  filter$ = new BehaviorSubject<string | null>(null);

  view$!: Observable<{ tasks: Task[]; categories: Category[] }>;
  categories$!: Observable<Category[]>;

  constructor(
    private tasks: TaskService,
    private categories: CategoryService,
    public rc: RemoteConfigService
  ) {}

  ngOnInit(): void {
    this.categories$ = this.categories.categories$();
    this.view$ = combineLatest([this.tasks.tasks$(), this.categories.categories$(), this.filter$]).pipe(
      map(([tasks, categories, id]) => ({
        tasks: id ? tasks.filter(t => t.categoryId === id) : tasks,
        categories
      }))
    );
  }

  onFilterChange(id: string | null): void {
    this.filter$.next(id);
  }

  addTask(): void {
    if (!this.title.trim()) return;
    this.tasks.addTask(this.title, this.newCategoryId);
    this.title = '';
  }

  toggle(id: string): void {
    this.tasks.toggleTask(id);
  }

  remove(id: string): void {
    this.tasks.deleteTask(id);
  }

  seed(): void {
    this.tasks.seed(1000);
  }

  trackById(_: number, t: Task): string {
    return t.id;
  }

  categoryName(id: string | null | undefined, categories: Category[]): string {
    if (!id) return '';
    const c = categories.find(x => x.id === id);
    return c ? c.name : '';
  }
}
