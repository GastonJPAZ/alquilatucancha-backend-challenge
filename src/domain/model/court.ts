import { Slot } from "./slot";

export interface Court {
  id: number;
  name: string;
  available: Slot[];
}
