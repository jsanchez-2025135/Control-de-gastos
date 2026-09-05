import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IncomeService } from '../../core/services/income.service';
import { Income } from '../../core/models/income.model';

interface KpiCard {
  icon: 'in' | 'out' | 'coffee' | 'wallet';
  label: string;
  amount: string;
  trend?: string;
  note: string;
  tone: 'green' | 'purple' | 'blue' | 'teal';
}

interface SeriesPoint {
  month: string;
  ingresos: number;
  egresos: number;
  consumos: number;
}

interface ExpenseSlice {
  label: string;
  amount: string;
  percent: number;
  color: string;
}

interface FrequentItem {
  icon: 'coffee' | 'snack' | 'drink' | 'bakery' | 'other';
  label: string;
  amount: string;
  percentOfMax: number;
}

interface Transaction {
  icon: 'in' | 'out' | 'coffee';
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  date: string;
}

interface NavItem {
  icon: 'grid' | 'in' | 'out' | 'coffee' | 'list' | 'chart-pie' | 'chart-bar' | 'bell' | 'user' | 'gear' | 'logout';
  label: string;
  active?: boolean;
  route?: string;
}

/**
 * Vista general del Dashboard.
 * Consume IncomeService para que el KPI de Ingresos, la gráfica mensual y
 * las transacciones recientes queden sincronizados con la base de datos.
 * La gráfica mensual muestra los últimos 6 meses TERMINANDO en el mes
 * actual (no meses fijos), para que el mes en curso siempre aparezca.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  user: ReturnType<AuthService['getUser']>;

  navItems: NavItem[] = [
    { icon: 'grid', label: 'Vista General', active: true, route: '/dashboard' },
    { icon: 'in', label: 'Ingresos', route: '/ingresos' },
    { icon: 'out', label: 'Egresos' },
    { icon: 'coffee', label: 'Pequeños Consumos' },
  ];

  navItemsSecondary: NavItem[] = [
    { icon: 'list', label: 'Transacciones' },
    { icon: 'chart-pie', label: 'Presupuestos' },
  ];

  navItemsTertiary: NavItem[] = [
    { icon: 'chart-bar', label: 'Reportes' },
    { icon: 'bell', label: 'Notificaciones' },
  ];

  navItemsAccount: NavItem[] = [
    { icon: 'user', label: 'Cuenta' },
    { icon: 'gear', label: 'Ajustes' },
  ];

  kpis: KpiCard[] = [
    { icon: 'in', label: 'Ingresos', amount: 'Q 0.00', note: 'Este mes', tone: 'green' },
    { icon: 'out', label: 'Egresos', amount: 'Q 0.00', note: 'Este mes', tone: 'purple' },
    { icon: 'coffee', label: 'Pequeños Consumos', amount: 'Q 0.00', note: 'Este mes', tone: 'blue' },
    { icon: 'wallet', label: 'Saldo Disponible', amount: 'Q 0.00', note: 'Este mes', tone: 'teal' },
  ];

  // Se inicializa con los últimos 6 meses reales (terminando en el mes
  // actual), no con meses fijos "Ene..Jun".
  series: SeriesPoint[] = this.buildMonthlySeries([]);

  expenseDistribution: ExpenseSlice[] = [
    { label: 'Alimentación', amount: 'Q 0.00', percent: 0, color: '#12B5A0' },
    { label: 'Transporte', amount: 'Q 0.00', percent: 0, color: '#5B4FE8' },
    { label: 'Vivienda', amount: 'Q 0.00', percent: 0, color: '#3B82F6' },
    { label: 'Servicios', amount: 'Q 0.00', percent: 0, color: '#8B5CF6' },
    { label: 'Otros', amount: 'Q 0.00', percent: 0, color: '#C084FC' },
  ];

  frequentConsumptions: FrequentItem[] = [];

  transactions: Transaction[] = [];

  private readonly chartWidth = 640;
  private readonly chartHeight = 220;
  private readonly maxValue = 10000;

  private totalEgresosValue = 0;

  get chartPoints() {
    const stepX = this.chartWidth / (this.series.length - 1);
    const toY = (value: number) => this.chartHeight - (value / this.maxValue) * this.chartHeight;

    const build = (key: 'ingresos' | 'egresos' | 'consumos') =>
      this.series.map((point, i) => ({ x: i * stepX, y: toY(point[key]) }));

    const toPath = (points: { x: number; y: number }[]) =>
      points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    const ingresos = build('ingresos');
    const egresos = build('egresos');
    const consumos = build('consumos');

    return {
      width: this.chartWidth,
      height: this.chartHeight,
      ingresosPath: toPath(ingresos),
      egresosPath: toPath(egresos),
      consumosPath: toPath(consumos),
      ingresos,
      egresos,
      consumos,
    };
  }

  get donutGradient(): string {
    const total = this.expenseDistribution.reduce((sum, slice) => sum + slice.percent, 0);
    if (this.expenseDistribution.length === 0 || total === 0) {
      return '#eef0f5';
    }
    let acc = 0;
    const stops = this.expenseDistribution.map((slice) => {
      const start = acc;
      acc += slice.percent;
      return `${slice.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  get totalEgresos(): string {
    return this.formatQ(this.totalEgresosValue);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private incomeService: IncomeService,
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.incomeService.getSummary().subscribe({
      next: (res) => {
        this.applyIncomeData(res.data.incomes, res.data.totalFixed, res.data.totalVariable);
      },
      error: (err) => {
        console.error('Error cargando ingresos en el dashboard', err);
      },
    });
  }

  private applyIncomeData(incomes: Income[], totalFixed: number, totalVariable: number): void {
    const totalIngresos = totalFixed + totalVariable;

    this.kpis = this.kpis.map((kpi, i) => {
      if (i === 0) return { ...kpi, amount: this.formatQ(totalIngresos) };
      if (i === 3) return { ...kpi, amount: this.formatQ(totalIngresos - this.totalEgresosValue) };
      return kpi;
    });

    this.series = this.buildMonthlySeries(incomes);

    const sorted = [...incomes].sort((a, b) => b.date.localeCompare(a.date));
    this.transactions = sorted.slice(0, 5).map((inc) => ({
      icon: 'in',
      title: inc.title,
      subtitle: inc.category,
      amount: '+' + this.formatQ(inc.amount),
      positive: true,
      date: this.formatDate(inc.date),
    }));
  }

  // Construye los últimos 6 meses TERMINANDO en el mes actual (no meses
  // fijos), y suma los ingresos que caen en cada uno.
  private buildMonthlySeries(incomes: Income[]): SeriesPoint[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const months: { label: string; monthIndex: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      months.push({ label: meses[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear() });
    }

    const totalsByKey = new Map<string, number>();
    incomes.forEach((inc) => {
      const [y, m] = inc.date.split('-').map(Number);
      const key = `${y}-${m - 1}`;
      totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + inc.amount);
    });

    return months.map((mo) => ({
      month: mo.label,
      ingresos: totalsByKey.get(`${mo.year}-${mo.monthIndex}`) ?? 0,
      egresos: 0,
      consumos: 0,
    }));
  }

  private formatQ(value: number): string {
    return 'Q ' + value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${Number(d)} ${meses[Number(m) - 1]} ${y}`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}