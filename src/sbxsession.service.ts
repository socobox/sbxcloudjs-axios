import {SbxCoreService} from './sbxcore.service';
import {User} from "./models";

export class SbxSessionService {

  constructor(private sbxCoreService: SbxCoreService) { }

  public initialize(domain: number, appKey: string, baseUrl: string = 'https://sbxcloud.com/api') {
    this.sbxCoreService.initialize(domain, appKey, baseUrl);
    this.isLogged();
  }

  /**
   * Initialize service with environment
   * @param environment (domain, base_url, appkey)
   */
  public initializeWithEnvironment(environment: any) {
    this.sbxCoreService.initialize(environment.domain, environment.appKey, environment.baseUrl);
    this.isLogged();
  }

  /**
   * General User methods
   */

  getCurrentUser(): User {
    return this.sbxCoreService.getCurrentUser();
  }

  isLogged(): boolean {
    const token = this.getToken();
    if (token) {
      this.sbxCoreService.addHeaderAttr('authorization', 'Bearer ' + token);
      return true;
    }
    return false;
  }

  getToken(): string | null {
    this.loadToken();
    const token = this.getCurrentUser().token;
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }
    return null;
  }

  /**
   * methods that uses cookies
   */

  private loadToken(): void {
    this.getCurrentUser().token = window.localStorage.getItem(SbxCoreService.environment.appKey + '_token');
  }

  public updateToken(token: string): void {
    window.localStorage.setItem(SbxCoreService.environment.appKey + '_token', token);
    this.isLogged();
  }

  public updateUser(data: any) {
    const user = this.getCurrentUser();
    user.token = data.token;
    user.id = data.user.id;
    user.name = data.user.name;
    user.login = data.user.login;
    user.email = data.user.email;
    this.updateToken(data.token);
  }

  /**
   * Auth user methods
   */

  login(login: string, password: string, domain?: number) {
    return this.sbxCoreService.login(login, password, domain).then((data: any) => {
      if (data.success) {
        this.updateUser(data);
      }
      return data;
    });
  }

  validate(token: string) {
    return this.sbxCoreService.validate(token).then(res => res as any).then((data: any) => {
      if (data.success) {
        data.token = token;
        this.updateUser(data);
      }
      return data;
    });
  }

  logout(): void {
    window.localStorage.removeItem(SbxCoreService.environment.appKey + '_token');
    this.sbxCoreService.removeHeaderAttr('token');
    this.sbxCoreService.removeCurrentUser();
  }

  signUp(login: string, email: string, name: string, password: string) {
    return this.sbxCoreService.signUp(login, email, name, password).then((data: any) => {
      if (data.success) {
        this.updateUser(data);
      }
      return data;
    });
  }

}
