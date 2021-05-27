import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { BugService } from 'src/app/service/bug.service';
import { Bug } from '../../model/bug.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { title } from 'process';


@Component({
  selector: 'app-bugs-list',
  templateUrl: './bugs-list.component.html',
  styleUrls: ['./bugs-list.component.scss']
})
export class BugsListComponent implements OnInit {

  myForm: FormGroup;
  submitted = false;
  collapse = false;
  bug: any;

  //Set sort clicks for each of header items in the table in one array and set each item of the array to false which means not clicked
  sortClicked = new Array(5).fill(false);

  //Definition of variables used for sorting
  sort: string = ''
  lastSorted: string = ''

  //Definition of variables used for filter (search)
  filterPropertyArray = new Array;
  fitlerValueArray = new Array;
  searchValue: string;
  filterBy: string;
  filterValue: string;
  priorityFilter = new Array;
  reporterFilter = new Array;
  statusFilter = new Array;

  //Definition of variables used for pagination
  numberPage: number;
  itemsPerPage: number = 5;
  actualPage: number = 0;
  dataPerPage;

  //BugService used for communicating with Back End (Calling APIs), FormBuilder to declare forms and list form control's validators and 
  //Router to navigate, specifically to go to Update Bug page
  constructor(private bugService: BugService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {

    //Call function getBugs that get all bugs
    this.getBugs()

    //group method from FormBuilder used to construct a new FormGroup instance and FormControls
    this.myForm = this.fb.group({
      search: new FormControl(""),
      filterStatus: new FormControl(""),
      filterPriority: new FormControl(""),
      filterReporter: new FormControl("")
    })

    //Value Changes event raised when the value of search, filterStatus, filterPriority, filterReporter from the form changes
    //filterPropertyArray stores properties while fitlerValueArray stores values that advancedSearchBug function in service uses as parameters
    //if specific property on the form is selected it gets and finds the selected option index and if it is unselected it removes it
    this.myForm.get('search').valueChanges.subscribe(searchValue => {

      if (searchValue) {
        this.searchValue = searchValue
        if (this.filterPropertyArray.find(element => element == "title")) {
          this.fitlerValueArray[this.findIndexInArray('title')] = this.myForm.get('search').value
        }
        else {
          this.filterPropertyArray.push('title')
          this.fitlerValueArray.push(this.myForm.get('search').value)
        }
      }
      else {
        this.filterPropertyArray.splice(this.findIndexInArray('title'), 1)
        this.fitlerValueArray.splice(this.findIndexInArray('title'), 1)
      }
      this.bugService.advancedSearchBug(this.filterPropertyArray, this.fitlerValueArray).subscribe(data => {
        this.bug = data;
      })

    });

    this.myForm.get('filterStatus').valueChanges.subscribe(searchValue => {

      if (this.myForm.get('filterStatus').value) {
        if (this.filterPropertyArray.find(element => element == "status")) {
          this.fitlerValueArray[this.findIndexInArray('status')] = this.myForm.get('filterStatus').value
        }
        else {
          this.filterPropertyArray.push('status')
          this.fitlerValueArray.push(this.myForm.get('filterStatus').value.replaceAll(" ", "+"))
        }
      }
      else {
        this.filterPropertyArray.splice(this.findIndexInArray('status'), 1)
        this.fitlerValueArray.splice(this.findIndexInArray('status'), 1)
      }
      this.bugService.advancedSearchBug(this.filterPropertyArray, this.fitlerValueArray).subscribe(data => {
        this.bug = data;
      })

    });

    this.myForm.get('filterPriority').valueChanges.subscribe(searchValue => {

      if (this.myForm.get('filterPriority').value) {
        if (this.filterPropertyArray.find(element => element == "priority")) {
          this.fitlerValueArray[this.findIndexInArray('priority')] = this.reversePriority(this.myForm.get('filterPriority').value)
        }
        else {
          this.filterPropertyArray.push('priority')
          this.fitlerValueArray.push(this.reversePriority(this.myForm.get('filterPriority').value))
        }
      }
      else {
        this.filterPropertyArray.splice(this.findIndexInArray('priority'), 1)
        this.fitlerValueArray.splice(this.findIndexInArray('priority'), 1)
      }
      this.bugService.advancedSearchBug(this.filterPropertyArray, this.fitlerValueArray).subscribe(data => {
        this.bug = data;
      })
    });

    this.myForm.get('filterReporter').valueChanges.subscribe(searchValue => {


      if (this.myForm.get('filterReporter').value) {
        if (this.filterPropertyArray.find(element => element == "reporter")) {
          this.fitlerValueArray[this.findIndexInArray('reporter')] = this.myForm.get('filterReporter').value
        }
        else {
          this.filterPropertyArray.push('reporter')
          this.fitlerValueArray.push(this.myForm.get('filterReporter').value)
        }
      }
      else {
        this.filterPropertyArray.splice(this.findIndexInArray('reporter'), 1)
        this.fitlerValueArray.splice(this.findIndexInArray('reporter'), 1)
      }
      this.bugService.advancedSearchBug(this.filterPropertyArray, this.fitlerValueArray).subscribe(data => {
        this.bug = data;
      })
    });

  }

  //Get all bugs by calling getAllBugs API from service, stores each property's values in arrays and by pagination method divides bug items in pages
  getBugs() {
    this.bugService.getAllBugs().subscribe(data => {
      this.bug = data;

      this.reporterFilter = Array.from(new Set(this.bug.map(item => item.reporter)))
      this.priorityFilter = Array.from(new Set(this.bug.map(item => item.priority)))
      this.priorityFilter.forEach((val, index) => this.priorityFilter[index] = this.checkPriority(val))
      this.priorityFilter = Array.from(new Set(this.priorityFilter.map(item => item)))
      this.statusFilter = Array.from(new Set(this.bug.map(item => item.status))).filter(Boolean)

      this.pagination()
      this.bugService.paginateBugs(0, this.itemsPerPage).subscribe(data => {
        this.bug = data
      });
    });
  }

  //Delete bug function is triggered when delete button is clicked and it calls deteleBug API from service to delete specific bug based on id
  deleteBug(id: number) {
    this.bugService.deleteBug(id)
      .subscribe(
        data => { this.selectPage(this.actualPage) },
        error => console.log(error));
  }

  //Update bug function is triggered when update button is clicked and by using router, navigates to updateBug and adds id of bug in URL 
  updateBug(id: number) {
    this.router.navigate(['updateBug', id]);
  }

  //Pagination function finds number of pages by getting total number of bugs and dividing them with items of bugs per page
  //ceil method from Math is used to return the smallest integer value that is greater than or equal to that number found
  pagination() {
    this.numberPage = Math.ceil(this.bug.length / this.itemsPerPage)
    this.dataPerPage = new Array(this.numberPage)
  }

  //Sort Bug function is triggered when sort icon is clicked that takes clicked property and index as parameter
  //Based on selected sort icon on item it sorts bugs by calling sortBug API in service 
  sortBug(value, i) {

    this.sortClicked = this.sortClicked.map((val, index) => index === i ? val : false);
    this.lastSorted = value

    if (this.sortClicked[i]) {
      this.bugService.sortBug(this.actualPage, this.itemsPerPage, value, "desc").subscribe(data => {
        this.bug = data;
      })
      this.sort = "desc";
    }
    else if (!this.sortClicked[i]) {
      this.bugService.sortBug(this.actualPage, this.itemsPerPage, value, "asc").subscribe(data => {
        this.bug = data;
      })
      this.sort = "asc"
    }
  }

  //Select Page function is triggered when pagination item is clicked where is looks if any sort icon on items is clicked to call sortBug API in service
  //otherwise it calls paginateBugs API in service
  selectPage(value) {
    this.actualPage = value
    if (this.isSortSelected() || Boolean(this.sort)) {
      this.bugService.sortBug(this.actualPage, this.itemsPerPage, this.lastSorted, this.sort).subscribe(data => {
        this.bug = data;
      })
    }
    else {
      this.bugService.paginateBugs(value, this.itemsPerPage).subscribe(data => {
        this.bug = data
      })
    }
  }

  //CheckPriority function gives specific string description based on integer values
  checkPriority(value: any) {
    if (value == "0" || value == "1") {
      return "Minor"
    }
    else if (value == "2") {
      return "Major"
    }
    else {
      return "Critical"
    }
  }

  //ReversePriority function gives specifc integer value based on string descriptions
  reversePriority(value: string) {
    if (value == "Minor") {
      return "1"
    }
    else if (value == "Major") {
      return "2"
    }
    else if (value == "Critical") {
      return "3"
    }
  }

  //Clears all filters and takes you to the first page
  clearFilters() {
    this.myForm.get('search').reset()
    this.searchValue="";
    this.myForm.get('filterPriority').reset()
    this.myForm.get('filterStatus').reset()
    this.myForm.get('filterReporter').reset()
    this.actualPage = 0;
  }

  //Finds index of the property 
  findIndexInArray(value: string) {
    return this.filterPropertyArray.findIndex(element => element == value)
  }

  //Checks if sort icon on items is clicked or not
  isSortSelected() {
    return this.sortClicked.some(element => {
      return Boolean(element == true)
    })
  }

}
