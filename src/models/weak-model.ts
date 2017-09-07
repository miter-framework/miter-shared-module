

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
            
            this._createdAt = json.createdAt ? new Date(json.createdAt) : null;
            this._updatedAt = json.updatedAt ? new Date(json.updatedAt) : null;
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
    
    private _createdAt: Date | null;
    private _updatedAt: Date | null;
    
    get createdAt(): Date | null {
        return this._createdAt;
    }
    get updatedAt(): Date | null {
        return this._updatedAt;
    }
    
    toJson(): any {
        return this.toJSON();
    }
    private toJSON(): any {
        if (this._weakRef) return this._id;
        
        let obj: any = {};
        obj.id = this._id;
        this.serialize(obj);
        //Note: deliberately not allowing the user to modify createdAt or updatedAt.
        //That should be handled on the server
        return obj;
    }
}
