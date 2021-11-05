
//
// Data model for the sample JSON records
//
class SampleData {

    public Product: string | undefined;
    public Customer: string | undefined;
    public Promotion: string | undefined;
    public OrderDate: string | undefined;
    public Cost: number | undefined;
    public Sales: number | undefined;

}

//
// Data sourc created from sample JSON data file using the 
//  local data connector
// Also sets up a data model for numeric field formatting
//
const sampleDataSource = new wire.data.DataSource("local", {
    Provider: { 
        Json: {url: "./app/sample/data/sample-data.json" } 
    },
    Model: new wire.data.DataModel({
        Fields: [
            { Entity: "SampleData", Name: "Sales", Format: "C0" },
            { Entity: "SampleData", Name: "Cost", Format: "C0" }
        ]
    })
});    

export { SampleData, sampleDataSource }