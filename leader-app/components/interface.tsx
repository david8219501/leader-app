export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
  }

export interface ShiftAssignment {
  employeeId: string;
  date: string;
  shift: string;
  index: number;
}

export interface Shifts {
    sunday1: ShiftAssignment[];
    sunday2: ShiftAssignment[];
    sunday3: ShiftAssignment[];
    sunday4: ShiftAssignment[];
    sunday5: ShiftAssignment[];
    sunday6: ShiftAssignment[];
    sunday7: ShiftAssignment[];
    sunday8: ShiftAssignment[];
    sunday9: ShiftAssignment[];
    monday1: ShiftAssignment[];
    monday2: ShiftAssignment[];
    monday3: ShiftAssignment[];
    monday4: ShiftAssignment[];
    monday5: ShiftAssignment[];
    monday6: ShiftAssignment[];
    monday7: ShiftAssignment[];
    monday8: ShiftAssignment[];
    monday9: ShiftAssignment[];
    tuesday1: ShiftAssignment[];
    tuesday2: ShiftAssignment[];
    tuesday3: ShiftAssignment[];
    tuesday4: ShiftAssignment[];
    tuesday5: ShiftAssignment[];
    tuesday6: ShiftAssignment[];
    tuesday7: ShiftAssignment[];
    tuesday8: ShiftAssignment[];
    tuesday9: ShiftAssignment[];
    wednesday1: ShiftAssignment[];
    wednesday2: ShiftAssignment[];
    wednesday3: ShiftAssignment[];
    wednesday4: ShiftAssignment[];
    wednesday5: ShiftAssignment[];
    wednesday6: ShiftAssignment[];
    wednesday7: ShiftAssignment[];
    wednesday8: ShiftAssignment[];
    wednesday9: ShiftAssignment[];
    thursday1: ShiftAssignment[];
    thursday2: ShiftAssignment[];
    thursday3: ShiftAssignment[];
    thursday4: ShiftAssignment[];
    thursday5: ShiftAssignment[];
    thursday6: ShiftAssignment[];
    thursday7: ShiftAssignment[];
    thursday8: ShiftAssignment[];
    thursday9: ShiftAssignment[];
    friday1: ShiftAssignment[];
    friday2: ShiftAssignment[];
    friday3: ShiftAssignment[];
}
