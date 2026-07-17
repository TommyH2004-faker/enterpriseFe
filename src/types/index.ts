export interface Department {
  id: number | string;
  name: string;
  manager: string;
  employees: number;
  projects: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Employee {
  id: number | string;
  name: string;
  email: string;
  department: string;
  role: string;
  access: 'Admin' | 'Manager' | 'Employee';
  status: 'Active' | 'Inactive';
  joinDate: string;
}

export interface Project {
  id: number | string;
  name: string;
  status: 'Đang làm' | 'Đóng' | 'Lưu trữ';
  description: string;
  progress: number;
  members: number;
  tasks: number;
  dueDate: string;
  manager: string;
}

export interface Label {
  text: string;
  color: string;
}

export interface Task {
  id: string;
  content: string;
  description: string;
  priority: 'Khẩn cấp' | 'Cao' | 'Trung bình' | 'Thấp';
  assignee: string;
  dueDate: string;
  comments: number;
  attachments: number;
  labels: Label[];
  isOverdue?: boolean;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color: string;
  headerBg: string;
}
