import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
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
  categories$!: Observable<Category[]>;

  constructor(
    private categories: CategoryService,
    private tasks: TaskService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.categories$ = this.categories.categories$();
  }

  addCategory(): void {
    if (!this.name.trim()) return;
    this.categories.addCategory(this.name);
    this.name = '';
  }

  async startEdit(c: Category): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Editar categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: c.name,
          placeholder: 'Nombre'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const newName = (data?.name || '').trim();
            if (!newName) return false;
            this.categories.updateCategory(c.id, { name: newName });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async remove(id: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Borrar categoría',
      message: 'Las tareas asociadas quedarán sin categoría. ¿Seguir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: () => {
            this.tasks.clearCategoryRef(id);
            this.categories.deleteCategory(id);
          }
        }
      ]
    });
    await alert.present();
  }

  trackById(_: number, c: Category): string {
    return c.id;
  }
}
