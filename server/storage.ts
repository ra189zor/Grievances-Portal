import { users, grievances, type User, type InsertUser, type Grievance, type InsertGrievance } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllGrievances(): Promise<Grievance[]>;
  getGrievancesByUser(userId: number): Promise<Grievance[]>;
  createGrievance(grievance: InsertGrievance): Promise<Grievance>;
  updateGrievanceStatus(id: number, status: string): Promise<Grievance | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private grievances: Map<number, Grievance>;
  private currentUserId: number;
  private currentGrievanceId: number;

  constructor() {
    this.users = new Map();
    this.grievances = new Map();
    this.currentUserId = 1;
    this.currentGrievanceId = 1;

    // Initialize with predefined accounts
    this.initializeUsers();
  }

  private initializeUsers() {
    const ayeshu: User = {
      id: 1,
      username: 'ayeshu',
      password: 'babygirl',
      name: 'Ayeshu',
      role: 'submitter'
    };

    const abdullah: User = {
      id: 2,
      username: 'abdullah', 
      password: 'abdullah123',
      name: 'Abdullah',
      role: 'viewer'
    };

    this.users.set(1, ayeshu);
    this.users.set(2, abdullah);
    this.currentUserId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllGrievances(): Promise<Grievance[]> {
    return Array.from(this.grievances.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async getGrievancesByUser(userId: number): Promise<Grievance[]> {
    return Array.from(this.grievances.values())
      .filter(grievance => grievance.submittedBy === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async createGrievance(insertGrievance: InsertGrievance): Promise<Grievance> {
    const id = this.currentGrievanceId++;
    const grievance: Grievance = {
      ...insertGrievance,
      id,
      submittedAt: new Date(),
      status: 'new'
    };
    this.grievances.set(id, grievance);
    return grievance;
  }

  async updateGrievanceStatus(id: number, status: string): Promise<Grievance | undefined> {
    const grievance = this.grievances.get(id);
    if (grievance) {
      const updated = { ...grievance, status };
      this.grievances.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getUsersByRole(role: string): Promise<any[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
}

export const storage = new MemStorage();