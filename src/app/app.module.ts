import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CreateBugComponent } from './bugs/create-bug/create-bug.component';
import { BugsListComponent } from './bugs/bugs-list/bugs-list.component';
import { UpdateBugComponent } from './bugs/update-bug/update-bug.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BugService } from './service/bug.service';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    AppComponent,
    CreateBugComponent,
    BugsListComponent,
    UpdateBugComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    FontAwesomeModule,
    MaterialModule
  ],
  providers: [BugService],
  bootstrap: [AppComponent]
})
export class AppModule { }
