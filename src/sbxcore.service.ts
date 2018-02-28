import QueryBuilder from 'sbx-querybuilder/index';
import { Observable } from 'rxjs/Observable';
import { Find } from 'sbxcorejs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

@Injectable()
export class SbxCoreService {

  public static environment = { } as any;
  private headers: any;

  private urls: any = {
    update_password: '/user/v1/password',
    login: '/user/v1/login',
    register: '/user/v1/register',
    validate: '/user/v1/validate',
    row: '/data/v1/row',
    find: '/data/v1/row/find',
    update: '/data/v1/row/update',
    delete: '/data/v1/row/delete',
    downloadFile: '/content/v1/download',
    uploadFile: '/content/v1/upload',
    addFolder: '/content/v1/folder',
    folderList: '/content/v1/folder',
    send_mail: '/email/v1/send',
    payment_customer: '/payment/v1/customer',
    payment_card: '/payment/v1/card',
    payment_token: '/payment/v1/token',
    password: '/user/v1/password/request',
    cloudscript_run: '/cloudscript/v1/run'
  };

  constructor(private httpClient: HttpClient) { }

  public initialize(domain: number, appKey: string, baseUrl: string = 'https://sbxcloud.com/api') {
    SbxCoreService.environment.domain = domain;
    SbxCoreService.environment.baseUrl = baseUrl;
    SbxCoreService.environment.appKey = appKey;
    this.headers = new HttpHeaders()
      .set('App-Key', SbxCoreService.environment.appKey);
  }
  
  public addHeaderAttr(name: string, value: string): void {
    this.headers = this.getHeaders().set(name, value);
  }

  public removeHeaderAttr(name: string) {
    this.headers = this.getHeaders().delete(name);
  }

  private getHeaders(): any {
    return  this.headers;
  }

  private getHeadersJSON(): any {
    return this.getHeaders().append('Content-Type', 'application/json');
  }

  $p(path: string) {
    return SbxCoreService.environment.baseUrl + path;
  }

  /**
   * AUTH
   */

  /**
   * @param {string} token
   */
  validate(token: string) {
    return this.validateRx(token).toPromise();
  }

  /**
   * @param {string} token
   * @return {Observable<any>}
   */
  validateRx(token: string): Observable<any> {
    const httpParams = new HttpParams().set('token', token) ;
    const option = {headers: this.getHeadersJSON(), params: httpParams};
    return this.httpClient.get(this.$p(this.urls.validate), option).map(data => data as any) ;
  }

  private encodeEmails(email: string) {
    const spl = email.split('@');
    if (spl.length > 1) {
      email = encodeURIComponent(spl[0]) + '@' + spl[1];
    }
    return email;
  }

  private validateLogin(login: string): boolean {
    const rlogin   =  /^(\w?\.?\-?)+$/;
    return rlogin.test(login);
  }

  private validateEmail(email: string): boolean {
    const rlogin  =  /^(\w?\.?\-?\+?)+@(\w?\.?\-?)+$/;
    return rlogin.test(email);
  }

  /**
   *
   * @param {string} login
   * @param {string} email
   * @param {string} name
   * @param {string} password
   */
  signUp(login: string, email: string, name: string, password: string) {
    return this.signUpRx(login, email, name, password).toPromise();
  }

  /**
   * @param {string} login
   * @param {string} email
   * @param {string} name
   * @param {string} password
   * @return {Observable<any>}
   */
  signUpRx(login: string, email: string, name: string, password: string): Observable<any> {
    if (this.validateLogin(login) && this.validateEmail(email)) {
      const option = {headers: this.getHeadersJSON()};
      const params = '?email=' + this.encodeEmails(email) + '&password=' +  encodeURIComponent(password) + '&name='
        + name + '&login=' + login + '&domain=' + SbxCoreService.environment.domain.toLocaleString();
      return this.httpClient.get(this.$p(this.urls.register) + params, option).map(data => data as any);
    } else {
      return Observable.of({success: false,
        error: 'Login or email contains invalid characters. Letters, numbers and underscore are accepted'});
    }
  }

  /**
   * @param {string} login
   * @param {string} password
   * @param {Callback} callBack
   * @param {domain}
   */
  login(login: string, password: string, domain?: number) {
    return this.loginRx(login, password, domain).toPromise();
  }

