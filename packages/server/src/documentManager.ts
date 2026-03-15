import { Connection, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DigdagDocument } from "./model/digdagDocument";
import { parse } from "./parser/digdagParser";
import { computeDiagnostics } from "./providers/diagnosticsProvider";

export class DocumentManager {
  private documents = new TextDocuments(TextDocument);
  private parsedDocs = new Map<string, DigdagDocument>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private connection: Connection) {
    this.documents.onDidChangeContent((change) => {
      this.scheduleReparse(change.document);
    });

    this.documents.onDidClose((event) => {
      this.parsedDocs.delete(event.document.uri);
      const timer = this.debounceTimers.get(event.document.uri);
      if (timer) clearTimeout(timer);
      this.debounceTimers.delete(event.document.uri);
      this.connection.sendDiagnostics({
        uri: event.document.uri,
        diagnostics: [],
      });
    });
  }

  listen(connection: Connection): void {
    this.documents.listen(connection);
  }

  getTextDocument(uri: string): TextDocument | undefined {
    return this.documents.get(uri);
  }

  getParsedDocument(uri: string): DigdagDocument | undefined {
    return this.parsedDocs.get(uri);
  }

  parseNow(uri: string): DigdagDocument | undefined {
    const textDoc = this.documents.get(uri);
    if (!textDoc) return undefined;
    const parsed = parse(uri, textDoc.getText());
    this.parsedDocs.set(uri, parsed);
    return parsed;
  }

  private scheduleReparse(textDoc: TextDocument): void {
    const uri = textDoc.uri;
    const existing = this.debounceTimers.get(uri);
    if (existing) clearTimeout(existing);

    this.debounceTimers.set(
      uri,
      setTimeout(() => {
        this.debounceTimers.delete(uri);
        const parsed = parse(uri, textDoc.getText());
        this.parsedDocs.set(uri, parsed);

        const diagnostics = computeDiagnostics(parsed);
        this.connection.sendDiagnostics({ uri, diagnostics });
      }, 200)
    );
  }
}
