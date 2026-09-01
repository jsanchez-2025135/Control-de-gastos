import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
}

/**
 * Vista general del Dashboard.
 *
 * HOY: los datos (KPIs, series, transacciones) son mock, hardcodeados aquí
 * mismo, para poder maquetar la vista sin depender del módulo de gastos.
 * MAÑANA: se reemplazan por un ExpenseService que consuma /api/expenses/*,
 * siguiendo el mismo patrón de capas ya usado en auth (Service -> HttpClient).
 * El template no debería necesitar cambios, solo de dónde vienen los arrays.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  user: ReturnType<AuthService['getUser']>;

  navItems: NavItem[] = [
    { icon: 'grid', label: 'Vista General', active: true },
    { icon: 'in', label: 'Ingresos' },
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

  series: SeriesPoint[] = [
    { month: 'Ene', ingresos: 0, egresos: 0, consumos: 0 },
    { month: 'Feb', ingresos: 0, egresos: 0, consumos: 0 },
    { month: 'Mar', ingresos: 0, egresos: 0, consumos: 0 },
    { month: 'Abr', ingresos: 0, egresos: 0, consumos: 0 },
    { month: 'May', ingresos: 0, egresos: 0, consumos: 0 },
    { month: 'Jun', ingresos: 0, egresos: 0, consumos: 0 },
  ];

  // Categorías por defecto: se muestran siempre (en 0) para que la
  // dona y su leyenda mantengan la misma forma que cuando ya hay datos.
  expenseDistribution: ExpenseSlice[] = [
    { label: 'Alimentación', amount: 'Q 0.00', percent: 0, color: '#12B5A0' },
    { label: 'Transporte', amount: 'Q 0.00', percent: 0, color: '#5B4FE8' },
    { label: 'Vivienda', amount: 'Q 0.00', percent: 0, color: '#3B82F6' },
    { label: 'Servicios', amount: 'Q 0.00', percent: 0, color: '#8B5CF6' },
    { label: 'Otros', amount: 'Q 0.00', percent: 0, color: '#C084FC' },
  ];

  frequentConsumptions: FrequentItem[] = [];

  transactions: Transaction[] = [];

  // Construye el "d" del path SVG de las 3 líneas del gráfico mensual,
  // normalizando cada valor a un eje de 0 a 10,000 sobre un lienzo fijo.
  private readonly chartWidth = 640;
  private readonly chartHeight = 220;
  private readonly maxValue = 10000;

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

  // Construye el conic-gradient del donut a partir de los porcentajes.
  // Si no hay egresos registrados todavía (todo en 0%), se muestra un
  // anillo gris neutro en vez de un gradiente con paradas vacías.
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
    return 'Q 0.00';
  }

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