  /**
   * @param {string} login
   * @param {string} password
   *  @param {domain}
   * @return {Observable<any>}
   */
  loginRx(login: string, password: string, domain?: number): Observable<any> {
    if ( (this.validateLogin(login) && login.indexOf('@') < 0) ||  (login.indexOf('@') >= 0 && this.validateEmail(login))) {
      const option = {headers: this.getHeadersJSON()};
      const params = '?login=' + this.encodeEmails(login) + '&password=' + encodeURIComponent(password)
        + (domain ? '&domain=' + domain : '');
      return this.httpClient.get(this.$p(this.urls.login) + params, option).map(data => data as any);
    }else {
      return Observable.of({success: false,
        error: 'Login contains invalid characters. Letters, numbers and underscore are accepted'});
    }
  }


  /**
   * Send email to changePassword
   * @param {string} userEmail
   * @param {string} subject
   * @param {string} emailTemplate
   */
  sendPasswordRequest(userEmail: string, subject: string, emailTemplate: string) {
    return this.sendPasswordRequestRx(userEmail, subject, emailTemplate).toPromise();
  }

  /**
   * Send email to changePassword
   * @param {string} userEmail
   * @param {string} subject
   * @param {string} emailTemplate
   * @return {Observable<Object>}
   */
  sendPasswordRequestRx(userEmail: string, subject: string, emailTemplate: string): Observable<any> {
    const body =  {user_email: userEmail,
      domain: SbxCoreService.environment.domain, subject: subject, email_template: emailTemplate};
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.password), body, option).map( data => data as any);
  }

  /**
   * change password with email code
   * @param {number} userId
   * @param {number} userCode
   * @param {string} newPassword
   */
  requestChangePassword(userId, userCode, newPassword) {
    return this.requestChangePasswordRx(userId, userCode, newPassword).toPromise();
  }

  /**
   * change password with email code
   * @param {number} userId
   * @param {number} userCode
   * @param {string} newPassword
   * @return {Observable<Object>}
   */
  requestChangePasswordRx(userId, userCode, newPassword) {
    const body = {domain: SbxCoreService.environment.domain,
      password: newPassword,
      user_id: userId,
      code: userCode};
    const option = { headers: this.getHeadersJSON()};
    return this.httpClient.put(this.$p(this.urls.password), body , option).map(data => data);
  }

  /**
   * change password
   * @param {string} newPassword
   */
  changePassword(newPassword) {
    return this.changePasswordRx(newPassword).toPromise();
  }

  /**
   * change password
   * @param {string} newPassword
   * @return {Observable<Object>}
   */
  changePasswordRx(newPassword) {
    const httpParams = new HttpParams().set('domain', SbxCoreService.environment.domain).set('password', newPassword);
    const option = { headers: this.getHeadersJSON(), params: httpParams };
    return this.httpClient.get(this.$p(this.urls.update_password), option).map(data => data);
  }

  /***
   * DATA
   */

  /**
   * @param {string} model the name model in sbxcloud
   * @param data can be a JSON, or TypeScript Class or Array of both
   */
  insert(model: string, data: any) {
    return this.insertRx(model, data).toPromise();
  }

  /**
   * @param {string} model the name model in sbxcloud
   * @param data can be a JSON, or TypeScript Class or Array of both
   */
  update(model: string, data: any) {
    return this.updateRx(model, data).toPromise();
  }

  /**
   * @param {string} model the name model in sbxcloud
   * @param data can be a JSON, or TypeScript Class or Array of both
   * @return {Observable}
   */
  insertRx(model: string, data: any): Observable<any> {
    const body = this.queryBuilderToInsert(data).setModel(model).compile();
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.row), body, option).map(res => res as any);
  }

  /**
   * @param {string} model the name model in sbxcloud
   * @param data can be a JSON, or TypeScript Class or Array of both
   * @return {Observable}
   */
  updateRx(model: string, data: any): Observable<any> {
    const body = this.queryBuilderToInsert(data).setModel(model).compile();
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.update), body, option).map(res => res as any);
  }
  /**
   * @param {string} model the name model in sbxcloud
   * @param keys can be a string, a Class or array of both
   * @param {Callback} callBack
   */
  delete(model: string) {
    return new AngularFind(model, this, false);
  }

  /**
   * @param {string} model the name model in sbxcloud
   * @param keys can be a string, a Class or array of both
   */
  find(model: string) {
    return new AngularFind(model, this, true);
  }


  /**
   * @param {EmailData} data
   */
  sendEmail(data: EmailData) {
    return this.sendEmailRx(data).toPromise();
  }

  /**
   * @param {EmailData} data
   * @return {Observable<any>}
   */
  sendEmailRx(data: EmailData): Observable<any> {
    const mail = {
      subject: data.subject,
      to: data.to,
      domain: SbxCoreService.environment.domain,
      from: data.from,
    } as any;
    if (data.template) {
      mail.html = data.template;
    } else {
      mail.template_key = data.template_key;
    }
    if (data.cc) {
      mail.cc = data.cc;
    }
    if (data.bcc) {
      mail.bcc = data.bcc;
    }
    if (data.data) {
      mail.data = data.data;
    }
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.send_mail), mail, option).map(res => res as any);
  }


  /**
   * @param data
   */
  paymentCustomer(data: Object) {
    return this.paymentCustomerRx(data).toPromise();
  }

  /**
   * @param data
   * @return {Observable<any>}
   */
  paymentCustomerRx(data: Object): Observable<any> {
    data['domain'] = SbxCoreService.environment.domain;
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.payment_customer), data, option).map(res => res as any);
  }

  /**
   * @param data
   */
  paymentCard(data: Object) {
    return this.paymentCardRx(data).toPromise();
  }

  /**
   * @param data
   * @return {Observable<any>}
   */
  paymentCardRx(data: Object): Observable<any> {
    data['domain'] = SbxCoreService.environment.domain;
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.payment_card), data, option).map(res => res as any);
  }


  /**
   * @param {string} key
   * @param file
   * @return {Observable<any>}
   */
  uploadFileRx(key: string, file: any): Observable<any> {
    const input = new FormData();
    input.append('file', file);
    input.append('model', JSON.stringify({ key: key}));
    const option = {headers: this.getHeaders() };
    return this.httpClient.post(this.$p(this.urls.uploadFile), input, option).map(res => res as any);
  }

  /**
   *
   * @param {string} key
   * @param file
   */
  uploadFile(key: string, file: any) {
    return this.uploadFileRx(key, file).toPromise();
  }

  /**
   * @param {string} key
   * @return {Observable<any>}
   */
  downloadFileRx(key: string): Observable<any> {
    const httpParams = new HttpParams().set('action', 'download').set('key', key);
    const option = {headers: this.getHeaders(), params: httpParams };
    return this.httpClient.get(this.$p(this.urls.downloadFile), option).map(res => res as any);
  }

  /**
   *
   * @param {string} key
   */
  downloadFile(key: string) {
    return this.downloadFileRx(key).toPromise();
  }
  

  /**
   * CLOUDSCRIPT
   */

  /**
   *
   * @param {string} key
   * @param params
   * @return {Observable<any>}
   */
  runRx(key: string, params: any): Observable<any> {
    const option = {headers: this.getHeadersJSON() };
    return this.httpClient.post(this.$p(this.urls.cloudscript_run), { key: key, params: params }, option).map(res => res as any);
  }

  /**
   * @param {string} key
   * @param params
   */
  run(key: string, params: any) {
    return this.runRx(key, params).toPromise();
  }

  /**
   * UTILS
   */

  private queryBuilderToInsert(data): any {
    const query =   new QueryBuilder()
      .setDomain(SbxCoreService.environment.domain);
    if (Array.isArray(data) ) {
      data.forEach(item => {
        query.addObject(this.validateData(item));
      });
    }else {
      query.addObject(this.validateData(data));
    }
    return query;
  }

  public validateData(data: any): any {
    const temp = {};
    Object.keys(data)
      .filter(key => {
        const v = data[key];
        return (Array.isArray(v) || typeof v === 'string') ?
          (v.length > 0) :
          (v !== null && v !== undefined);
      }).forEach(key => {
      if (data[key]._KEY != null) {
        data[key] = data[key]._KEY;
      }
      const key2 = (key !== '_KEY') ? key.replace(/^_/, '') : key;
      temp[key2] = data[key];
    });
    return temp;
  }

  public validateKeys(data: any): any {
    const temp = [];
    if (Array.isArray(data) ) {
      data.forEach(key => {
        if (typeof key === 'string') {
          temp.push(key);
        }else {
          temp.push(key._KEY);
        }
      });
    }else {
      if (typeof data === 'string') {
        temp.push(data);
      }else {
        temp.push(data._KEY);
      }
    }
    return temp;
  }
  
  /**
   * @deprecated Now you can parameterize the 'then' function with a fetch array
   * @param response the response of the server
   * @param {string[]} completefetch the array of fetch
   * @returns {any} the response with the union between fetch_results and results
   */
  public mapFetchesResult(response: any, completefetch: string[] ) {

    if (response.fetched_results) {
      const fetch = [];
      const secondfetch = {};
      for (let i = 0; i < completefetch.length; i++) {
        let index = 0;
        const temp = completefetch[i].split('.');
        if (fetch.indexOf(temp[0]) < 0) {
          fetch.push(temp[0]);
          index = fetch.length - 1;
        } else {
          index = fetch.indexOf(temp[0]);
        }
        if (temp.length === 2 && !secondfetch[fetch[index]]) {
          secondfetch[fetch[index]] = [];
        }

        if (temp.length === 2) {
          secondfetch[fetch[index]].push(temp[1]);
        }
      }
      for (let i = 0; i < response.results.length; i++) {
        for (let j = 0; j < fetch.length; j++) {
          for (const mod in response.fetched_results) {
            if (response.fetched_results[mod][response.results[i][fetch[j]]]) {
              response.results[i][fetch[j]] = response.fetched_results[mod][response.results[i][fetch[j]]];
              if (secondfetch[fetch[j]]) {
                for (let k = 0; k < secondfetch[fetch[j]].length; k++) {
                  const second = secondfetch[fetch[j]][k];
                  for (const mod2 in response.fetched_results) {
                    if (response.fetched_results[mod2][response.results[i][fetch[j]][second]]) {
                      response.results[i][fetch[j]][second] =
                        response.fetched_results[mod2][response.results[i][fetch[j]][second]];
                      break;
                    }
                  }
                }
              }

              break;
            }
          }
        }

      }
    }

    return response;
  }

}

