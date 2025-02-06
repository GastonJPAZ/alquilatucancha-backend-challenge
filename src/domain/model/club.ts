import { Court } from "./court";

export interface Club {
  id: number;
  name: string;
  location: string;
  courts: Court[];
}
