

export const DEFAULT_PER_PAGE = 10;

export class SearchResults<T> {
    constructor(public results: T[], private _query: Object, public page: number = 0, public perPage: number = 0, public total: number = 0) {
        if (this.total == 0) this.total = this.count;
        if (!this.perPage || this.perPage < 0) this.perPage = Math.max(DEFAULT_PER_PAGE, this.count);
    }
    
    get query() {
        return this._query;
    }
    
    get count(): number {
        return this.results.length;
    }
    get length(): number {
        return this.results.length;
    }
    
    static fromJson<T>(json: any, fromJson: (json: any) => T | null, query: Object): SearchResults<T> {
        let page: number = json.page || 0;
        let perPage: number = json.perPage || 0;
        let total: number = json.total || 0;
        
        let results: T[] = [];
        let resultArr: any[] = json.results || json.data || json;
        if (typeof(resultArr.length) === 'undefined' || !resultArr.length) resultArr = [];
        for (let idx in resultArr) {
            let t: T | null = fromJson(resultArr[idx]);
            if (!t) throw new Error(`Failed to create SearchResults, could not parse json for one of the results`);
            results.push(t);
        }
        
        return new SearchResults<T>(results, query, page, perPage, total);
    }
}
