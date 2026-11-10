// Yorumlayıcının ürettiği hata türleri.

/** Derleme hatası: gerçek C# derleyicisinde program hiç çalışmazdı. */
export class CompileError extends Error {
  constructor(code, message, line, col) {
    super(message);
    this.kind = 'compile';
    this.code = code;
    this.line = line;
    this.col = col;
  }
}

/** Yakalanmamış C# exception'ı (çalışma zamanı hatası). */
export class UnhandledException extends Error {
  constructor(exc, line) {
    super(exc.message);
    this.kind = 'runtime';
    this.exc = exc; // CsObject (Exception)
    this.line = line;
  }
}

/** Güvenlik sınırı aşıldı (sonsuz döngü, aşırı özyineleme vb.). */
export class LimitError extends Error {
  constructor(code, message, line) {
    super(message);
    this.kind = 'limit';
    this.code = code;
    this.line = line;
  }
}
