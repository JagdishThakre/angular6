import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarEventTitleFormatter
} from 'angular-calendar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  month(event: CalendarEvent): string {
    return `Title : ${event.title} <br> <span class="cal-event" style="background-color: rgb(173, 33, 33);"></span> Description: ${event.desc}`;
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
   providers: [{
    provide: CalendarEventTitleFormatter,
    useClass: CustomEventTitleFormatter
  }]
})
export class AppComponent implements OnInit {
  title = 'googleDemo';
  @ViewChild('modalContent')
  modalContent: TemplateRef<any>;
  eventForm: FormGroup;
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = false;
  localEvents: any[] = JSON.parse(localStorage.getItem("events"));
  constructor(private modal: NgbModal, private formBuilder: FormBuilder) {
    if (this.localEvents) {
      this.localEvents.map(item => {
        item.start = startOfDay(item.start);
        item.end = endOfDay(item.end);
        this.events.push(item);
      })
    }
  }

  ngOnInit() {
    this.eventForm = this.formBuilder.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      start: ['', [Validators.required]],
      end: ['', [Validators.required]]
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    if (this.eventForm.valid) {
      let data = {
        title: this.eventForm.value.title,
        desc: this.eventForm.value.desc,
        start: startOfDay(this.eventForm.value.start),
        end: endOfDay(this.eventForm.value.end),
        color: colors.red,
        draggable: false,
        resizable: {
          beforeStart: false,
          afterEnd: false
        }
      }
      this.events.push(data);
      this.refresh.next();
      let localData = JSON.parse(localStorage.getItem("events"));
      if (localData) {
        localData.push(data)
        localStorage.setItem("events", JSON.stringify(localData));
      } else {
        localStorage.setItem("events", JSON.stringify([data]))
      }
      this.eventForm.reset();
    }
  }
}
