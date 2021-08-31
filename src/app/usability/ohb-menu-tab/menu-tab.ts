interface MenuTab {
  name: string;
  id: any;
  active: boolean;
  alias: any
}

export interface MenuTabItems extends Array<MenuTab> {}
