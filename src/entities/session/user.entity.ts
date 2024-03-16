export class User {
  private _username: string
  private _color: string

  constructor(username: string, color: string) {
    this._username = username;
    this._color = color;
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._color = value;
  }
}