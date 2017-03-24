import { NgModule, ModuleWithProviders } from '@angular/core';

//Declarations
import { PluralizePipe } from './pipes/pluralize';

//Imports
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

export const module_exports = [PluralizePipe];
const imported_modules = [RouterModule, CommonModule, FormsModule, HttpModule];
export const exported_modules = [...imported_modules];

@NgModule({
    declarations: [...module_exports],
    imports: [...imported_modules],
    exports: [...module_exports, ...exported_modules]
})
export class MiterSharedModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: MiterSharedModule };
    }
}
