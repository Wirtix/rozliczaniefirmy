import { NextRequest, NextResponse } from 'next/server';
import { addEmployee, readEmployees } from '../../lib/employees';

export async function GET() {
  const employees = await readEmployees();
  employees.sort((a, b) => a.full_name.localeCompare(b.full_name, 'pl')); 
  return NextResponse.json({ employees });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const full_name = (data.full_name || '').trim();
  const address = (data.address || '').trim();
  const identifier = (data.identifier || '').trim();

  if (!full_name || !address || !identifier) {
    return NextResponse.json({ error: 'Uzupełnij wszystkie pola' }, { status: 400 });
  }

  const employee = await addEmployee({ full_name, address, identifier });
  return NextResponse.json({ employee }, { status: 201 });
}
