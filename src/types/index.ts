export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DashboardStats {
  totalUsers: number;
  todayMessages: number;
  monthMessages: number;
}

export interface ReportData {
  id: string;
  date: string;
  message: string;
  user: string;
  status: string;
}
