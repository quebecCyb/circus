export class User {
  private _login: string
  private _color: string

  constructor(login: string, color: string) {
    this._login = login;
    this._color = color;
  }

  get login(): string {
    return this._login;
  }

  set login(value: string) {
    this._login = value;
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._color = value;
  }
}