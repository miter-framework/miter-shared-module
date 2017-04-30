import { Http, URLSearchParams, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import merge = require('lodash.merge');

import { cache } from '../util/cache';
import { HTTP_STATUS_OK } from '../util/http-status-type';
import { pluralize } from '../util/pluralize';
import { Result } from '../util/result';
import { DEFAULT_PER_PAGE, SearchResults } from '../util/search-results';

export type FromJsonFn<T> = { (json: any): T | null };

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
    
    abstract get basePath(): string;
    
    protected get http() {
        return this._http;
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
    
    create(data: any, otherParams: { [key: string]: any } = {}): Observable<Result<T>> {
        let params = merge({}, otherParams);
        return cache(this.performPost(`${this.basePath}${this.pluralPath}/create`, data, params)
          .map(response => {
              let result = this.fromJson(response.json());
              if (!result) throw new Error(`Failed to deserialize ${this.modelName} after creating it.`);
              return { result: result };
          }));
    }
    
    find(query: Object, page: number = 0, perPage: number = DEFAULT_PER_PAGE, otherParams: { [key: string]: any } = {}): Observable<SearchResults<T>> {
        let params = merge({}, otherParams, { query: this.transformQuery(query), page: page, perPage: perPage });
        return cache(this.performGet(`${this.basePath}${this.pluralPath}/find`, params)
          .map(response => SearchResults.fromJson(response.json(), this.fromJson, query)));
    }
    findOne(query: Object, otherParams: { [key: string]: any } = {}): Observable<Result<T>> {
        let params = merge({}, otherParams, { query: this.transformQuery(query) });
        return cache(this.performGet(`${this.basePath}${this.pluralPath}/find-one`, params)
          .map(response => ({ result: this.fromJson(response.json()) })));
    }
    get(id: number, otherParams: { [key: string]: any } = {}): Observable<Result<T>> {
        let params = merge({}, otherParams, { id: id });
        return cache(this.performGet(`${this.basePath}${this.singularPath}/:id`, params)
          .map(response => ({ result: this.fromJson(response.json()) })));
    }
    count(query: Object, otherParams: { [key: string]: any } = {}): Observable<number> {
        let params = merge({}, otherParams, { query: this.transformQuery(query) });
        return cache(this.performGet(`${this.basePath}${this.pluralPath}/count`, params)
          .map(response => parseInt(response.text())));
    }
    
    update(id: number, data: any, returning: boolean = false, otherParams: { [key: string]: any } = {}): Observable<Result<T>> {
        let params = merge({}, otherParams, { id: id, returning: !!returning });
        return cache(this.performPut(`${this.basePath}${this.singularPath}/:id`, data, params)
          .map(response => {
              if (!returning) return null;
              let result = this.fromJson(response.json());
              if (!result) throw new Error(`Failed to deserialize ${this.modelName} after updating it`);
              return { result: result };
          }));
    }
    
    destroy(id: number, otherParams: { [key: string]: any } = {}): Observable<boolean> {
        let params = merge({}, otherParams, { id: id });
        return cache(this.performDelete(`${this.basePath}${this.singularPath}/:id`, params)
          .map(response => response.status === HTTP_STATUS_OK)
          .catch(err => Observable.of(false)));
    }
    
    protected performPost(origUrl: string, data: any, origParams: { [key: string]: any } = {}): Observable<Response> {
        let [url, params] = this.transformParams(origUrl, origParams);
        return this.http.post(url, data, { search: params });
    }
    protected performPut(origUrl: string, data: any, origParams: { [key: string]: any } = {}): Observable<Response> {
        let [url, params] = this.transformParams(origUrl, origParams);
        return this.http.put(url, data, { search: params });
    }
    protected performGet(origUrl: string, origParams: { [key: string]: any } = {}): Observable<Response> {
        let [url, params] = this.transformParams(origUrl, origParams);
        return this.http.get(url, { search: params });
    }
    protected performDelete(origUrl: string, origParams: { [key: string]: any } = {}): Observable<Response> {
        let [url, params] = this.transformParams(origUrl, origParams);
        return this.http.delete(url, { search: params });
    }
    
    private transformParams(origUrl: string, origParams: { [key: string]: any } = {}): [string, Object] {
        let url = this.transformRoute(origUrl, origParams);
        let params = new URLSearchParams();
        for (let key in origParams) {
            let value = origParams[key];
            let serializedValue = this.serializeValue(value, true);
            if (serializedValue === null || typeof serializedValue === 'undefined') continue;
            params.set(key, serializedValue);
        }
        return [url, params];
    }
    
    protected transformRoute(url: string, otherParams: { [key: string]: any }): string {
        let keys = Object.keys(otherParams);
        for (let q = 0; q < keys.length; q++) {
            let key = keys[q];
            const regex = new RegExp(`:${key}`)
            let matches = url.match(regex);
            if (matches != null && matches.length) {
                let val = otherParams[key];
                delete otherParams[key];
                url = url.replace(regex, `${this.serializeValue(val)}`);
            }
        }
        return url;
    }
    protected serializeValue(value: any, stringify: boolean = false) {
        let isSerialized = !value || typeof value === 'string' || typeof value === 'number';
        if (isSerialized) return value;
        
        let isModel = value.id && typeof value.id === 'number';
        if (isModel) return value.id;
        
        return stringify ? JSON.stringify(value) : value;
    }
    
    protected transformQuery(oldQuery: any): string {
        let query = merge({}, oldQuery);
        let keys = Object.keys(query);
        for (let key of keys) {
            let value = query[key];
            let serializedValue = this.serializeValue(value, false);
            if (serializedValue === null || typeof serializedValue === 'undefined' || key === 'requestingUser') delete query[key];
            else query[key] = serializedValue;
        }
        return JSON.stringify(query);
    }
}
