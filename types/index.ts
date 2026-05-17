export type UserRole = 'admin' | 'viewer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type VehicleType = 'sedan' | 'suv' | 'pickup' | 'van' | 'truck' | 'motorcycle' | 'otro'
export type VehicleStatus = 'activo' | 'en_reparacion' | 'baja' | 'disponible'
export type VtvStatus = 'vigente' | 'por_vencer' | 'vencida'

export interface Vehicle {
  id: string
  interno: string | null
  plate: string
  vehicle_name: string
  model: string
  driver: string | null
  titular: string
  type: VehicleType
  flota: string | null
  llave: string | null
  titulo: string | null
  status: VehicleStatus
  motor: string | null
  chasis: string | null
  vtv: string | null
  vtv_status?: VtvStatus | null
  vtv_dias_restantes?: number | null
  created_at: string
  updated_at: string
}

export type ExpenseCategory =
  | 'combustible'
  | 'mantenimiento'
  | 'reparacion'
  | 'seguro'
  | 'patente'
  | 'lavado'
  | 'neumaticos'
  | 'otro'

export interface Expense {
  id: string
  vehicle_id: string
  vehicle?: Vehicle
  category: ExpenseCategory
  amount: number
  date: string
  description: string | null
  mechanic_name: string | null
  workshop_name: string | null
  invoice_number: string | null
  mileage_at_expense: number | null
  created_by: string
  created_by_profile?: Profile
  created_at: string
  updated_at: string
}

export interface VehicleFile {
  id: string
  vehicle_id: string
  expense_id: string | null
  file_name: string
  file_key: string
  file_url: string
  file_size: number
  file_type: string
  uploaded_by: string
  uploaded_by_profile?: Profile
  created_at: string
}
