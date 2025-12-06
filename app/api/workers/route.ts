import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Worker } from "@/app/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const WORKERS_FILE = path.join(DATA_DIR, "workers.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readWorkersFile(): Promise<Worker[]> {
  try {
    const raw = await fs.readFile(WORKERS_FILE, "utf-8");
    return JSON.parse(raw) as Worker[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error("Nie udało się odczytać pliku workers.json", error);
    return [];
  }
}

export async function GET() {
  const workers = await readWorkersFile();
  return NextResponse.json(workers);
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Worker[];
    await ensureDataDir();
    await fs.writeFile(WORKERS_FILE, JSON.stringify(payload, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Nie udało się zapisać pliku workers.json", error);
    return NextResponse.json({ error: "Nie udało się zapisać pracowników" }, { status: 500 });
  }
}
