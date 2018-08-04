import QueryBuilder from 'sbx-querybuilder/index';
import { Find, SbxCore } from 'sbxcorejs';
import axios, {AxiosInstance} from 'axios';
import eachLimit from 'async/eachLimit';

export class SbxCoreService extends SbxCore{

  public static environment = { } as any;
  private headers: any;
  public httpClient: AxiosInstance;

  constructor() {
    super();
  }

  public initialize(domain: number, appKey: string, baseUrl: string = 'https://sbxcloud.com/api') {
    SbxCoreService.environment.domain = domain;
    SbxCoreService.environment.baseUrl = baseUrl;
    SbxCoreService.environment.appKey = appKey;
    this.headers = {'App-Key': SbxCoreService.environment.appKey};

    this.httpClient = axios.create({baseURL: baseUrl, headers: this.headers});
  }
  
  public addHeaderAttr(name: string, value: string): void {
    this.headers[name] = value;
    this.updateHttpHeaders();
  }

  private getHeaders(): any {
    return this.headers;
  }

  public removeHeaderAttr(item: string): any {
    delete this.headers[item];
    this.updateHttpHeaders();
  }

  private updateHttpHeaders() {
    this.httpClient.defaults.headers = this.getHeaders();
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
    const params = { 'token': token };
    return this.httpClient.get(this.$p(this.urls.validate), {params}).then(res => res as any);
  }

  /**
   *
   * @param {string} login
   * @param {string} email
   * @param {string} name
   * @param {string} password
   */
  signUp(login: string, email: string, name: string, password: string) {
    if (this.validateLogin(login) && this.validateEmail(email)) {
      const params = '?email=' + this.encodeEmails(email) + '&password=' +  encodeURIComponent(password) + '&name='
        + name + '&login=' + login + '&domain=' + SbxCoreService.environment.domain.toLocaleString();
      return this.httpClient.get(this.$p(this.urls.register), {params}).then(res => res as any);
    } else {
      return new Promise((resolve) => {
        resolve({success: false, error: 'Login or email contains invalid characters. Letters, numbers and underscore are accepted'});
      });
    }
  }

  /**
   * @param {string} login
   * @param {string} password
   * @param {number} domain
   */
  login(login: string, password: string, domain?: number) {
    if ( (this.validateLogin(login) && login.indexOf('@') < 0) ||  (login.indexOf('@') >= 0 && this.validateEmail(login))) {
      const params = '?login=' + this.encodeEmails(login) + '&password=' + encodeURIComponent(password)
        + (domain ? '&domain=' + domain : '');
      return this.httpClient.get(this.$p(this.urls.login), {params}).then(res => res as any);
    }else {
      return new Promise((resolve) => {
        resolve({success: false, error: 'Login contains invalid characters. Letters, numbers and underscore are accepted'});
      });
    }
  }

  /**
   * Send email to changePassword
   * @param {string} userEmail
   * @param {string} subject
   * @param {string} emailTemplate
   */
  sendPasswordRequest(userEmail: string, subject: string, emailTemplate: string) {
    const body =  {user_email: userEmail,
      domain: SbxCoreService.environment.domain, subject: subject, email_template: emailTemplate};
    return this.httpClient.post(this.$p(this.urls.password), body).then(res => res as any);
  }

  /**
   * change password with email code
   * @param {number} userId
   * @param {number} userCode
   * @param {string} newPassword
   */
  requestChangePassword(userId, userCode, newPassword) {
    const body = {domain: SbxCoreService.environment.domain,
      password: newPassword, user_id: userId, code: userCode};
    return this.httpClient.put(this.$p(this.urls.password), body).then(res => res as any);
  }

  /**
   * change password
   * @param {string} newPassword
   */
  changePassword(newPassword) {
    const params = {'domain': SbxCoreService.environment.domain, 'password': newPassword};
    return this.httpClient.get(this.$p(this.urls.update_password), {params}).then(res => res as any);
  }

  /**
   * DATA
   */

  /**
   * @param {string} model the name model in sbxcloud
   * @param data can be a JSON, or TypeScript Class or Array of both
   */
  insert(model: string, data: any) {
    const body = this.upsert(model, data);
    return this.httpClient.post(this.$p(this.urls.row), body).then(res => res as any);
  }

  /**
   * @param {string} model the name model in sbxcloud
   * @param data can be a JSON, or TypeScript Class or Array of both
   */
  update(model: string, data: any) {
    const body = this.upsert(model, data);
    return this.httpClient.post(this.$p(this.urls.update), body).then(res => res as any);
  }

  /**
   * @param {string} model the name model in sbxcloud
   */
  with(model: string) {
    return new AxiosFind(model, this);
  }

