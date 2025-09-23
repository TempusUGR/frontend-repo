import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../services/statistics.service';
import { IcsDownloadsStats, LoginsStats, RegistrationStats } from '../../models/statistics.model';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

@Component({
  selector: 'app-statistics',
  imports: [FormsModule, TitleCasePipe, CommonModule],
  standalone: true,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'], // Usa Tailwind y styles.css global
})
export class StatisticsComponent implements OnInit {
  registrations: RegistrationStats | null = null;
  registrationsPeriod: RegistrationStats | null = null;
  logins: LoginsStats | null = null;
  icsDownloads: IcsDownloadsStats | null = null;

  // Para selects de mes y año
  months = [
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'
  ];
  years: number[] = [];
  selectedMonth: string = this.months[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  registrationsByMonth: { teacher: number[], student: number[] } = { teacher: [], student: [] };
  registrationsChart: Chart | null = null;

  loginsByDay: { teacher: number[], student: number[], all: number[] } = { teacher: [], student: [], all: [] };
  loginsChart: Chart | null = null;

  loginsYearByMonth: number[] = [];
  loginsYearChart: Chart | null = null;
  selectedLoginYearForYear: number = new Date().getFullYear();

  icsDownloadsByDay: number[] = [];
  icsDownloadsChart: Chart | null = null;
  icsDownloadsYearByMonth: number[] = [];
  icsDownloadsYearChart: Chart | null = null;
  selectedIcsYearForYear: number = new Date().getFullYear();

  selectedLoginMonth: string = this.selectedMonth;
  selectedLoginYear: number = this.selectedYear;
  selectedIcsMonth: string = this.selectedMonth;
  selectedIcsYear: number = this.selectedYear;

  constructor(
    private statisticsService: StatisticsService,
    private router: Router
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.loadRegistrations();
    this.loadRegistrationsByYear();
    this.loadLoginsByMonth();
    this.loadLoginsByYear();
    this.loadIcsDownloadsByMonth();
    this.loadIcsDownloadsByYear();
  }

  ngAfterViewInit(): void {
    this.createChart();
    this.createLoginsChart();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Total registrations

  loadRegistrations() {
    this.statisticsService.getRegistrations().subscribe(res => this.registrations = res);
  }

  // Registrations by month for selected year

  async loadRegistrationsByYear() {
    this.registrationsByMonth = { teacher: [], student: [] };
    for (const month of this.months) {
      const res = await this.statisticsService.getRegistrationsPeriod(month, month, this.selectedYear).toPromise();
      if (res) {
        this.registrationsByMonth.teacher.push(res.teacher);
        this.registrationsByMonth.student.push(res.student);
      } else {
        this.registrationsByMonth.teacher.push(0);
        this.registrationsByMonth.student.push(0);
      }
    }
    this.updateChart();
  }

  createChart() {
    const ctx = document.getElementById('registrationsChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.registrationsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.months.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
        datasets: [
          {
            label: 'Profesores',
            data: this.registrationsByMonth.teacher,
            backgroundColor: 'rgba(184, 45, 42, 0.7)',
          },
          {
            label: 'Estudiantes',
            data: this.registrationsByMonth.student,
            backgroundColor: 'rgba(228, 175, 174, 0.7)',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  updateChart() {
    if (this.registrationsChart) {
      this.registrationsChart.data.datasets[0].data = this.registrationsByMonth.teacher;
      this.registrationsChart.data.datasets[1].data = this.registrationsByMonth.student;
      this.registrationsChart.update();
    } else {
      this.createChart();
    }
  }

  // Logins by day for selected month and year

  async loadLoginsByMonth() {
    const res = await this.statisticsService.getLoginsByMonth(this.selectedLoginMonth, this.selectedLoginYear).toPromise();
    if (res && res.teacher && res.student) {
      const days = Object.keys(res.teacher).map(Number).sort((a, b) => a - b);
      this.loginsByDay.teacher = days.map(day => res.teacher[day]);
      this.loginsByDay.student = days.map(day => res.student[day]);
      this.loginsByDay.all = days.map(day => (res.teacher[day] || 0) + (res.student[day] || 0));
      this.updateLoginsChart(days);
    } else {
      this.loginsByDay.teacher = [];
      this.loginsByDay.student = [];
      this.loginsByDay.all = [];
      this.updateLoginsChart([]);
    }
  }

  createLoginsChart() {
    const ctx = document.getElementById('loginsChart') as HTMLCanvasElement;
    if (!ctx) return;
    const days = Array.from({ length: 31 }, (_, i) => i + 1); // Máximo 31 días
    this.loginsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days.map(d => `Día ${d}`),
        datasets: [
          {
            label: 'Profesores',
            data: [],
            backgroundColor: 'rgba(184, 45, 42, 0.7)',
          },
          {
            label: 'Estudiantes',
            data: [],
            backgroundColor: 'rgba(228, 175, 174, 0.7)',
          },
          {
            label: 'Todos',
            data: [],
            backgroundColor: 'rgba(100, 100, 100, 0.3)',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  updateLoginsChart(days: number[]) {
    if (this.loginsChart) {
      this.loginsChart.data.labels = days.map(d => `Día ${d}`);
      this.loginsChart.data.datasets[0].data = this.loginsByDay.teacher;
      this.loginsChart.data.datasets[1].data = this.loginsByDay.student;
      this.loginsChart.data.datasets[2].data = this.loginsByDay.all;
      this.loginsChart.update();
    } else {
      this.createLoginsChart();
    }
  }

  // Logins by year for selected year

  async loadLoginsByYear() {
    this.loginsYearByMonth = [];
    for (const month of this.months) {
      const res = await this.statisticsService.getLoginsByMonth(month, this.selectedLoginYearForYear).toPromise();
      // Suma todos los días de profesores y estudiantes
      const teacherSum = res && res.teacher ? Object.values(res.teacher).reduce((a, b) => a + b, 0) : 0;
      const studentSum = res && res.student ? Object.values(res.student).reduce((a, b) => a + b, 0) : 0;
      this.loginsYearByMonth.push(teacherSum + studentSum);
    }
    this.updateLoginsYearChart();
  }

  updateLoginsYearChart() {
    const ctx = document.getElementById('loginsYearChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.loginsYearChart) {
      this.loginsYearChart.data.labels = this.months.map(m => m.charAt(0).toUpperCase() + m.slice(1));
      this.loginsYearChart.data.datasets[0].data = this.loginsYearByMonth;
      this.loginsYearChart.update();
    } else {
      this.loginsYearChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.months.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
          datasets: [
            {
              label: 'Logins totales',
              data: this.loginsYearByMonth,
              backgroundColor: 'rgba(100, 100, 100, 0.5)'
            }
          ]
        },
        options: { responsive: true, plugins: { legend: { position: 'top' } } }
      });
    }
  }

  // Total ics downloads for selected month and year

  async loadIcsDownloadsByMonth() {
    const res = await this.statisticsService.getIcsDownloadsByMonth(this.selectedIcsMonth, this.selectedIcsYear).toPromise();
    const days = res ? Object.keys(res).map(Number).sort((a, b) => a - b) : [];
    this.icsDownloadsByDay = res ? days.map(day => res[day]) : [];
    if (this.icsDownloadsChart) {
      this.icsDownloadsChart.data.labels = days.map(d => `Día ${d}`);
      this.icsDownloadsChart.data.datasets[0].data = this.icsDownloadsByDay;
      this.icsDownloadsChart.update();
    } else {
      this.createIcsDownloadsChart(days, this.icsDownloadsByDay);
    }
  }

  createIcsDownloadsChart(days: number[], data: number[]) {
    const ctx = document.getElementById('icsDownloadsChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.icsDownloadsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days.map(d => `Día ${d}`),
        datasets: [
          {
            label: 'Descargas ICS',
            data: data,
            backgroundColor: 'rgba(100, 100, 100, 0.5)'
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    });
  }

  async loadIcsDownloadsByYear() {
    this.icsDownloadsYearByMonth = [];
    for (const month of this.months) {
      const res = await this.statisticsService.getIcsDownloadsByMonth(month, this.selectedIcsYearForYear).toPromise();
      const total = Object.values(res ?? {}).reduce((a, b) => a + b, 0);
      this.icsDownloadsYearByMonth.push(total);
    }
    this.updateIcsDownloadsYearChart();
  }

  updateIcsDownloadsYearChart() {
    const ctx = document.getElementById('icsDownloadsYearChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.icsDownloadsYearChart) {
      this.icsDownloadsYearChart.data.labels = this.months.map(m => m.charAt(0).toUpperCase() + m.slice(1));
      this.icsDownloadsYearChart.data.datasets[0].data = this.icsDownloadsYearByMonth;
      this.icsDownloadsYearChart.update();
    } else {
      this.icsDownloadsYearChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.months.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
          datasets: [
            {
              label: 'Descargas ICS totales',
              data: this.icsDownloadsYearByMonth,
              backgroundColor: 'rgba(100, 100, 100, 0.5)'
            }
          ]
        },
        options: { responsive: true, plugins: { legend: { position: 'top' } } }
      });
    }
  }

  // PDF generation
  downloadPdfReport() {
    const doc = new jsPDF();

    const logoImg = new Image();
    logoImg.src = 'assets/logo.png';

    logoImg.onload = () => {
      doc.addImage(logoImg, 'PNG', 14, 8, 18, 18);

      doc.setFontSize(18);
      doc.setTextColor(184, 45, 42);
      doc.text('Reporte de estadísticas TempusUGR', 36, 20);

      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);

      let y = 40;

      // Registrations summary
      const totalRegistrations = (this.registrations?.teacher !== undefined && this.registrations?.student !== undefined)
        ? this.registrations.teacher + this.registrations.student
        : '-';
      doc.text('Usuarios registrados: ' + totalRegistrations, 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [['Profesores', 'Estudiantes']],
        body: [[
          this.registrations?.teacher ?? '-',
          this.registrations?.student ?? '-'
        ]],
        headStyles: { fillColor: [184, 45, 42], textColor: 255 },
        theme: 'grid',
        styles: { halign: 'center' }
      });

      // Registrations by month
      let afterTable = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 20;
      doc.text(`Histórico de registros (${this.selectedYear}):`, 14, afterTable);
      autoTable(doc, {
        startY: afterTable + 2,
        head: [['Mes', 'Profesores', 'Estudiantes']],
        body: this.months.map((m, i) => [
          m.slice(0, 3).toUpperCase(),
          this.registrationsByMonth.teacher[i] ?? '-',
          this.registrationsByMonth.student[i] ?? '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [184, 45, 42], textColor: 255 },
        styles: { halign: 'center' }
      });

      // Logins by month
      afterTable = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : afterTable + 20;
      doc.text(`Logins totales por mes (${this.selectedLoginYearForYear}):`, 14, afterTable);
      autoTable(doc, {
        startY: afterTable + 2,
        head: [['Mes', 'Logins']],
        body: this.months.map((m, i) => [
          m.slice(0, 3).toUpperCase(),
          this.loginsYearByMonth[i] ?? '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [184, 45, 42], textColor: 255 },
        styles: { halign: 'center' }
      });

      doc.addPage();
      let yIcs = 20;
      doc.text(`Descargas ICS por mes (${this.selectedIcsYearForYear}):`, 16, yIcs);
      autoTable(doc, {
        startY: yIcs + 2,
        head: [['Mes', 'Descargas']],
        body: this.months.map((m, i) => [
          m.slice(0, 3).toUpperCase(),
          this.icsDownloadsYearByMonth[i] ?? '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [184, 45, 42], textColor: 255 },
        styles: { halign: 'center' }
      });

      doc.save('reporte-tempusugr.pdf');
    };
  }

}
