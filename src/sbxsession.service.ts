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
    const token = this.getCurrentUser().token;
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }
    return null;
  }

  public updateToken(token: string): void {
    const user = this.getCurrentUser();
    user.token = token;
    this.isLogged();
  }

  /**
   * Auth user methods
   */

  login(login: string, password: string, domain?: number) {
    return this.sbxCoreService.login(login, password, domain).then((data: any) => {
      if (data.success) {
        this.updateToken(data.token);
      }
      return data;
    });
  }

  validate(token: string) {
    return this.sbxCoreService.validate(token).then(res => res as any).then((data: any) => {
      if (data.success) {
        this.updateToken(token);
      }
      return data;
    });
  }

  logout(): void {
    this.sbxCoreService.removeHeaderAttr('token');
    this.sbxCoreService.removeCurrentUser();
  }

  signUp(login: string, email: string, name: string, password: string) {
    return this.sbxCoreService.signUp(login, email, name, password).then((data: any) => {
      if (data.success) {
        this.updateToken(data.token);
      }
      return data;
    });
  }

}