  /**
   * @param {EmailData} data
   */
  sendEmail(data: EmailData) {
    const mail = {
      subject: data.subject,
      to: data.to,
      domain: SbxCore.environment.domain,
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
    return this.httpClient.post(this.$p(this.urls.send_mail), mail).then(res => res as any);
  }

  /**
   * @param data
   */
  paymentCustomer(data: Object) {
    data['domain'] = SbxCore.environment.domain;
    return this.httpClient.post(this.$p(this.urls.payment_customer), data).then(res => res as any);
  }

  /**
   * @param data
   */
  paymentCard(data: Object) {
    data['domain'] = SbxCore.environment.domain;
    return this.httpClient.post(this.$p(this.urls.payment_card), data).then(res => res as any);
  }

  /**
   *
   * @param {string} key
   * @param file
   */
  uploadFile(key: string, file: any) {
    const input = new FormData();
    input.append('file', file);
    input.append('model', JSON.stringify({ key: key}));
    return this.httpClient.post(this.$p(this.urls.uploadFile), input).then(res => res as any);
  }

  /**
   * @param {string} key
   */
  downloadFile(key: string) {
    const params = {action: 'download', key: key };
    return this.httpClient.get(this.$p(this.urls.downloadFile), {params}).then(res => res as any);
  }

  /**
   * CLOUDSCRIPT
   */

  /**
   *
   * @param {string} key
   * @param params
   */
  run(key: string, params: any) {
    const rparams = {key: key, params: params };
    return this.httpClient.post(this.$p(this.urls.cloudscript_run), {params: rparams}).then(res => res as any);
  }

}

export class AxiosFind extends Find {
  private core: SbxCoreService;
  private url;
  private isFind;
  private totalpages;

  constructor(model: string, core: SbxCoreService) {
    super(model, SbxCore.environment.domain);
    this.core = core;
    this.totalpages = 1;
  }

  public delete() {
    this.setUrl(false);
    return this.then();
  }

  /**
   * @param {Array} toFetch Optional params to auto map fetches result.
   * match T object, no return fetched_results
   */

  public find(toFetch = []) {
    this.setUrl(true);
    return this.then(toFetch);
  }

  /**
   * @param {Array} toFetch Optional params to auto map fetches result.
   */

  // public loadAll(toFetch = []) {
  //   this.setPageSize(1000);
  //   const query = this.query.compile();
  //
  //   return this.then().then(mergeMap<any, any>(response => {
  //       this.totalpages = (<any>response).total_pages;
  //       let i = 2;
  //       const temp = [observableOf(response)];
  //       while (i <= this.totalpages) {
  //         const queryAux = JSON.parse(JSON.stringify(query));
  //         queryAux.page = i;
  //         temp.push(this.findPage(queryAux));
  //         i = i + 1;
  //       }
  //       return observableMerge(temp).pipe(mergeAll(5), toArray());
  //     }),
  //     map(results => {
  //       let result = [];
  //       const fetched_results = {};
  //       (<any>results).forEach(array => {
  //         const v = array as any;
  //         result = result.concat(v.results);
  //         if (v.fetched_results) {
  //           const objs = Object.keys(v.fetched_results);
  //           for (let i = 0; i < objs.length; i++) {
  //             const type_name =  objs[i];
  //             if (!fetched_results.hasOwnProperty(type_name)) {
  //               fetched_results[type_name] = {};
  //             }
  //             const keys = Object.keys(v.fetched_results[type_name]);
  //             for (let j = 0; j < keys.length; j++) {
  //               const key = keys[j];
  //               if (v.fetched_results[type_name].hasOwnProperty(key)) {
  //                 fetched_results[type_name][key] = v.fetched_results[type_name][key];
  //               }
  //             }
  //           }
  //           if (toFetch.length) {
  //             result = this.core.mapFetchesResult(result, toFetch);
  //           }
  //         }
  //       });
  //       return {success: true, results: result, fetched_results: fetched_results};
  //     }));
  // }

  /**
   * Change the url, to find or to delete
   * @param isFind if true, the url is gotten from urls.find else urls.delete
   */
  private setUrl(isFind) {
    this.isFind = isFind;
    this.url = isFind ? this.core.$p(this.core.urls.find) : this.core.$p(this.core.urls.delete);
  }


  /**
   * get the data
   * @param {any[]} toFetch Optional params to auto map fetches result.
   */
  private then(toFetch = []) {
    return this.core.httpClient.post(this.url, this.query.compile()).then(res => res as any).then(res => {
      if (res.success) {
        if (toFetch.length && this.isFind) {
          return this.core.mapFetchesResult(res, toFetch);
        }
        return res;
      }else {
        throw new Error(res.message);
      }
    });
  }

  /**
   * Is used to paginate load all
   * @param query
   */
  private findPage(query?: any) {
    return this.core.httpClient.post(this.core.$p(this.core.urls.find), query ? query : this.query.compile() );
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