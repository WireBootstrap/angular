import { Injectable } from '@angular/core';
import {sampleDataSource}  from './sample-data';

@Injectable()
export class SampleDataService {
    
  //
  // Set up a dataset selecting fields from the top 5 sample records based on the Sales field
  //
  public dataset = new wire.data.DataSet({
    Source: sampleDataSource,
    Query: wire.data.select("Product", "OrderMonth", "Sales").top(5).orderBy("Sales")
  });

}