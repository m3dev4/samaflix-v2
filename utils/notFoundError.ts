export class NotFoundError extends Error {
  constructor(reason?: string) {
    super(
      `Samadlix n'arrive pas a trouver un flux ${reason ? `: ${reason}` : ""}`,
    );
    this.name = "NotFoundError";
  }
}
