import { Component } from '@angular/core';
import { SampleDataService } from '../data/sample-data-service';

@Component({
  selector: 'example1',
  templateUrl: './example1.component.html',
  providers: [SampleDataService]
})
export class Example1Component  {

  //
  // Bring in an instance of the data service containing the sample dataset
  //
  constructor(private data: SampleDataService) {    
  } 
 
  //
  // The configuration for the component uses the sample dataset
  // This variable is referenced as an attribute in the HTML element used to render the component
  //
  public myConfig: IWireComponentConfig = {    
    data: this.data.dataset    
  }
  
  
}