
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../form/label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';

@Component({
  selector: 'app-signin-form',
  imports: [LabelComponent, ButtonComponent, InputFieldComponent, RouterModule, FormsModule],
  templateUrl: './signin-form.component.html',
  styles: '',
})
export class SigninFormComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  email = '';
  password = '';
  erreur = signal('');
  chargement = signal(false);

  onSignIn() {
    this.erreur.set('');
    this.chargement.set(true);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: error => {
        this.chargement.set(false);
        this.erreur.set(error.status === 0
          ? 'Impossible de joindre le serveur.'
          : 'Identifiant ou mot de passe incorrect.');
      },
    });
  }
}
