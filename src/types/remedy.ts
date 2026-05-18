export interface RemedyParameters {
  energia: number;
  dispersion: number;
  repeticion: number;
  inestabilidad: number;
  densidad: number;
  simetria: number;
}

export interface Remedy {
  id: string;
  name: string;
  latinName: string;
  family: string;
  shortDescription: string;
  parameters: RemedyParameters;
}
