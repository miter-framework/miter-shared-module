import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/catch';
import cloneDeep = require('lodash.clonedeep');

import { DEFAULT_PER_PAGE, SearchResults } from '../util/search-results';
import { HTTP_STATUS_OK } from '../util/http-status-type';
import { pluralize } from '../util/pluralize';

export type FromJsonFn<T> = { (json: any): T | null };

@Injectable()
export abstract class CrudService<T> {
    constructor(private _http: Http, private modelName: string, private fromJson: FromJsonFn<T>, protected readonly singularPath?: string, protected readonly pluralPath?: string) {
        let parts = this.splitOnWords(modelName).filter(Boolean);
        if (!parts || !parts.length) throw new Error('Could not create CRUD service. Invalid model name!');
        if (!this.singularPath) {
            parts[parts.length - 1] = pluralize(parts[parts.length - 1], false);
            this.singularPath = parts.map(pt => pt.toLowerCase()).join('-');
        }
        if (!this.pluralPath) {
            parts[parts.length - 1] = pluralize(parts[parts.length - 1]);
            this.pluralPath = parts.map(pt => pt.toLowerCase()).join('-');
        }
    }
    
    protected transformRoute(url: string, otherParams: { [key: string]: any }): string {
        let keys = Object.keys(otherParams);
        for (let q = 0; q < keys.length; q++) {
            let key = keys[q];
            const regex = new RegExp(`:${key}`)
            let matches = url.match(regex);
            if (matches != null && matches.length) {
                let val = otherParams[key];
                if (val.id) val = val.id;
                delete otherParams[key];
                url = url.replace(regex, `${val}`);
            }
        }
        return url;
    }
    
    abstract get basePath(): string;
    
    protected get http() {
        return this._http;
    }
    
    create(data: any, otherParams: { [key: string]: any } = {}): Observable<T> {
        let url = this.transformRoute(`${this.basePath}${this.pluralPath}/create`, otherParams);
        let params = new URLSearchParams();
        for (let key in otherParams) {
            let value = otherParams[key];
            params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return this.http.post(url, data, { search: params })
          .map(response => {
              let result = this.fromJson(response.json());
              if (!result) throw new Error(`Failed to deserialize ${this.modelName} after creating it.`);
              return result;
          })
          .share();
    }
    
    find(query: Object, page: number = 0, perPage: number = DEFAULT_PER_PAGE, otherParams: { [key: string]: any } = {}): Observable<SearchResults<T>> {
        let url = this.transformRoute(`${this.basePath}${this.pluralPath}/find`, otherParams);
        let params = new URLSearchParams();
        query = cloneDeep(query);
        delete (<any>query)['requestingUser'];
        params.set('query', JSON.stringify(query));
        params.set('page', `${page}`);
        params.set('perPage', `${perPage}`);
        for (let key in otherParams) {
            let value = otherParams[key];
            params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return this.http.get(url, { search: params })
          .map(response => SearchResults.fromJson(response.json(), this.fromJson, query))
          .share();
    }
    
    get(id: number, otherParams: { [key: string]: any } = {}): Observable<T | null> {
        let url = this.transformRoute(`${this.basePath}${this.singularPath}/${id}`, otherParams);
        let params = new URLSearchParams();
        for (let key in otherParams) {
            let value = otherParams[key];
            params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return this.http.get(url, { search: params })
          .map(response => this.fromJson(response.json()))
          .share();
    }

    count(query: Object, otherParams: { [key: string]: any } = {}): Observable<number> {
        let url = this.transformRoute(`${this.basePath}${this.pluralPath}/count`, otherParams);
        let params = new URLSearchParams();
        query = cloneDeep(query);
        delete (<any>query)['requestingUser'];
        params.set('query', JSON.stringify(query));
        for (let key in otherParams) {
            let value = otherParams[key];
            params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return this.http.get(url, { search: params })
          .map(response => parseInt(response.text()))
          .share();
    }
    
    update(id: number, data: any, returning: boolean = false, otherParams: { [key: string]: any } = {}): Observable<T> {
        let url = this.transformRoute(`${this.basePath}${this.singularPath}/${id}`, otherParams);
        let params = new URLSearchParams();
        params.set('returning', `${!!returning}`);
        for (let key in otherParams) {
            let value = otherParams[key];
            params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return this.http.put(url, data, { search: params })
          .map(response => {
              if (returning) {
                  let result = this.fromJson(response.json());
                  if (!result) throw new Error(`Failed to deserialize ${this.modelName} after updating it`);
                  return result;
              }
              else
                  return null;
          })
          .share();
    }
    
    destroy(id: number, otherParams: { [key: string]: any } = {}): Observable<boolean> {
        let url = this.transformRoute(`${this.basePath}${this.singularPath}/${id}`, otherParams);
        let params = new URLSearchParams();
        for (let key in otherParams) {
            let value = otherParams[key];
            params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return this.http.delete(url, { search: params })
          .map(response => response.status === HTTP_STATUS_OK)
          .catch(err => Observable.of(false))
          .share();
    }
    
    private splitOnWords(name: string): string[] {
        let currentWord = '';
        let results: string[] = [];
        for (let q = 0; q < name.length; q++) {
            let chr = name[q];
            if (chr.match(/[A-Z]/)) {
                if (currentWord) results.push(currentWord);
                currentWord = chr;
            }
            else if (chr == '_') {
                if (currentWord) results.push(currentWord);
                currentWord = '';
            }
            else currentWord += chr;
        }
        if (currentWord) results.push(currentWord);
        return results;
    }
}
