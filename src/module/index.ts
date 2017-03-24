import { NgModule } from '@angular/core';

//Imports
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

export const module_exports = [];
const imported_modules = [RouterModule, CommonModule, FormsModule, HttpModule];
export const exported_modules = [...imported_modules];

@NgModule({
    declarations: [...module_exports],
    imports: [...imported_modules],
    exports: [...module_exports, ...exported_modules]
})
export class MiterSharedModule {
}
