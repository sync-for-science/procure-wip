# Procure

## Overview

Procure is an open source, web based application that enables users to retrieve their clinical data from their healthcare providers, browse the data, download it as structured files in [JSON FHIR format](https://hl7.org/fhir), download a subset of the data in Excel or CSV format, and upload the data to a public or private [Github](https://github.com) repository. Patients can use the app to review their medical records for accuracy, perform analysis to obtain insights, or share their information with a research project. Unlike many apps that retrieve medical data, such as Apple Health, Procure does not store or interpret the data, instead acting as a conduit to empower patients with direct access to their raw data. Future releases will incorporate functionality for researchers to more directly integrate with the software.

The app can connect to any healthcare provider that has an electronic health record system supporting the [SMART-on-FHIR specification](https://smarthealthit.org) which currently includes most sites in the United States that use the [Epic EHR](https://epic.com). Many providers that use other EHR vendors are expected to deploy this connectivity later this year. 

Developers can also use the app to test SMART on FHIR servers, or demonstrate the capabilities of these servers.

You can follow the instructions below to run a local copy of the app on your machine and retrieve data from test sandboxes. However, to access real medical data (even your own), you'll need to use a publicly hosted copy of the app, or host the app yourself at a public web URL that supports "HTTPS". If you host the app yourself, you'll also need to register the URL where it's posted with the systems you intend to connect to (see the Registering Procure section below for guidance).

Procure is compatible with the latest versions of Google Chrome, IE Edge, Safari and Firefox. 

**Note that as early stage software, Procure has bugs. If you run into an issue, please review the "issues" tab on Github and, if the problem isn't listed, open a new issue ticket to let us know! Also, if you're a software developer and are able to fix the code, git pull requests are very welcome, but please get in touch before coding large changes.**

## Installing and Running Procure

Procure runs entirely as a web page in the user's browser and can be hosted from any web server that can serve static html, CSS, and javascript files (such as Amazon S3, Heroku, or even Github pages). Once the code is more stable, we may provide pre-complied releases, however, currently you can download and build the app using the following steps.

1. Install prerequisites
	- [Git](https://git-scm.com/downloads)
	- [NodeJs](https://nodejs.org)
	- [cURL](https://curl.haxx.se/)

2. Clone this repository and install dependencies
	```
	git clone [github path]/procure
	cd procure
	curl https://open.epic.com/MyApps/EndpointsJson -o ./public/config/epic_endpoints.json
	npm i
	```

3. Start the Procure development server  
	```
	npm run start
	```

## Building and Deploying Procure

Before deploying Procure, you'll probably want to register your deployment URL with EHR vendors and update the Procure configuration. See the relevant sections below.

To build a production version of Procure, run the following command from the Procure directory `npm run build`. This will create (or update) a `build` sub-directory containing files that you can copy to your web server.

## Registering Procure with EHR Vendors

### Epic

Visit https://open.epic.com and navigate to the My Apps > Create App item in the top menu bar (you'll need to register and verify your identity first). Complete the create app form, making sure that the `Redirect Url` field is set to the URL where you'll be hosting Procure followed by `/callback.html` (eg. `https://example.com/callback.html`). Once approved, Epic will generate a `client id` value for your instance of the app. You'll want to add this value to the `public/config-override.json` file in Procure, so it looks something like this:

```json
{
	"credentials": {
		"epic": {"clientId": "YOUR CLIENT ID HERE"}
	}
}
```

## Configuring Procure

Much of Procure's functionality can be customized by changing or overriding values in its configuration file. These parameters are described in the sections below and there are examples of the parameters in the app's [default configuration file](public/config/config.json). 

### Overriding Configuration Properties

You can modify Procure's settings by altering values in the `public/config.json` file. However, this file may be updated in new releases of Procure, requiring you to re-apply your changes. A better approach is to override specific configuration properties by adding them to the `public/config-overrides.json` file, which is unique to your Procure deployment. When Procure is run in development mode, the file `public/config-overrides-dev.json` is loaded instead. 

The root structure in the `overrides.json` or `overrides-dev.json` file must be a JSON object. At runtime, the properties of this object are merged with those in the `config.json` file. Additional properties will be added, and altered values will be replaced. For example, to change the title of the `Argonaut (Epic)` query profile, you would create the following object in your override file that mirrors the structure of the config file, setting a new title property. None of the other properties in the object hierarchy will be altered.

```json
{
	"queryProfiles": {
		"argonaut_epic": {
			"title": "Epic EHR"
		}
	}
}
```

Sometimes you may wish to replace the object associated with a property entirely instead of merging properties. To do this, prefix the property name with an underscore in the override object. The following example replaces all of the queries in the `argonaut_epic` query profile with the single query from the override file.

```json
{
	"queryProfiles": {
		"argonaut_epic": {
			"_queries": [{
				"resourcePath": "Patient/{{patientId}}",
				"retrieveReferences": "careProvider"
			}]
		}
	}
}
```

### Root Configuration Parameters

| Property | Type | Description | 
| --- | --- | --- |
| `credentials` | object | SMART on FHIR OAuth credentials that can be referenced by id from one or more endpoints defined in the `endpointList` configuration item. The property names of the object are credential ids and the values are objects with a `clientId` and, optionally, a `clientSecret` property. |
| `mimeTypeMappings` | object | Specifies how to convert the mime types of downloaded attachments into file names. The property names of the object are mime type strings, and the values are file extension strings. |
| `dateSortElements` | object | Defines which fields in each FHIR ResourceType are used when ordering the resources for a user to browse in Procure's UI. Each property name is a FHIR ResourceType, with a value that's an array of FHIR elements. These are evaluated in order, and the first element name that exists is used as the sort date for a resource. All resources fall back to their FHIR `lastUpdated` date if no clinically relevant date is found. |
| `endpointLists` | object | Populates the list of organizations a user can select from in Procure. The property names of the object are endpoint list ids and the values are endpoint list item objects. See [details below](#endpoint-lists). |
| `warnOnPageNavigate` | boolean | If set to true, a dialog box will be shown when a user tries to navigate away from the Procure webpage without first exporting modified settings. |
| `redirectUri` | string | Advanced - overrides the redirectUri Procure builds based on the page URL. You probably don't need to change this. |
| `queryProfiles` | object | Defines the set of queries Procure runs against a FHIR server to download FHIR resources. The supported FHIR resources and search parameters vary by vendor and creating tailored query profiles for different endpoints accommodates this. The property names of the object are query profile ids and the values are query profile objects. See [details below](#query-profiles). |
| `ignoreState` | boolean | Advanced - if set to `true`, will prevent the validation of the state parameter as part of the OAuth flow. Should never be set to `true` in production deployments. |
| `spreadsheetTemplates` | object | Defines transforms to "flatten" FHIR Resources and represent them as spreadsheets. Drives the items that appear in the "Export as Spreadsheet" menu in Procure. The property names of the object are spreadsheet template ids and the values are template objects . See [details below](#spreadsheet-templates). |


### Endpoint Lists 

Endpoint list files populate the entries in Procure's `organizations` list that shows when a user adds a provider in the app. At runtime, users can also add a *custom organization* that is not included in a directory file, or override the default properties of any of these endpoints. 

Epic makes a directory file available at `https://open.epic.com/MyApps/EndpointsJson` that is included in Procure's `public` directory as `epic_endpoints.json`. You can update this file at any time by running `scripts/update_epic_endpoints.sh` from the command line. Procure also includes a directory  of test sandboxes in a file named `sandbox_endpoints.json`. 

Each of these endpoint list files are referenced from the `endpointLists` > `[id]` > `path` property of `config.json`, and you can remove these endpoint lists or add others by altering the `config-override.json` file as described above.

Endpoint list files are structured as an JSON object with a single `Entry` (or `entry`) property that is an array of FHIR endpoints. Each endpoint can have the following properties:

| Property | Type | Description | 
| --- | --- | --- |
| `name` (or `OrganizationName`) | string, required | Displayed in the Procure UI to identify the healthcare organization. |
| `fhirEndpoint` (or `FHIRPatientFacingURI`) | string, required | URL of the provider's FHIR endpoint |
| `queryProfile` | string, optional | Reference to the id of the set of FHIR queries to retrieve data from this provider that are defined in the `queryProfile` configuration item. |
| `isOpen` | boolean, optional | Whether the endpoint requires authentication for access. Will be `true` for all production endpoints, may be `false` for sandbox environments. |
| `credentialId` | string | Reference to the id of an object that's defined in the `credentials` configuration item, containing the client id (and optionally client secret) for this provider. |
| `scope` | array of strings | The SMART-on-FHIR scopes for this endpoint. Ignored for open endpoints.|
| `patient` | string | FHIR id of  patient to retrieve. Ignored for secure endpoints. |
| `clientId` | string | OAuth client_id for the endpoint. Ignored for open endpoints. Will override a clientId referenced through the `credentialId` property. |
| `clientSecret` | string | OAuth client_secret for the endpoint. Ignored for open endpoints and not applicable to many secure endpoints. Will override a clientId referenced through the `credentialId` property. |

Default values for these properties may be included in the `config` or `config-override` files in the `endpointLists` > `[id]` > `defaults` object, however, properties in the endpoint list files will take precedence.

### Query Profiles

Query Profiles defines the set of FHIR endpoints and parameters that Procure uses to retrieve an entire patient record. The FHIR capabilities exposed by each vendor vary, so in general, each vendor will need a custom query profile. Additionally, query profiles can be used to restrict the data retrieved to a subset of a patient's record (for example, by only querying Observations with a category of "vital-sign" if other data aren't needed).

| Property | Type | Description | 
| --- | --- | --- |
| `title` | string, optional | Informational - useful for administrators reviewing configurations and used in error messages. |
| `fhirVersion` | string, optional | Defaults to `R2`, but values of `R3` and `R4` are also valid. |
| `retryLimit` | integer, optional | Sets how many times Procure retries a single query before failing and reporting an error. Defaults to 0. |
| `queries` | array of query objects | See [details below](#query-object) |  


#### Query Object

| Property | Type | Description | 
| --- | --- | --- |
| `resourcePath` | string, required | Segment appended to the server's FHIR Base URL to create the query URL. Should not have a leading slash. May be a simple resource name or a more complex path that can include a patientId template parameter that will be replaced at runtime (eg. `Patient/{{patientId}}`). |
| `params` | object, optional | Object with properties that are FHIR search parameters. The value for a parameter can be a string or an array of strings. Arrays are converted into a comma delimited string in the FHIR query, representing an "or" structure where there server will respond with matches for any of the values. Parameter values can also incorporate a patientId template parameter. For example, a patient search parameter would be represented as the follow property in the params object: `"patient": "{{patientId}}"`). |
| `retrieveReferences` | string or array of strings, optional | One or more limited FHIR path expressions (only dot delimited segments are supported). If populated, Procure will walk the resources returned by this query, and retrieve any resources referenced at the paths in this parameter, including them in the result set. |
| `containReferences` | string or array of strings, optional | Follows the same logic as `retrieveReferences`, however retrieved resources are embedded as contained resources in the resources that reference them and the reference elements themselves are converted to relative references. Contained references will only be retrieved once, but will be embedded in each resource that references them. |
| `downloadAttachments` | string or array of strings, optional | One or more limited FHIR path expressions (only dot delimited segments are supported). If populated, Procure will walk the resources returned by this query, and retrieve any attachments referenced at the paths in this parameter. Attachments will be named as sequential integers, saved as files, and included in the result set. The file extension appended to each attachment is dictated by the `mimeTypeMappings` configuration item described above. |
| `pageLimit` | integer, optional | Used for testing - do not set in production. If the FHIR response is paginated so that bundles only contain a portion of the result set, this parameter will set the maximum number of subsequent requests to retrieve additional resources in the result set. |

### Spreadsheet Templates

Each property in the spreadsheetTemplates configuration object represents a transformation template that will show up in the app's "Export as Spreadsheet" menu. The property name represents an identifier for the template that can be used when referencing it from other templates. The value is an object with the following properties:

| Property | Type | Description | 
| --- | --- | --- |
| `name` | string, required | Displayed in the Procure UI to identify the template. |
| `sortBy` | array of objects, required | Specifies the sort order for rows in the export. Each object has a `name` property that corresponds to a field name in the template and a `dir` property that can be `asc` for an ascending sort order or `desc` for a descending sort order. Sort objects in the array are applied to the template output in the order they are listed. |
| `extends` | string, optional | Ids (property names) of templates that will be merged with this template (see the Template Inheritance section below) |
| `template` | array of template item objects | Mappings from hierarchical FHIR elements to flat spreadsheet rows. See Spreadsheet Template Item section below. |


### Spreadsheet Template Item

| Property | Type | Description | 
| --- | --- | --- |
| `path` | string or array of strings, required | Limited FHIR path expression (only dot delimited values are supported), or array of such expressions, that identifies the element that will be mapped to a spreadsheet field. Paths that result in an array of values will be spread across multiple rows in the output spreadsheet, with other fields being repeated on each row. If multiple paths are listed, they will be tested in sequence and the first path that results in a value will be used. A path value of `"*"` indicates that the item should match the root of the resource when no other path matches. |
| `name` | string, optional | Column heading for this field. If omitted, field will not be included in output spreadsheet, but can still be used to filter rows. |
| `test` | string, optional | Name of built-in function that is used to evaluate if this row should be included in the output spreadsheet, filtering the row if the test function does not return `true`. See Test Functions section below for available options. |
| `id` | string, optional | Identifier for this field, used for template inheritance. See Template Inheritance below. |
| `transform` | string, optional | Name of built-in function that is used to convert the result of this template item's path expression into the data included in the spreadsheet field. If omitted, field will be populated with the unmodified item. Note that Test Functions are applied to the *untransformed* values. See Transform Functions below for available options. |
| `children` | array of template item objects | Paths for these child template items will be evaluated *relative to this template item's path.* |

### Template Inheritance

If a template has one or more template id values in its `extends` property (described above), the values in the template will be merged onto the values of the referenced templates using the following logic. Items without an id property or with an id property that doesn't match one of an item in one of the template being extended will be appended to the template. Items that do match an id property of another template item will have their properties merged, with properties from the extended template being replaced in the case of two properties with the same name. Template items that include underscore property (eg.`{"_": true}`) will entirely replace any template item with the same id, instead of merging properties.

### Transform functions
- `stringifyCodings` - merges `codings` from a `CodeableConcept` into a space delimited list of `system|code` values.
- `parseDateForExcel` - converts date values into Excel dates rather than leaving them as strings. Dates aren't converted when spreadsheet is downloaded as a CSV.
- `getHelperData` - incorporate metadata values into export populating this field  with the data type specified in the helperDataField property. Currently supports `source` (the provider name that the data is coming from) and `format` (`xlsx` or `csv` export).

### Test functions
- `validateCode` - ensures a code value specified in the template item's `target` property is present in the matched `coding` (or array of codings).
- `validateValue` - ensures the matched value equals the value specified in the template item's `target` property.
- `validateExists` - ensures the path is populated in the FHIR Resource being evaluated.


## Third Party Libraries Used
### Core
- [React](https://reactjs.org/) - UI framework, MIT License
- [Create React App](https://facebook.github.io/create-react-app/) - Build framework, MIT License
- [Storeon](https://github.com/storeon/storeon) - State management, MIT License
### Export
- [ExcelJs](https://github.com/exceljs/exceljs) - Spreadsheet and CSV generation,  MIT License
- [JSZip](https://stuk.github.io/jszip) - Zip generation, MIT License
- [FileSaver](https://github.com/eligrey/FileSaver.js) - Browser file download, MIT License
### UI
- [Font Awesome Free](https://fontawesome.com) - UI icons, MIT License (code), CC BY 4.0 License (icons)
- [React Select](https://react-select.com/home) - Searchable dropdown list, MIT License
- [React JSON Tree](https://github.com/reduxjs/redux-devtools/tree/master/packages/react-json-tree) - Tree widget from Redux Dev Tools, MIT License
- [Reactstrap](https://github.com/reactstrap/reactstrap) - Simple React Bootstrap 4 components, MIT License

### Misc
- [Lodash](https://lodash.com/) - Functional programming utilities, MIT License
- [TV4](https://github.com/geraintluff/tv4) - JSON schema validation, Public Domain License
- [JSON Strip Comments](https://github.com/sindresorhus/strip-json-comments) - MIT License
- [Time Ago](https://timeago.org/) - MIT License
- [Cross Fetch](https://github.com/lquixada/cross-fetch) - MIT License
