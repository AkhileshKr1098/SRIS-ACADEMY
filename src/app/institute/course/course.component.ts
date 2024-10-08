import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddEditCourseComponent } from '../add-edit-course/add-edit-course.component';
import { ManageService } from 'src/app/manage.service';
import { NgToastService } from 'ng-angular-popup';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import { ThemePalette } from '@angular/material/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  displayedColumns: string[] = ['course_id', 'course_name', 'course_duration', 'course_total_fee', 'course_half_fee', 'course_quarter_fee', 'course_monthly_fee', 'course_admission_fee', 'course_description', 'course_date', 'action'];
  dataSource = new MatTableDataSource();
  count_course: number = 0;
  inst_id_for_admin: any
  inst_id_for_inst_login: any
  inst_id_for_std: any
  inst_id: any;
  std_id: any
  action_btn: boolean = false
  Course: string = "Course Details"
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tabledata: any;
  month: string = 'Month'
  login_deatils: any
  login: any
  deletevalue: any = 1
  color: ThemePalette = 'primary'


  constructor(
    private dailog: MatDialog,
    private router: Router,
    private service: ManageService,
    private popup: NgToastService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    const institute_data = this.router.getCurrentNavigation();
    this.inst_id_for_admin = institute_data?.extras
    console.log("admin" + this.inst_id_for_admin)
    this.login_deatils = localStorage.getItem('Token')
    this.login = JSON.parse(this.login_deatils)

    this.inst_id_for_std = this.login.institute_id_fk

    this.inst_id_for_inst_login = this.login.inst_id

  }

  ngOnInit(): void {
    if (this.inst_id_for_admin) {
      this.get_course_by_inst_id(this.inst_id_for_admin);
    }
    if (this.inst_id_for_inst_login) {
      this.get_course_by_inst_id(this.inst_id_for_inst_login)
    }
    if (this.inst_id_for_std) {
      this.action_btn = true
      this.displayedColumns = ['course_id', 'course_name', 'course_duration', 'course_total_fee', 'course_half_fee', 'course_quarter_fee', 'course_monthly_fee', 'course_admission_fee', 'course_description', 'course_date'];
      const instformdata = new FormData()
      instformdata.append('inst_id', this.inst_id_for_std)
      this.service.get_course_for_std(instformdata).subscribe(
        (result: any) => {
          console.log(result)
          this.dataSource.data = result.data
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.count_course = result.data.length
          return
        }
      )
    }
  }

  get_course_by_inst_id(inst_for_all: any) {
    const instformdata = new FormData()
    instformdata.append('inst_id', inst_for_all)
    this.service.get_course_by_inst_id(instformdata).subscribe(
      (result: any) => {
        console.log(result)
        this.dataSource.data = result.data
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.count_course = result.data.length
      }
    )
  }
  add_course() {
    this.dailog.open(AddEditCourseComponent, {
      disableClose: true,
      panelClass:'all_dialog'
    });
  }
  course_edit(row: any) {
    this.dailog.open(AddEditCourseComponent, {
      data: row,
      disableClose: true
    });
  }
  course_delete(row: any) {
    const dialogRef = this.dailog.open(ConfirmBoxComponent, {
      data: this.deletevalue,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (this.deletevalue == result) {
        const deldata = new FormData();
        deldata.append('course_id', row.course_id);
        this.service.course_delete(deldata).subscribe(
          (res: any) => {
            console.log(res)
            this.popup.success({ detail: 'Success', summary: 'Course Deleted', })
            this.router.navigate(['/institutehome/course']);
          }
        )
      }
      else { }
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  toggle(event: MatSlideToggleChange, row: any) {
    if (event.checked == true) {
      const courseedit = new FormData()
      courseedit.append('status', '1')
      courseedit.append('course_id', row.course_id)
      this.service.course_status_manage(courseedit).subscribe(
        (res: any) => {
          console.log(res)
        }
      ) 
    }

    if (event.checked == false) {
      const courseedit = new FormData()
      courseedit.append('status', '0')
      courseedit.append('course_id', row.course_id)
      this.service.course_status_manage(courseedit).subscribe(
        (res: any) => {
          console.log(res)
        }
      )
    }
    
  }
}