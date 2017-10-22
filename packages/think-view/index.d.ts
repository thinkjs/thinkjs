declare module 'thinkjs' {
  interface Controller {
    /**
     * assign one value
     * @memberOf ViewExtend
     */
    assign(name: string, value: any): void;
    /**
     * multiple value assign
     * @memberOf ViewExtend
     */
    assign(value: object): void;
    /**
     * get assigned value by name
     * @memberOf ViewExtend
     */
    assign(name: string): any;

    /**
     * get all assigned value
     * @memberOf ViewExtend
     */
    assign(): any;
    render(file?: string, config?: object | string): Promise<string>;
    display(file?: string, config?: object | string): Promise<any>;

    /**
     * display base on current controller and action
     *
     * @memberOf ViewExtend
     */
    display(): Promise<any>;
  }
}

declare namespace ThinkView {}

export = ThinkView;