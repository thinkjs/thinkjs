declare class ThinkStoreFile {
  constructor(storePath: string)
  get(relativePath: string): Promise<any>
  set(relativePath: string, content: string): Promise<any>
  delete(relativePath: string): Promise<any>
}

export = ThinkStoreFile;