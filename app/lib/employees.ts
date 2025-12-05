import fs from 'fs/promises';
import path from 'path';

export type Employee = {
  id: number;
  full_name: string;
  address: string;
  identifier: string;
};

const EMPLOYEES_PATH = path.join(process.cwd(), 'data', 'employees.json');

async function ensureStore() {
  const dir = path.dirname(EMPLOYEES_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(EMPLOYEES_PATH);
  } catch {
    await fs.writeFile(EMPLOYEES_PATH, '[]', 'utf-8');
  }
}

export async function readEmployees(): Promise<Employee[]> {
  await ensureStore();
  const raw = await fs.readFile(EMPLOYEES_PATH, 'utf-8');
  return JSON.parse(raw) as Employee[];
}

export async function addEmployee(input: Omit<Employee, 'id'>): Promise<Employee> {
  const employees = await readEmployees();
  const nextId = employees.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const employee: Employee = { id: nextId, ...input };
  employees.push(employee);
  await fs.writeFile(EMPLOYEES_PATH, JSON.stringify(employees, null, 2), 'utf-8');
  return employee;
}

export async function findEmployee(id: number): Promise<Employee | undefined> {
  const employees = await readEmployees();
  return employees.find((emp) => emp.id === id);
}
