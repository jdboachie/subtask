import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../auth/models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ username: string; password: string }>(),
    'Login Success': props<{ user: User; password: string }>(),
    'Login Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),

    'Load User': emptyProps(),
    'Load User Success': props<{ user: User | null }>(),
  },
});
