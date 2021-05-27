import { Bug } from './../../model/bug.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BugService } from '../../service/bug.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-create-bug',
  templateUrl: './create-bug.component.html',
  styleUrls: ['./create-bug.component.scss']
})
export class CreateBugComponent implements OnInit {

  bug = new Bug();
  submitted = false;
  myForm: FormGroup;
  id: number;
  createdAt = new Date().toISOString();
  bugComments = []

  reporters = ['QA', 'PO', 'DEV']
  statuses = ['Ready for testing', 'Done', 'Rejected']

  //BugService used for communicating with Back End (Calling APIs), FormBuilder to declare forms and list form control's validators and SnackBar for notifications on submit form
  constructor(private bugService: BugService, private fb: FormBuilder, private _snackBar: MatSnackBar) { }
  ngOnInit(): void {

    //group method from FormBuilder used to construct a new FormGroup instance and FormControls
    //Standard required validator for considering empty value as not valid
    this.myForm = this.fb.group({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      priority: new FormControl("", Validators.required),
      reporter: new FormControl("", Validators.required),
      status: new FormControl("")
    })


    //Value Changes event raised when the value of reporter from the form changes that returns an observable so we can subscribe to it
    //If value of reporter in the form is QA then it makes status value in the form required by the method setValidators else it does not by clearValidators method
    //Then by updateValueAndValidity recalculates the value and validation status
    this.myForm.get('reporter').valueChanges.subscribe(value => {
      const status = this.myForm.get('status');
      if (value === 'QA') {
        status.setValidators(Validators.required);
      } else {
        status.clearValidators();
      }
      status.updateValueAndValidity();
    });
  }

  //Add new comment function is triggered when Add new comment button is clicked
  //It creates an object (newBugComment), then adds newBugComment in the array of objects (bugComments)
  addNewComment() {
    let newBugComment = {
      id: '',
      reporter: '',
      description: ''
    }
    this.bugComments.push(newBugComment)
  }

  //Delete Comment is triggered when Delete this comment button is clicked, which deletes the specific comment based on index
  deleteComment(index) {
    this.bugComments.splice(index, 1)
  }

  //Comment Validation function which returns a boolean value, takes one parameter (array of comments received from API), 
  //if array of comments is not empty it pushes to the local array each description of comments and if any description of comments is empty
  //it returns false
  commentValidation(arrayOfObject) {
    let array = new Array();
    let result = true;
    if (arrayOfObject) {
      arrayOfObject.forEach(element => array.push(element['description']))
    }
    if (array) {
      result = array.every(function (e) { return Boolean(e) })
    }
    return result;
  }

  //On Submit Create function is triggered when form is submitted, values of the form are stored in create variable
  //comments are stored in bugComments, create date will get now date and format as it is in API
  //If form and comments are valid then a bug will be created by calling createBug Api from Bug Service 
  //Values in the form will be cleared by reset method, comments as well by setting length to 0
  //Snackbar is used for handling notifications
  onSubmitCreate() {
    this.submitted = true;
    let create = this.myForm.value
    create.comments = this.bugComments
    create.createdAt = this.createdAt
    if (this.myForm.valid && this.commentValidation(create.comments)) {
      this.bugService.createBug(create)
        .subscribe(data =>
          this._snackBar.open("Created successfully", "Close", { duration: 2000 }),
          error => this._snackBar.open("Error:" + error, "Close", { duration: 2000 }));
      this.myForm.reset();
      this.bugComments.length = 0;
      this.submitted = false;
    }
    else {
      this._snackBar.open("Fill the data", "Close", { duration: 2000 })
    }
  }

}

