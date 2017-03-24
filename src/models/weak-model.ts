

export abstract class WeakModel {
    constructor(json: any) {
        if (json === null) throw new Error(`Can't create a model from null!`);
        json = json || {};
        if (typeof(json) == 'number') {
            this._id = json;
            this._weakRef = true;
        }
        else {
            this._id = json.id;
            this.deserialize(json);
        }
    }
    
    protected abstract deserialize(json: any): void;
    protected abstract serialize(json: any): void;
    
    private _id: number;
    private _weakRef: boolean = false;
    
    get id(): number {
        return this._id;
    }
    get isWeak(): boolean {
        return this._weakRef;
    }
    get isStrong(): boolean {
        return !this._weakRef;
    }
    
    toJson(): any {
        return this.toJSON();
    }
    private toJSON(): any {
        if (this._weakRef) return this._id;
        
        let obj: any = {};
        obj.id = this._id;
        this.serialize(obj);
        return obj;
    }
}
