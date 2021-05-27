import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Bug } from './../../model/bug.model';
import { BugService } from './../../service/bug.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-update-bug',
  templateUrl: './update-bug.component.html',
  styleUrls: ['./update-bug.component.scss'],
})
export class UpdateBugComponent implements OnInit {

  myForm: FormGroup;
  bug = new Bug();
  submitted = false;
  bugComments: [{
    id: string,
    reporter: string,
    description: string
  }]
  id: number;

  reporters = ['QA', 'PO', 'DEV']
  statuses = ['Ready for testing', 'Done', 'Rejected']

  //BugService used for communicating with Back End (Calling APIs), ActivatedRoute used for getting the id of current bug 
  //and Router to navigate, specifically to go back to Bug List, FormBuilder to declare forms and list form control's validators, 
  //SnackBar for notifications on submit form
  constructor(private route: ActivatedRoute, private router: Router,
    private bugService: BugService, private fb: FormBuilder, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    // Get id of current bug 
    this.id = this.route.snapshot.params['id'];
    // Call getBugsById Api from Bug Service and patch values in myForm
    this.bugService.getBugsById(this.id)
      .subscribe(data => {
        this.bug = data;
        this.myForm.patchValue({
          title: this.bug['title'],
          description: this.bug['description'],
          priority: this.bug['priority'],
          reporter: this.bug['reporter'],
          status: this.bug['status'],
          updatedAt: this.bug['updatedAt'],
          createdAt: this.bug['createdAt']
        })
        //If bug returned from API has comments, give that value to bugComments
        if (this.bug['comments']) {
          this.bugComments = this.bug['comments']
        }
      }, error => console.log(error));

    //group method from FormBuilder used to construct a new FormGroup instance and FormControls
    //Standard required validator for considering empty value as not valid
    this.myForm = this.fb.group({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      priority: new FormControl("", Validators.required),
      reporter: new FormControl("", Validators.required),
      status: new FormControl(Validators.required),
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
  //If there is not any comment, it creates an array of objects (bugComments) else an object (newBugComment), then adds newBugComment in bugComments
  addNewComment() {
    if (this.bugComments === undefined) {
      this.bugComments = [{
        id: "",
        reporter: "",
        description: ""
      }]
    }
    else if (this.bugComments != undefined) {
      let newBugComment = {
        id: '',
        reporter: '',
        description: ''
      }
      this.bugComments.push(newBugComment)
    }
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

  //List function is triggered when Back to Bugs button is clicked which is used for navigation to Bug List page 
  list() {
    this.router.navigate(['/']);
  }

  //On Submit Update function is triggered when form is submitted, values of the form are stored in update variable, 
  //comments are stored in bugComments, update date will get now date and format as it is in API
  //If form and comments are valid then a bug will be updated by calling updateBug Api from Bug Service 
  //Snackbar is used for handling notifications
  onSubmitUpdate() {
    this.submitted = true;
    let update = this.myForm.value
    update.comments = this.bugComments
    update.updatedAt = new Date().toISOString();
    if (this.myForm.valid && this.commentValidation(update.comments)) {
      this.bugService.updateBug(this.id, update)
        .subscribe(data =>
          this._snackBar.open("Updated successfully", "Close", { duration: 2000 }),
          error => this._snackBar.open("Error:" + error, "Close", { duration: 2000 }));
      this.submitted = false
    }
    else {
      this._snackBar.open("Fill the data", "Close", { duration: 2000 })
    }
  }

}
