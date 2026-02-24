import { boardReducer, BoardState } from './reducers/board.reducer';
import { authReducer, AuthState } from './reducers/auth.reducer';
import { BoardActions } from './actions/board.actions';
import { AuthActions } from './actions/auth.actions';
import * as BoardSelectors from './selectors/board.selectors';
import * as AuthSelectors from './selectors/auth.selectors';
import { BoardEffects } from './effects/board.effects';
import { AuthEffects } from './effects/auth.effects';

export interface AppState {
  boards: BoardState;
  auth: AuthState;
}

export const reducers = {
  boards: boardReducer,
  auth: authReducer,
};

export const effects = [BoardEffects, AuthEffects];

export { BoardActions, AuthActions, BoardSelectors, AuthSelectors };
export { type BoardState, type AuthState };
