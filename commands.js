#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const yaml = require("js-yaml");
const jsonSchemaGenerator = require('json-schema-generator');

const template = fs.readFileSync(path.join(__dirname, './templates/basic.yaml'), "utf8");

/**
 * @function  [createOAS]
 * @returns {int} Result Status: 0 (OK)
 */
const createOAS = (oasFileName, ResourceSampleFileName, resourceName, idPropertyName) => {
    console.log("Creating " + oasFileName + "...");
    console.log("  - Sample File: '" + ResourceSampleFileName + "'");
    console.log("  - Resource name: '" + resourceName + "'");
    console.log("  - idPropertyName: '" + idPropertyName + "'");

    var parameters = {};

    parameters.resource = resourceName;
    parameters.Resource = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    parameters.resources = parameters.resource + "s";
    parameters.Resources = parameters.Resource + "s";

    parameters.resourceId = idPropertyName;
    var theYaml = yaml.load(fs.readFileSync(ResourceSampleFileName));
    var list = [];
    for ( let key in theYaml ){
        let value = theYaml[key];
        let map = {};
        map.key = key;
        map.value = value;
        list.push(map);
    }
    parameters.data = list;
    var output = mustache.render(template, parameters);

    // Fix for moustache problem with path parameters 
    output = output.replace(/_#{#_/g, "{");
    output = output.replace(/_#}#_/g, "}");

    var oas = yaml.load(output);

    //const resourceSchema = jsonSchemaGenerator(yaml.load(fs.readFileSync(ResourceSampleFileName)));
    //const resourceSchema = jsonSchemaGenerator(theYaml);

    // Fix to remove "$schema" attribute in order to have compatibility with oas-generator OAS schema
    //delete resourceSchema.$schema;

    // Empty description
    //delete resourceSchema.description;

    //oas.components.schemas[resourceName] = resourceSchema;

    output = yaml.safeDump(oas);

    // Fix to remove string unneeded ' on Open API 3.0.0
    output = output.replace(/'/g, "").replace(/#[A-z/]+/g, (x) => "'" + x + "'");

    fs.writeFileSync(oasFileName, output, 'utf8');

    console.log("Done.");

};

module.exports = {createOAS};
