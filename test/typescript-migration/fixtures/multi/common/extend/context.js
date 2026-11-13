module.exports = { order: 'application', get receiver() { return this.marker; }, set receiver(value) { this.marker = value; }, identity() { return this; } };
