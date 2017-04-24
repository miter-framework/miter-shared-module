import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export function cache<T>(oldObservable: Observable<T>): Observable<T> {
    let rsubj: ReplaySubject<T> | null = null;
    return Observable.create((observer: Observer<T>) => {
        if (!rsubj) {
            rsubj = new ReplaySubject<T>(1);
            oldObservable.subscribe(rsubj);
        }
        
        let subscription = rsubj.subscribe(observer);
        return () => subscription.unsubscribe();
    });
}
