import { UpdateBugComponent } from './bugs/update-bug/update-bug.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BugsListComponent } from './bugs/bugs-list/bugs-list.component';
import { CreateBugComponent } from './bugs/create-bug/create-bug.component';

//Definition of routes - paths and corresponding components
const routes: Routes = [
  { path: '', redirectTo: 'bugs', pathMatch: 'full' },
  { path: 'bugs', component: BugsListComponent },
  { path: 'addBug', component: CreateBugComponent },
  { path: 'updateBug/:id', component: UpdateBugComponent}
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }