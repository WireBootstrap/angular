import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { WireComponent } from '@wirebootstrap/wire-angular';
import { SampleDataService } from '../data/sample-data-service';

@Component({
  selector: 'example2',
  templateUrl: './example2.component.html',
  providers: [SampleDataService]
})
export class Example2Component implements AfterViewInit {

  //
  // HTML container element reference
  //
  @ViewChild('table') table!: ElementRef;

  //
  // Bring in an instance of the data service containing the sample dataset
  //
  constructor(private data: SampleDataService) {    
  }

  ngAfterViewInit() {
 
    // The configuration for the component uses the sample dataset   
    const config: IWireComponentConfig = {
      data: this.data.dataset 
    };
  
    // Returns a bound instance of wire.bsTable
    const cmp = new WireComponent(this.table).render("wire.bsTable", config);

  }

}