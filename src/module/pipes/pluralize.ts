import { Pipe, PipeTransform } from '@angular/core';

import { pluralize } from '../../util/pluralize';

@Pipe({
    name: 'pluralize'
})
export class PluralizePipe implements PipeTransform {
    transform(name: string, count: number = 2, emitCount: boolean = false) {
        if (!name) return (emitCount ? `${count}` : name);
        if (typeof name !== 'string') throw new TypeError(`PluralizePipe expects a string`);
        return (emitCount ? `${count} ` : '') + pluralize(name, count != 1);
    }
}
