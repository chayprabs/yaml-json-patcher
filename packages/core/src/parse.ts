import type { Doc, Format, ParseError } from "./types.js";
import { detectFormat, normalizeFormat } from "./detect.js";
import * as jsonFmt from "./formats/json.js";
import * as yamlFmt from "./formats/yaml.js";
import * as tomlFmt from "./formats/toml.js";
import * as xmlFmt from "./formats/xml.js";

export function parse(input: string, format?: Format): Doc {
  const fmt = normalizeFormat(format) ?? detectFormat(input);
  switch (fmt) {
    case "json": {
      const { ast, json } = jsonFmt.parseJson(input);
      return { format: "json", ast, json };
    }
    case "yaml": {
      const { ast, json } = yamlFmt.parseYaml(input);
      return { format: "yaml", ast, json };
    }
    case "toml": {
      const { ast, json } = tomlFmt.parseToml(input);
      return { format: "toml", ast, json };
    }
    case "xml": {
      const { ast, json } = xmlFmt.parseXml(input);
      return { format: "xml", ast, json };
    }
  }
}

export function serialize(doc: Doc): string {
  return serializeTo(doc, doc.format);
}

/** Serialize document content to a different output format */
export function serializeTo(doc: Doc, targetFormat: Format): string {
  if (doc.format === targetFormat) {
    switch (targetFormat) {
      case "json":
        return jsonFmt.serializeJson(doc.ast as jsonFmt.JsonAst);
      case "yaml":
        return yamlFmt.serializeYaml(doc.ast as yamlFmt.YamlAst);
      case "toml":
        return tomlFmt.serializeToml(doc.ast as tomlFmt.TomlAst);
      case "xml":
        return xmlFmt.serializeXml(doc.ast as xmlFmt.XmlAst);
    }
  }
  switch (targetFormat) {
    case "json": {
      const text = JSON.stringify(doc.json, null, 2);
      return text.endsWith("\n") ? text : `${text}\n`;
    }
    case "yaml": {
      const { ast } = yamlFmt.parseYaml("{}\n");
      return yamlFmt.serializeYaml(yamlFmt.updateYamlJson(ast, doc.json));
    }
    case "toml": {
      const { ast } = tomlFmt.parseToml("");
      return tomlFmt.serializeToml(tomlFmt.updateTomlAst(ast, doc.json as tomlFmt.TomlAst["value"]));
    }
    case "xml": {
      const wrapped = { root: doc.json };
      const { ast } = xmlFmt.parseXml("<root/>");
      return xmlFmt.serializeXml(xmlFmt.updateXmlAst(ast, wrapped));
    }
  }
}

export function validateSyntax(input: string, format?: Format): ParseError[] {
  const fmt = normalizeFormat(format) ?? detectFormat(input);
  switch (fmt) {
    case "json":
      return jsonFmt.validateJson(input);
    case "yaml":
      return yamlFmt.validateYaml(input);
    case "toml":
      return tomlFmt.validateToml(input);
    case "xml":
      return xmlFmt.validateXml(input);
  }
}

export function roundTrip(input: string, format?: Format): string {
  const doc = parse(input, format);
  return serialize(doc);
}

export { detectFormat, normalizeFormat };
