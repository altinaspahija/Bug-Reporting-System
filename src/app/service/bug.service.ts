import { Bug } from './../model/bug.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class BugService {
  bug: Bug;

  constructor(private http: HttpClient) { }
  baseUrl: string = 'https://bug-report-system-server.herokuapp.com/bugs';

  //Get by default 10 bugs
  //Observable used by http module to handle requests and responses
  getBugs(): Observable<Bug> {
    return this.http.get<Bug>(`${this.baseUrl}`);
  }

  //Get all bugs
  getAllBugs(): Observable<Bug> {
    return this.http.get<Bug>(`${this.baseUrl}/?&page=0&size=*`);
  }

  //Get bugs by id parameter - get http request method 
  getBugsById(id: number): Observable<Bug> {
    return this.http.get<Bug>(`${this.baseUrl}/${id}`);
  }

  //Create bug - post http request method
  createBug(bug: Bug): Observable<Bug> {
    return this.http.post<Bug>(this.baseUrl, bug);
  }

  //Update bug by id parameter - put http request method
  updateBug(id: number, bug: Bug): Observable<Bug> {
    return this.http.put<Bug>(`${this.baseUrl}/${id}`, bug);
  }

  //Delete bug by id parameter - delete http request method
  deleteBug(id: number): Observable<Bug> {
    return this.http.delete<Bug>(`${this.baseUrl}/${id}`);
  }

  //Sort bugs by considering (getting) all bugs divided in pages that have number of bugs and sort by selected property (criteria) and order (ascending or descdending)
  sortBug(pageNumber, itemsPerPage, property, order): Observable<Bug> {
    return this.http.get<Bug>(`${this.baseUrl}?&page=${pageNumber}&size=${itemsPerPage}&sort=${property},${order}`);
  }

  //Pagination through pages with divided items in pages
  paginateBugs(pageNumber, itemsPerPage): Observable<Bug> {
    return this.http.get<Bug>(`${this.baseUrl}/?&page=${pageNumber}&size=${itemsPerPage}`);
  }

  //Search bugs by adding selected options as parameters in baseUrl and calling that baseUrl API 
  advancedSearchBug(property, value): Observable<Bug> {

    let searchUrl = this.baseUrl + "?";

    for (let i = 0; i < property.length; i++) {
      if (i == 0) {
        searchUrl = searchUrl + property[i] + "=" + value[i]
      }
      if (i > 0) {
        searchUrl = searchUrl + "&" + property[i] + "=" + value[i]
      }
    }
    return this.http.get<Bug>(`${searchUrl}`);
  }

}
