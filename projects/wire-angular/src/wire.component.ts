import {Component, AfterViewInit, ElementRef, Input } from '@angular/core';

@Component({  
  selector: '[wire-component]',
  template: ''
})
export class WireComponent implements AfterViewInit  {

  //
  // Input vars are set declaratively on the HTML element
  //

  // same name as compoent
  @Input("wire-component") component!: string;
  // component configuration
  @Input() config?: IWireComponentConfig;

  /*
  * @param element HTML element into which the component is to be rendered
  */  
  constructor(private element: ElementRef) {
  }

  /*
  * Used for auto-binding when using a declarative render
  */    
  ngAfterViewInit() {
    if (this.component && this.config)
      this.render(this.component, this.config);
  }
    
  /*
  * Used to programatically render the component in the HTML container
  * @param component Full string name of component (i.e. wire.bsTable)
  * @param config The component's configuration.  See the documentation for the component for details.
  * @returns The instance of the WireBootstrap component that was rendered
  */    
  render(component: string, config: IWireComponentConfig): IWireComponent | null {

    // create component instance from the full string name
    let cmp = wire.ui.Component.create(component);

    if(cmp)
      return cmp.render(this.element.nativeElement, config);
    else
      return null;

  }

}