export class AngularFind extends Find {
  private core;
  private url;
  private totalpages;
  
  constructor(model: string, core: SbxCoreService, isFind: boolean) {
    super(model, isFind, SbxCoreService.environment.domain);
    this.core = core;
    this.totalpages = 1;
    this.url = this.isFind ? this.core.$p(this.core.urls.find) : this.core.$p(this.core.urls.delete);
  }
  
  /**
   * @param {Array} toFetch Optional params to auto map fetches result.
   */
  
  public then(toFetch = []) {
    return this.thenRx(toFetch).toPromise();
  }

  /**
   * @param {Array} toFetch Optional params to auto map fetches result.
   */
  
  public thenRx(toFetch = []): Observable<any> {
    const option = {headers: this.core.getHeadersJSON() };
    return this.core.httpClient.post(this.url, this.query.compile(), option).map(res => {
      if(toFetch.length) {
        return this.mapFetchesResult(res, toFetch);
      }
      return res;
    }).map(res => res as any);
  }
  
  private find(query?: any) {
    const option = {headers: this.core.getHeadersJSON() };
    return this.core.httpClient.post(this.core.$p(this.core.urls.find),
      (query == null) ? this.query.compile() : query, option).map(res => res as any);
  }
  
  public loadAll () {
    return this.loadAllRx().toPromise()
  }

