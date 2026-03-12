export interface User {
  id: number;
  name: string;
  staff_id: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  role_id?: number;
  branch_id?: number;
  department_id?: number;
  position_id?: number;
  position?: {
    id: number;
    name: string;
    code: string;
  };
  role?: {
    id: number;
    name: string;
    display_name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
    code: string;
  };
}
