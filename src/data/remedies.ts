import type { Remedy } from '../types/remedy';

export const remedies: Remedy[] = [
  {
    id: 'agaricus-muscarius',
    name: 'Agaricus muscarius',
    latinName: 'Amanita muscaria',
    family: 'Fungi',
    shortDescription: 'Perfil de alta movilidad, impulsos variables y patrones de vibración dispersa.',
    parameters: {
      energia: 86,
      dispersion: 78,
      repeticion: 42,
      inestabilidad: 88,
      densidad: 54,
      simetria: 46,
    },
  },
  {
    id: 'alumina',
    name: 'Alumina',
    latinName: 'Aluminium oxydatum',
    family: 'Mineral',
    shortDescription: 'Perfil mineral de baja velocidad aparente, estructura profunda y ritmo sostenido.',
    parameters: {
      energia: 44,
      dispersion: 32,
      repeticion: 76,
      inestabilidad: 28,
      densidad: 82,
      simetria: 68,
    },
  },
  {
    id: 'antimonium-crudum',
    name: 'Antimonium crudum',
    latinName: 'Stibium sulfuratum nigrum',
    family: 'Mineral',
    shortDescription: 'Perfil compacto con densidad marcada, contraste fuerte y repetición ornamental.',
    parameters: {
      energia: 62,
      dispersion: 48,
      repeticion: 68,
      inestabilidad: 52,
      densidad: 74,
      simetria: 84,
    },
  },
];
