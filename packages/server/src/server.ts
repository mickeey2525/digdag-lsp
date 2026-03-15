import {
  createConnection,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionParams,
  HoverParams,
  DefinitionParams,
} from "vscode-languageserver/node";
import { DocumentManager } from "./documentManager";
import { computeCompletions } from "./providers/completionProvider";
import { computeHover } from "./providers/hoverProvider";
import { computeDefinition } from "./providers/definitionProvider";

const connection = createConnection(ProposedFeatures.all);
const docManager = new DocumentManager(connection);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: [">", ":", "$", "{", "_", "+"],
      },
      hoverProvider: true,
      definitionProvider: true,
    },
  };
});

connection.onCompletion((params: CompletionParams) => {
  const uri = params.textDocument.uri;
  let parsed = docManager.getParsedDocument(uri);
  if (!parsed) {
    parsed = docManager.parseNow(uri);
  }
  const textDoc = docManager.getTextDocument(uri);
  if (!parsed || !textDoc) return [];

  return computeCompletions(parsed, textDoc, params.position);
});

connection.onHover((params: HoverParams) => {
  const uri = params.textDocument.uri;
  let parsed = docManager.getParsedDocument(uri);
  if (!parsed) {
    parsed = docManager.parseNow(uri);
  }
  const textDoc = docManager.getTextDocument(uri);
  if (!parsed || !textDoc) return null;

  return computeHover(parsed, textDoc, params.position);
});

connection.onDefinition((params: DefinitionParams) => {
  const textDoc = docManager.getTextDocument(params.textDocument.uri);
  if (!textDoc) return null;

  return computeDefinition(textDoc, params.position);
});

docManager.listen(connection);
connection.listen();
