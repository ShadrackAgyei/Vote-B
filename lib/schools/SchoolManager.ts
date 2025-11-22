// School/Tenant management for multi-tenant support

export interface School {
  id: string;
  name: string;
  code?: string; // School code/abbreviation
  domain?: string; // Email domain (e.g., "school.edu")
  createdAt: number;
}

export class SchoolManager {
  private static SCHOOLS_KEY = 'vote_b_schools';
  private static CURRENT_SCHOOL_KEY = 'vote_b_current_school';

  // Create or get a school
  static createSchool(name: string, code?: string, domain?: string): School {
    if (typeof window === 'undefined') {
      throw new Error('SchoolManager can only be used in browser');
    }

    const schools = this.getAllSchools();
    
    // Check if school with same name exists
    let school = schools.find(s => s.name.toLowerCase() === name.toLowerCase());
    
    if (school) {
      return school;
    }

    // Create new school
    const newSchool: School = {
      id: `school-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      code,
      domain,
      createdAt: Date.now(),
    };

    schools.push(newSchool);
    this.saveSchools(schools);

    return newSchool;
  }

  static getAllSchools(): School[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.SCHOOLS_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getSchool(id: string): School | null {
    const schools = this.getAllSchools();
    return schools.find(s => s.id === id) || null;
  }

  static setCurrentSchool(schoolId: string | null): void {
    if (typeof window === 'undefined') return;

    if (schoolId) {
      localStorage.setItem(this.CURRENT_SCHOOL_KEY, schoolId);
    } else {
      localStorage.removeItem(this.CURRENT_SCHOOL_KEY);
    }
  }

  static getCurrentSchool(): School | null {
    if (typeof window === 'undefined') return null;

    const schoolId = localStorage.getItem(this.CURRENT_SCHOOL_KEY);
    if (!schoolId) return null;

    return this.getSchool(schoolId);
  }

  static getCurrentSchoolId(): string | null {
    const school = this.getCurrentSchool();
    return school?.id || null;
  }

  private static saveSchools(schools: School[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.SCHOOLS_KEY, JSON.stringify(schools));
  }

  // Check if email belongs to school domain
  static validateSchoolEmail(email: string, school: School): boolean {
    if (!school.domain) return true; // No domain restriction

    const normalizedEmail = email.toLowerCase().trim();
    return normalizedEmail.endsWith(`@${school.domain}`);
  }

  // Clear all schools (for testing)
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SCHOOLS_KEY);
    localStorage.removeItem(this.CURRENT_SCHOOL_KEY);
  }
}
