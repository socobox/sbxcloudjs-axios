import {SbxCoreService} from './sbxcore.service';

export class SbxSessionService {

  private _user: User;

  constructor(private sbxCoreService: SbxCoreService) { }

  public initialize(domain: number, appKey: string, baseUrl: string = 'https://sbxcloud.com/api') {
    this.sbxCoreService.initialize(domain, appKey, baseUrl);
    this.islogged();
  }

  /**
   * Initialize service with environment
   * @param environment (domain, base_url, appkey)
   */
  public initializeWithEnvironment(environment: any) {
    this.sbxCoreService.initialize(environment.domain, environment.appKey, environment.baseUrl);
    this.islogged();
  }

  /**
   * General User methods
   */

  getCurrentUser(): User {
    return (this._user == null) ? this._user = new User() : this._user;
  }

  islogged(): boolean {
    this.loadToken();
    if (this.getCurrentUser().token) {
      this.sbxCoreService.addHeaderAttr('authorization', 'Bearer ' + this.getCurrentUser().token);
      return true;
    } else {
      return false;
    }
  }

  /**
   * methods that uses cookies
   */

  private loadToken(): void {
    this.getCurrentUser().token = window.localStorage.getItem('token');
  }

  public updateToken(token: string): void {
    window.localStorage.setItem('token', token);
  }

  private updateUser(data: any) {
    this._user.token = data.token;
    this._user.id = data.user.id;
    this._user.name = data.user.name;
    this._user.login = data.user.login;
    this._user.email = data.user.email;
    this.updateToken(data.token);
    this.sbxCoreService.addHeaderAttr('authorization','Bearer ' + data.token);
  }

  /**
   * Auth user methods
   */

  login(login: string, password: string, domain?: number) {
    return this.sbxCoreService.login(login, password, domain).then(data => {
      if ((<any>data).success) {
        this.updateUser(data);
      }
      return data;
    });
  }

  validate(token: string) {
    return this.sbxCoreService.validate(token).then(data => {
      if (data.success) {
        data.token = token;
        this.updateUser(data);
      }
      return data;
    });
  }

  logout(): void {
    window.localStorage.removeItem('token');
    this.sbxCoreService.removeHeaderAttr('token');
    this._user = null;
  }

  signUp(login: string, email: string, name: string, password: string) {
    return this.sbxCoreService.signUp(login, email, name, password).then(data => {
      if ((<any>data).success) {
        this.updateUser(data);
      }
      return data;
    });
  }

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