  public loadAllRx () {
    if (this.isFind) {
      this.setPageSize(100);
      const query = this.query.compile();
      return this.thenRx().mergeMap(response => {
          this.totalpages = response.total_pages;
          let i = 2;
          const temp = [Observable.of(response)];
          while (i <= this.totalpages) {
            const queryAux = JSON.parse(JSON.stringify(query));
            queryAux.page = i;
            temp.push(this.find(queryAux));
            i = i + 1;
          }
          return Observable.forkJoin.apply(null, temp);
        })
        .map(res => res as any)
        .map((results) => {
          let result = [];
          const fetched_results = {};
          results.forEach(array => {
            const v = array as any;
            result = result.concat(v.results);
            if (v.fetched_results) {
              const objs = Object.keys(v.fetched_results);
              for (let i = 0; i < objs.length; i++) {
                const type_name =  objs[i];
                if (!fetched_results.hasOwnProperty(type_name)) {
                  fetched_results[type_name] = {};
                }
                const keys = Object.keys(v.fetched_results[type_name]);
                for (let j = 0; j < keys.length; j++) {
                  const key = keys[j];
                  if (v.fetched_results[type_name].hasOwnProperty(key)) {
                    fetched_results[type_name][key] = v.fetched_results[type_name][key];
                  }
                }
              }
            }
          });
          return {success: true, results: result, fetched_results: fetched_results};
        });
    }else {
      return this.thenRx();
    }
  }
}

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
