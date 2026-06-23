export type EstudanteStatus = 'Activo' | 'Inactivo' | 'Empregado';
export type EstudanteNivel  = 'Médio' | 'Universidade';
export type BolsaTipo       = 'Parcial' | 'Integral';
export type BolsaStatus     = 'Activa' | 'Suspensa' | 'Concluída';

export interface Estudante {
  id: string;
  nome: string;
  telefone: string;
  nivel: EstudanteNivel;
  ano_classe: string;
  universidade: string;
  curso: string;
  provincia: string;
  status: EstudanteStatus;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface Bolsa {
  id: string;
  estudante_id: string;
  tipo: BolsaTipo;
  instituicao: string;
  curso: string;
  valor: number | null;
  data_inicio: string;
  data_fim: string | null;
  status: BolsaStatus;
  observacoes: string;
  created_at: string;
  estudante?: Estudante;
}

export type EstudanteInsert = Omit<Estudante, 'id' | 'created_at' | 'updated_at'>;
export type BolsaInsert     = Omit<Bolsa, 'id' | 'created_at' | 'estudante'>;