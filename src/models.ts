export interface EmailData {
  subject: string;
  from: string;
  template?: string;
  template_key?: string;
  data?: any;
  to: string|Array<string>;
  bcc?: string|Array<string>;
  cc?: string|Array<string>;
}

export class User {

  constructor() {
  }

  private _name: string;
  private _login: string;
  private _token: string;
  private _id: number;
  private _email: string;

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get token(): string {
    return this._token;
  }

  set token(value: string) {
    this._token = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get login(): string {
    return this._login;
  }

  set login(value: string) {
    this._login = value;
  }
}
