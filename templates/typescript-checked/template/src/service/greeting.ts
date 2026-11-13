export default class GreetingService {
  constructor(private readonly text: string) {}
  message(): string { return this.text; }
}
